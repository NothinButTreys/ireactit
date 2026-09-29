#!/usr/bin/env bash
# Regenerates the Linux visual baselines in the same Playwright image CI uses.
# node_modules lives in a named volume so the host's macOS native binaries are untouched.
set -euo pipefail
docker run --rm --ipc=host -v "$PWD":/work -v ireactit_nm:/work/node_modules -w /work \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -lc "corepack enable && CI=true pnpm install --frozen-lockfile && pnpm build && pnpm exec playwright test tests/visual --project=chromium --project=mobile --update-snapshots"
