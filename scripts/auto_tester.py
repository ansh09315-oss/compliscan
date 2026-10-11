#!/usr/bin/env python3
"""
CompliScan Browser Automation Bot (scripts/auto_tester.py)
=========================================================
Playwright automation script for CompliScan Tri-Core Pipeline:
1. Automatically launches a real Google Chrome instance (or bundled Chromium fallback).
2. Navigates to the local web application URL (default: http://localhost:3000).
3. Monitors the browser console, uncaught page exceptions, and network requests in real-time.
4. Keeps the session active indefinitely with zero-CPU heartbeat, leaving the browser open
   so the tester can manually select and input test packaging photos from their local gallery.
"""

import sys
import os
import time
import signal
import argparse

# Reconfigure stdout/stderr for Windows UTF-8 console output
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page, Error as PlaywrightError

DEFAULT_URL = os.environ.get("APP_URL", "http://localhost:3000")
is_running = True


def handle_sigint(signum, frame):
    global is_running
    print("\n\n[AutoTester] Received shutdown signal (Ctrl+C). Closing browser session...", flush=True)
    is_running = False

signal.signal(signal.SIGINT, handle_sigint)
signal.signal(signal.SIGTERM, handle_sigint)


def setup_console_and_network_monitoring(page: Page):
    """Hooks into all browser console events, page exceptions, and network calls."""

    def on_console_message(msg):
        msg_type = msg.type.upper()
        text = msg.text

        # Highlight critical errors
        if msg_type in ("ERROR", "ASSERT"):
            print(f"🚨 [BROWSER CONSOLE ERROR] {text}", flush=True)
            if "AI vision not extracted" in text or "Extraction failed" in text:
                print("   ⚠️  [ALERT] Detected VLM extraction failure in browser UI!", flush=True)
        elif msg_type == "WARNING":
            # Filter non-critical React hydration/favicon warnings
            if "favicon" not in text and "Download the React DevTools" not in text:
                print(f"⚠️  [BROWSER CONSOLE WARN]  {text}", flush=True)
        elif "CompliScan" in text or "VLM" in text or "Inspection" in text:
            print(f"ℹ️  [BROWSER SCAN LOG]     {text}", flush=True)

    def on_page_error(err):
        print(f"🔥 [BROWSER UNCAUGHT EXCEPTION] {err}", flush=True)

    def on_request_failed(request):
        print(f"❌ [NETWORK REQUEST FAILED] {request.method} {request.url} -> {request.failure}", flush=True)

    def on_response(response):
        if "/api/v1/inspection/scan" in response.url:
            status = response.status
            if 200 <= status < 300:
                print(f"🎉 [INSPECTION SCAN API SUCCESS] HTTP {status} from {response.url}", flush=True)
            else:
                print(f"⚠️  [INSPECTION SCAN API WARNING] HTTP {status} from {response.url}", flush=True)

    page.on("console", on_console_message)
    page.on("pageerror", on_page_error)
    page.on("requestfailed", on_request_failed)
    page.on("response", on_response)


def launch_browser(p, prefer_chrome: bool = True) -> tuple[Browser, BrowserContext, Page]:
    """Launches Google Chrome with fallback to bundled Chromium."""
    browser = None
    if prefer_chrome:
        try:
            print("🚀 Attempting to launch installed Google Chrome...", flush=True)
            browser = p.chromium.launch(
                channel="chrome",
                headless=False,
                args=[
                    "--start-maximized",
                    "--disable-infobars",
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox"
                ]
            )
            print("✅ Google Chrome launched successfully.", flush=True)
        except PlaywrightError as pe:
            print(f"⚠️  Google Chrome channel not available ({pe.message.splitlines()[0]}). Falling back to bundled Chromium...", flush=True)

    if browser is None:
        print("🚀 Launching bundled Playwright Chromium...", flush=True)
        browser = p.chromium.launch(
            headless=False,
            args=[
                "--start-maximized",
                "--disable-infobars",
                "--no-sandbox"
            ]
        )
        print("✅ Bundled Chromium launched successfully.", flush=True)

    context = browser.new_context(
        no_viewport=True,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 CompliScanTester/1.0"
    )
    page = context.new_page()
    return browser, context, page


def attempt_navigation_with_retry(page: Page, url: str, max_retries: int = 5, retry_interval: float = 3.0):
    """Navigates to the local URL with retries if the server is still compiling."""
    for attempt in range(1, max_retries + 1):
        try:
            print(f"🌐 Navigating to {url} (Attempt {attempt}/{max_retries})...", flush=True)
            page.goto(url, wait_until="domcontentloaded", timeout=20000)
            print(f"✅ Successfully loaded {url} (Title: '{page.title()}')", flush=True)
            return True
        except Exception as e:
            if attempt < max_retries:
                print(f"⚠️  Server at {url} not ready yet ({e}). Waiting {retry_interval}s before retry...", flush=True)
                time.sleep(retry_interval)
            else:
                print(f"❌ Could not navigate to {url} after {max_retries} attempts: {e}", flush=True)
                return False


def auto_advance_login_if_present(page: Page):
    """Detects Screen01Login and automatically logs in if the officer portal button is visible."""
    try:
        # Wait briefly for potential hydration
        page.wait_for_timeout(1200)
        login_btn = page.query_selector("button:has-text('Enter Legal Metrology Portal'), button:has-text('Authenticate Officer'), button:has-text('Login')")
        if login_btn:
            print("🔑 Detected Officer Login portal screen. Automatically authenticating...", flush=True)
            login_btn.click()
            page.wait_for_timeout(1000)
            print("✅ Successfully advanced past Login screen into inspection workspace.", flush=True)
    except Exception as e:
        logger_err = str(e).splitlines()[0] if str(e) else ""
        print(f"ℹ️  Login bypass notice: {logger_err}", flush=True)


def main():
    parser = argparse.ArgumentParser(description="CompliScan Playwright Browser Automation Bot")
    parser.add_argument("--url", default=DEFAULT_URL, help="App URL to open (default: http://localhost:3000)")
    parser.add_argument("--auto-advance", action="store_true", default=True, help="Auto-click login button if present")
    args = parser.parse_args()

    app_url = args.url

    print("=" * 70, flush=True)
    print("🤖  COMPLISCAN TRI-CORE BROWSER AUTOMATION BOT (PLAYWRIGHT)", flush=True)
    print(f"🎯  Target Application URL: {app_url}", flush=True)
    print("👁️   Console & Network Telemetry: Real-time interception active", flush=True)
    print("📸  Testing Mode: Interactive Gallery / Multi-Angle Image Selection", flush=True)
    print("=" * 70, flush=True)

    with sync_playwright() as p:
        browser, context, page = launch_browser(p, prefer_chrome=True)
        setup_console_and_network_monitoring(page)

        # Navigate to web application
        nav_ok = attempt_navigation_with_retry(page, app_url)
        if not nav_ok:
            print("\n⚠️  TIP: Make sure your Next.js frontend is running: `npm run dev`", flush=True)

        if args.auto_advance and nav_ok:
            auto_advance_login_if_present(page)

        print("\n" + "#" * 70, flush=True)
        print("🖥️  BROWSER SESSION IS ACTIVE & READY FOR MANUAL TESTING!", flush=True)
        print("👉 You can now interact with the UI, select test photos from your", flush=True)
        print("   local gallery, upload them into the 4-panel view, and observe scans.", flush=True)
        print("📊 All browser console logs, VLM responses, and network events will", flush=True)
        print("   stream directly to this terminal below.", flush=True)
        print("⌨️  Press Ctrl+C in this terminal whenever you want to close the session.", flush=True)
        print("#" * 70 + "\n", flush=True)

        # Heartbeat loop keeping session open and responsive
        heartbeat_count = 0
        while is_running:
            try:
                # Check if user closed the browser window manually
                if page.is_closed():
                    print("\n[AutoTester] Browser window was closed by user. Exiting...", flush=True)
                    break

                # Sleep in 1-second increments so playwright processes browser messages
                page.wait_for_timeout(1000)
                heartbeat_count += 1

                # Periodic heartbeat output every 60 seconds
                if heartbeat_count % 60 == 0:
                    current_url = page.url
                    print(f"💓 [Heartbeat {round(heartbeat_count/60)}m] Session active at {current_url}", flush=True)

            except Exception as e:
                # Page closed or interrupted
                break

        print("\n[AutoTester] Cleaning up browser context...", flush=True)
        try:
            context.close()
            browser.close()
        except Exception:
            pass
        print("✅ Auto-Tester bot terminated cleanly.", flush=True)


if __name__ == "__main__":
    main()
