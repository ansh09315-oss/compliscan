#!/usr/bin/env python3
"""Convenience root wrapper for scripts/keep_alive.py"""
import os
import sys

target = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts", "keep_alive.py")
if os.path.exists(target):
    with open(target, "r", encoding="utf-8") as f:
        code = f.read()
    exec(compile(code, target, "exec"))
else:
    print(f"Error: Could not locate {target}")
    sys.exit(1)
