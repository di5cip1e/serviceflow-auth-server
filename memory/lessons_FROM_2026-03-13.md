# Lessons Learned - Week of March 13, 2026

## Bug Fixes (March 12)
1. **Phaser asset loading:** External assets (rosebud.ai) returning 404 caused game to hang in preload()
   - Root cause: External URL assets don't exist
   - Fix: Use procedural graphics via Phaser's Graphics API
   - Added fallback texture generation in create() method

## Key Insights
1. **Asset loading best practices:** Always verify external URLs exist before using them in production
2. **Phaser fallback strategy:** Can generate textures programmatically using Graphics API as fallback
3. **Game hang debugging:** When Phaser hangs on intro/loading screen, check Console tab for 404 errors

## Project Status
- TRAP: Phaser fix deployed, GitHub Pages updated with touch controls + title screen
- APK: Ready at /root/trap_v1.apk