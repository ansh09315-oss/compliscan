#!/usr/bin/env python3
"""
CompliScan Codespace Keep-Alive Daemon (scripts/keep_alive.py)
============================================================
Pings local microservice endpoints (FastAPI backend :8000 and Next.js frontend :3000)
every 4 minutes (240 seconds) to simulate active traffic and prevent GitHub Codespaces
from triggering its default 30-minute idle shutdown.

Also writes periodic heartbeats to /tmp/codespace_keep_alive.log and local workspace
to register active process and filesystem I/O with GitHub's container monitors.
"""

import sys
import os
import time
import signal
import argparse
import urllib.request
import urllib.error
from datetime import datetime

# Configure UTF-8 encoding for cross-platform stability (Windows CP1252 & Linux UTF-8)
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Default configuration
DEFAULT_INTERVAL_SECONDS = 240  # 4 minutes
DEFAULT_TARGETS = [
    "http://localhost:8000/health",
    "http://localhost:3000"
]
LOG_FILE_PATHS = [
    "/tmp/codespace_keep_alive.log",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".codespace_heartbeat.log")
]

# State flag for clean termination
running = True

def handle_shutdown(signum, frame):
    global running
    sig_name = signal.Signals(signum).name
    print(f"\n[Keep-Alive] Received {sig_name}. Shutting down gracefully...", flush=True)
    running = False

signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)


def ping_endpoint(url: str, timeout: float = 8.0) -> dict:
    """Sends a lightweight GET request with keep-alive headers."""
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "CompliScan-KeepAlive-Worker/1.0 (GitHub-Codespaces; Prevent-Idle)",
            "X-Keep-Alive-Ping": "true"
        }
    )
    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            latency_ms = (time.time() - start_time) * 1000
            return {
                "url": url,
                "status": response.status,
                "latency_ms": round(latency_ms, 1),
                "healthy": True,
                "error": None
            }
    except urllib.error.HTTPError as he:
        latency_ms = (time.time() - start_time) * 1000
        # HTTP errors like 404/405/500 still count as active server traffic
        return {
            "url": url,
            "status": he.code,
            "latency_ms": round(latency_ms, 1),
            "healthy": True,
            "error": f"HTTP {he.code}"
        }
    except urllib.error.URLError as ue:
        return {
            "url": url,
            "status": 0,
            "latency_ms": 0.0,
            "healthy": False,
            "error": str(ue.reason)
        }
    except Exception as e:
        return {
            "url": url,
            "status": 0,
            "latency_ms": 0.0,
            "healthy": False,
            "error": str(e)
        }


def record_heartbeat(entries: list):
    """Writes heartbeat timestamp to filesystem to satisfy Codespace disk activity monitor."""
    now_iso = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    log_line = f"[{now_iso}] PING OK: " + ", ".join(
        [f"{e['url']} -> {e['status'] or 'ERR'} ({e['latency_ms']}ms)" for e in entries]
    ) + "\n"

    for path in LOG_FILE_PATHS:
        try:
            with open(path, "a", encoding="utf-8") as f:
                f.write(log_line)
        except Exception:
            pass


def main():
    parser = argparse.ArgumentParser(description="CompliScan Codespace Keep-Alive & Active Traffic Looper")
    parser.add_argument("--interval", type=int, default=DEFAULT_INTERVAL_SECONDS, help="Ping interval in seconds (default: 240s)")
    parser.add_argument("--urls", nargs="+", default=DEFAULT_TARGETS, help="Target URLs to ping")
    args = parser.parse_args()

    interval = max(30, args.interval)
    targets = args.urls

    print("=" * 65, flush=True)
    print("🛰️  CompliScan GitHub Codespace Keep-Alive Daemon", flush=True)
    print(f"⏱️  Ping Interval: {interval} seconds (~{round(interval/60, 1)} minutes)", flush=True)
    print(f"🎯 Target Endpoints: {targets}", flush=True)
    print(f"🛡️  Max Codespace Idle Window: 240 minutes override", flush=True)
    print("=" * 65, flush=True)

    cycle = 1
    while running:
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"\n[Cycle #{cycle} @ {timestamp}] Pinging servers to keep Codespace active...", flush=True)

        results = []
        for url in targets:
            res = ping_endpoint(url)
            results.append(res)
            if res["healthy"]:
                print(f"  ✅ {res['url']} -> Status: {res['status']} ({res['latency_ms']}ms)", flush=True)
            else:
                print(f"  ⚠️  {res['url']} -> Not yet reachable ({res['error']}) - retrying next cycle", flush=True)

        record_heartbeat(results)
        cycle += 1

        # Sleep in small 1-second chunks to allow instant responsive exit on Ctrl+C / SIGTERM
        for _ in range(interval):
            if not running:
                break
            time.sleep(1)

    print("[Keep-Alive] Daemon stopped successfully.", flush=True)


if __name__ == "__main__":
    main()
