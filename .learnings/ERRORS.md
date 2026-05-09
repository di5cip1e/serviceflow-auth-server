# Errors

Command failures, exceptions, and unexpected issues logged for debugging.

**Areas**: frontend | backend | infra | tests | docs | config
**Statuses**: pending | in_progress | resolved | wont_fix

---

## [ERR-20260311-001] audio_upload

**Logged**: 2026-03-11T04:15:00Z
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
Audio files not arriving via Telegram bot upload

### Error
Audio files sent to bot don't appear in workspace - directories remain empty

### Context
- Tried uploading SFX, music, ambient audio files
- Files show as sent on Telegram but no inbound media
- Possibly Telegram bot API limitation or upload still in progress

### Suggested Fix
- Wait for upload completion
- Use file hosting service
- Direct file path if available

### Metadata
- Reproducible: unknown
- Related Files: projects/trap/audio/*/

---