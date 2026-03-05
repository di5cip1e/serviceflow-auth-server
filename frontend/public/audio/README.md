# Battle Audio Files

This directory contains audio assets for the Station Command battle system.

## Required Files

Place the following OGG audio files here:

### battle.ogg
- **Type:** Battle loop music
- **Specs:** 130-160 BPM, intense, driving rhythm
- **Duration:** Looping (infinite)
- **Notes:** Should be energetic and maintain tension during combat

### victory.ogg
- **Type:** Victory fanfare
- **Specs:** Triumphant, celebratory
- **Duration:** 8-20 seconds
- **Notes:** Should feel rewarding and conclusive

### defeat.ogg
- **Type:** Game over / defeat sound
- **Specs:** Somber, disappointing
- **Duration:** 3-10 seconds
- **Notes:** Should convey failure without being too harsh

## Format Requirements

- **Format:** OGG (best for web, good compression with quality)
- **Sample Rate:** 44.1kHz recommended
- **Channels:** Stereo
- **Bit Depth:** 16-bit minimum, 24-bit preferred

## Sources

Consider these options for obtaining battle music:
- **Free:** Open Game Art, Incompetech (Kevin MacLeod)
- **Licensed:** Epidemic Sound, Artlist (check licenses for commercial use)
- **Custom:** Hire a composer or use AI music generators

## Technical Notes

The BattleAudioManager expects these files at:
- `/audio/battle.ogg`
- `/audio/victory.ogg`
- `/audio/defeat.ogg`

If files are missing, the system will log warnings but continue to function without audio.
