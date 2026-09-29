#!/usr/bin/env bash
# CI only: compares tests/visual against the Linux baselines inside the same Playwright image
# that renders them (see visual-update.sh). Reuses the job's Linux node_modules and dist/.
# With BASE_URL set it tests that deployment; otherwise Playwright starts `pnpm preview`.
set -euo pipefail
docker run --rm --ipc=host -v "$PWD":/work -w /work \
  -e CI -e BASE_URL -e VERCEL_AUTOMATION_BYPASS_SECRET -e PW_VISUAL=1 \
  -e PLAYWRIGHT_HTML_OUTPUT_DIR=playwright-report-visual -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -c "corepack enable && pnpm exec playwright test tests/visual --project=chromium --project=mobile"
