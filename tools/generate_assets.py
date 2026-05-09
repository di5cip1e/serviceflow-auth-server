#!/usr/bin/env python3
"""Generate combat assets via DALL-E for the Trap game."""

import os
import sys
import json
import requests
from pathlib import Path

# Force unbuffered output
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', buffering=1)

# Load API key
with open("/root/.openclaw/secrets.json") as f:
    secrets = json.load(f)
api_key = secrets["openai_api_key"]

OUTPUT_BASE = Path("/root/.openclaw/workspace/projects/trap/assets")

def generate_image(prompt: str, filename: str) -> bool:
    """Generate an image via DALL-E and save it."""
    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "dall-e-3",
        "prompt": prompt,
        "size": "1024x1024",
        "quality": "standard",
        "n": 1
    }
    
    print(f"Generating: {filename}")
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=120)
        response.raise_for_status()
        result = response.json()
        
        image_url = result["data"][0]["url"]
        
        # Download the image
        img_response = requests.get(image_url, timeout=120)
        img_response.raise_for_status()
        
        # Save the image
        filepath = OUTPUT_BASE / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)
        filepath.write_bytes(img_response.content)
        
        print(f"  ✓ Saved: {filepath}")
        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

# Define all assets to generate
assets = []

# === COMBAT UI ===
ui_prompts = [
    ("ui/combat/combat-frame.png", "Dark gritty combat UI frame background, underworld crime aesthetic, dark gray and black with subtle rust orange accents, pixel art style, game UI panel"),
    ("ui/combat/hp-bar-player.png", "Health bar UI element for player, dark panel with red gradient fill, gritty game UI, pixel art style, 48x48 icon"),
    ("ui/combat/hp-bar-enemy.png", "Enemy health bar UI, dark panel with red gradient fill, intimidating style, pixel art, game UI element"),
    ("ui/combat/xp-bar.png", "Experience bar UI, dark panel with yellow amber gradient fill, level indicator, gritty game UI, pixel art style"),
    ("ui/combat/health-potion.png", "Health potion icon, worn bottle with red liquid, grungy style, pixel art game icon, underworld aesthetic"),
    ("ui/combat/run-button.png", "Run escape button icon, footprints or door, dark grungy button, pixel art game UI, danger aesthetic"),
    ("ui/combat/damage-numbers.png", "Damage numbers style popup, bold red numbers, impact effect, pixel art game text effect"),
    ("ui/combat/victory-screen.png", "Victory screen background, dark with gold trophy and celebratory amber glow, gritty underworld style, game over UI"),
    ("ui/combat/defeat-screen.png", "Defeat screen background, dark with red accent, skull or grave icon, gritty failure UI, game over screen"),
]

assets.extend(ui_prompts)

# === ENEMY SPRITES ===
enemy_prompts = [
    ("sprites/enemies/thug-idle.png", "Pixel art sprite, street thug enemy, side view, idle stance, gritty underworld aesthetic, dark clothing, 48x48"),
    ("sprites/enemies/thug-attack.png", "Pixel art sprite, street thug attacking, punching motion, side view, gritty underworld, 48x48"),
    ("sprites/enemies/thug-hurt.png", "Pixel art sprite, street thug hurt, pain expression, side view, gritty underworld, 48x48"),
    ("sprites/enemies/thug-defeat.png", "Pixel art sprite, street thug defeated, fallen on ground, side view, gritty underworld, 48x48"),
    ("sprites/enemies/gangster-idle.png", "Pixel art sprite, gangster enemy, armed with gun, side view, idle stance, gritty underworld, 48x48"),
    ("sprites/enemies/gangster-attack.png", "Pixel art sprite, gangster shooting, gun raised, side view, gritty underworld, 48x48"),
    ("sprites/enemies/gangster-hurt.png", "Pixel art sprite, gangster hurt, wounded, side view, gritty underworld, 48x48"),
    ("sprites/enemies/gangster-defeat.png", "Pixel art sprite, gangster defeated, fallen, side view, gritty underworld, 48x48"),
    ("sprites/enemies/enforcer-idle.png", "Pixel art sprite, heavy enforcer enemy, muscular build, side view, idle stance, intimidating, 48x48"),
    ("sprites/enemies/enforcer-attack.png", "Pixel art sprite, enforcer powerful swing, big fist, side view, gritty underworld, 48x48"),
    ("sprites/enemies/enforcer-hurt.png", "Pixel art sprite, enforcer hurt, pain expression, side view, gritty underworld, 48x48"),
    ("sprites/enemies/enforcer-defeat.png", "Pixel art sprite, enforcer defeated, fallen down, side view, gritty underworld, 48x48"),
    ("sprites/enemies/boss-idle.png", "Pixel art sprite, boss enemy, large imposing figure, side view, idle stance, very intimidating, 64x64"),
    ("sprites/enemies/boss-attack.png", "Pixel art sprite, boss attacking, powerful strike, side view, gritty underworld, 64x64"),
    ("sprites/enemies/boss-hurt.png", "Pixel art sprite, boss hurt, angry expression, side view, gritty underworld, 64x64"),
    ("sprites/enemies/boss-defeat.png", "Pixel art sprite, boss defeated, huge figure fallen, side view, gritty underworld, 64x64"),
]

assets.extend(enemy_prompts)

# === SKILL ICONS ===
skill_prompts = [
    ("sprites/skills/intuition-lockpick.png", "Skill icon, lockpick tool, pixel art, gritty game icon, underworld aesthetic, 48x48"),
    ("sprites/skills/intuition-street-sense.png", "Skill icon, compass or eye, street sense ability, pixel art, game UI icon, 48x48"),
    ("sprites/skills/intuition-sneak.png", "Skill icon, hooded figure sneaking, pixel art, stealth ability, game icon, 48x48"),
    ("sprites/skills/intuition-intimidate.png", "Skill icon, scary face or threat gesture, pixel art, intimidation ability, game icon, 48x48"),
    ("sprites/skills/intuition-shadow-walk.png", "Skill icon, shadowy figure walking, stealth ability, pixel art, game icon, 48x48"),
    ("sprites/skills/intuition-deadly-precision.png", "Skill icon, crosshair or targeting reticle, deadly precision, pixel art, game icon, 48x48"),
    ("sprites/skills/ability-iron-fist.png", "Skill icon, fist or punch, iron fist ability, pixel art, combat icon, game UI, 48x48"),
    ("sprites/skills/ability-toughness.png", "Skill icon, shield or armor, toughness ability, pixel art, defensive icon, game UI, 48x48"),
    ("sprites/skills/ability-power-strike.png", "Skill icon, powerful sword slash or impact, power strike, pixel art, game icon, 48x48"),
    ("sprites/skills/ability-last-stand.png", "Skill icon, last warrior standing, last stand ability, pixel art, game icon, 48x48"),
    ("sprites/skills/ability-berserk.png", "Skill icon, angry face or fury, berserk ability, pixel art, rage icon, game UI, 48x48"),
    ("sprites/skills/ability-unbreakable.png", "Skill icon, unbreakable shield or diamond, unbreakable ability, pixel art, game icon, 48x48"),
    ("sprites/skills/luck-fast-talk.png", "Skill icon, talking mouth or dialogue, fast talk ability, pixel art, social icon, game UI, 48x48"),
    ("sprites/skills/luck-lucky-break.png", "Skill icon, four-leaf clover or star, lucky break ability, pixel art, fortune icon, game UI, 48x48"),
    ("sprites/skills/luck-card-shark.png", "Skill icon, playing cards, card shark ability, pixel art, gambling icon, game UI, 48x48"),
    ("sprites/skills/luck-escape-artist.png", "Skill icon, chained hands or escaped prisoner, escape artist, pixel art, game icon, 48x48"),
    ("sprites/skills/luck-fortune.png", "Skill icon, treasure chest or gold, fortune ability, pixel art, wealth icon, game UI, 48x48"),
    ("sprites/skills/luck-game-of-chance.png", "Skill icon, dice or roulette wheel, game of chance, pixel art, gambling icon, game UI, 48x48"),
]

assets.extend(skill_prompts)

# === COMBAT EFFECTS ===
effect_prompts = [
    ("sprites/combat/punch-impact.png", "Combat effect, fist impact burst, punch hit effect, pixel art, game VFX, 48x48"),
    ("sprites/combat/blood-hit.png", "Combat effect, blood splatter on hit, red splatter effect, pixel art, gritty game VFX, 48x48"),
    ("sprites/combat/status-poison.png", "Status effect icon, poison green bubble or skull, pixel art, detrimental effect, game icon, 48x48"),
    ("sprites/combat/status-burn.png", "Status effect icon, fire flame, burn effect, pixel art, damaging effect, game icon, 48x48"),
    ("sprites/combat/status-freeze.png", "Status effect icon, ice crystal or snowflake, freeze effect, pixel art, control effect, game icon, 48x48"),
]

assets.extend(effect_prompts)

# Generate all assets
print(f"\n=== Generating {len(assets)} assets ===\n")
success_count = 0

for filepath, prompt in assets:
    if generate_image(prompt, filepath):
        success_count += 1

print(f"\n=== Complete: {success_count}/{len(assets)} successful ===")
