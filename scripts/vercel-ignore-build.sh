#!/usr/bin/env bash
set -euo pipefail

# Vercel Ignored Build Step
# Exit 0 = skip build, Exit 1 = proceed with build
#
# Skip full redeploy when ONLY content/reviews markdown files changed.
# Content updates are handled by on-demand revalidation instead.

if ! git rev-parse HEAD^ >/dev/null 2>&1; then
  exit 1
fi

changed_files="$(git diff --name-only HEAD^ HEAD)"

if [ -z "$changed_files" ]; then
  exit 1
fi

non_content_changes="$(echo "$changed_files" | grep -Ev '^content/reviews/' || true)"

if [ -z "$non_content_changes" ]; then
  echo "Only content/reviews changed — skipping Vercel full rebuild."
  echo "Trigger /api/revalidate via GitHub Actions instead."
  exit 0
fi

exit 1
