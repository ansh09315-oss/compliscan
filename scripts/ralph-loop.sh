#!/usr/bin/env bash
# RALPH Autonomous Loop (Bash)
# Stages: Read -> Act -> Learn/Test -> Patch -> Halt
set -e

MAX_ITERATIONS=${1:-5}
mkdir -p .ralph/logs

echo "=========================================================="
echo "  Starting RALPH Autonomous Agent Verification Loop (Bash) "
echo "=========================================================="

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  echo "--- [RALPH Loop] Iteration $i of $MAX_ITERATIONS ---"

  echo "[Stage 1] TypeScript type-check..."
  if ! npx tsc --noEmit > .ralph/logs/tsc.log 2>&1; then
    echo "❌ TypeScript failed. Log saved to .ralph/logs/tsc.log"
    cat .ralph/logs/tsc.log | head -n 20
    continue
  fi

  echo "[Stage 2] ESLint..."
  npm run lint -- --fix > .ralph/logs/lint.log 2>&1 || true

  echo "[Stage 3] Build..."
  if ! npm run build > .ralph/logs/build.log 2>&1; then
    echo "❌ Build failed. Log saved to .ralph/logs/build.log"
    cat .ralph/logs/build.log | head -n 20
    continue
  fi

  echo "🎉 [RALPH Loop HALT] All stages passed!"
  exit 0
done

echo "❌ Max iterations reached."
exit 1
