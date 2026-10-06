# hdl-social-pipeline
GitHub Actions posts HDL quote cards on Bluesky, Tumblr and Pinterest at 12:00 and 19:00 ET using logins (Playwright), not API keys.
- `content/YYYY-MM-DD.json` holds the day's quotes and captions (midday, evening).
- Cards render fresh each run with `scripts/hdl_card.py`.
- Secrets: BSKY_USER/PASS, TUMBLR_USER/PASS, PINTEREST_USER/PASS (repo Settings > Secrets).
- Manual run: Actions > HDL post slot > Run workflow (dry_run=true logs in, screenshots, posts nothing).
