#!/usr/bin/env bash
# Stores the Poe API key server-side only: in .env.local (git-ignored, for
# `npm run dev`) and as a Vercel production environment variable.
set -e
cd "$(dirname "$0")/.."
read -r -s -p "Paste your Poe API key (it stays hidden), then press Enter: " KEY
echo
# Terminals can wrap pastes in escape codes; keep only the sk-poe-... token.
KEY="$(printf %s "$KEY" | LC_ALL=C sed $'s/\x1b\[[0-9;?]*[ -/]*[@-~]//g; s/\x1b.//g' | grep -oE 'sk-poe-[A-Za-z0-9_-]+' | head -1 || true)"
[ -n "$KEY" ] || { echo "No sk-poe-... key found in what was pasted."; exit 1; }
touch .env.local
grep -v '^POE_API_KEY=' .env.local > .env.local.tmp || true
echo "POE_API_KEY=$KEY" >> .env.local.tmp
mv .env.local.tmp .env.local
echo "Saved to .env.local. Uploading to Vercel..."
printf %s "$KEY" | npx -y vercel env add POE_API_KEY production --force
echo "Done. The key is in .env.local and in Vercel (production)."
