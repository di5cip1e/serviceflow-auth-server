#!/bin/bash

API_KEY="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"
OUTPUT_DIR="/root/.openclaw/workspace/kingdom-cards/assets/demo-cards"

# Card prompts - each one zany, cartoon, white background, prison theme
declare -A PROMPTS=(
  ["warden-whiskers"]="Cartoon cat wearing a crooked warden hat made of spoons, holding a golden shiv like a scepter, silly confident expression, striped prison warden uniform, big expressive eyes, big head small body, bright colors, zany style, animated character design, white background, fun cartoon"
  
  ["sgt-bust-through"]="Cartoon guard with tiny mustache and huge muscles but confused expression, wearing oversized guard uniform, holding a baton upside down, running the wrong direction, striped prison, silly incompetent look, big head tiny body, bright colors, zany comedy, white background"
  
  ["captain-ironjaw"]="Cartoon guard with massive square jaw punching through a brick wall, debris flying, determined angry expression, guard uniform, one fist through wall, exaggerated proportions, bright colors, zany action style, white background"
  
  ["reverend-scoops"]="Cartoon prison chaplain wearing clerical collar holding an enormous ice cream cone that's clearly contraband, sneaky guilty expression, altar boy outfit but with prison stripes, huge ice cream with multiple scoops, comedic, bright colors, white background"
  
  ["sister-solitaire"]="Cartoon nun playing solitaire card game with inmates, spread of cards everywhere, serious concentration face, wimple habit, striped prison jumpsuit under habit, holding cards like souls, comedic, bright zany colors, white background"
  
  ["tunnel-terry"]="Cartoon inmate with enormous nose and tiny body digging with a spoon, excited happy expression, striped prison jumpsuit, underground tunnel with pickaxe, dirt everywhere, big nose is the focal point, comedic, bright colors, white background"
  
  ["shank-shank"]="Cartoon inmate with sneaky expression pulling 47 shivs from everywhere - from shoes, hat, belt, sleeves, everywhere, ridiculous number of hidden weapons, striped jumpsuit, bulging pockets, comedic chaos, bright zany colors, white background"
  
  ["chef-sack-o-rice"]="Cartoon cook wearing a giant sock on his head as a hat, stirring a huge pot of rice with another sock, striped apron over prison jumpsuit, happy hungry expression, kitchen full of socks, comedic, bright colors, white background"
  
  ["the-block"]="Cartoon 4-person prison cell, bunk beds, 4 quirky inmates doing different things - one sleeping, one exercising, one playing cards, graffiti on walls saying things like 'JAIL KING', cell bars visible, colorful, zany, white background"
  
  ["yard-tower"]="Cartoon prison watchtower with broken spotlight spinning wildly, guard at top covering eyes from spotlight beam, night scene but comedic, spotlight pointing at wrong things, bars and fences, bright bold colors, white background"
  
  ["mcfluff"]="Adorable tiny dragon wearing an emotional support animal vest with a little ID tag, tiny wings, cute big eyes but accidentally breathing small fire, surrounded by inmates going aww, tiny flames, comedic contrast, bright colors, white background, zany"
  
  ["free-for-all"]="Cartoon prison riot chaos, inmates everywhere fighting with pillows and spoons, bars bent, food flying, absolute chaotic fun, prisoners of all types, comedic mayhem, bright bold zany colors, white background"
)

for card in "${!PROMPTS[@]}"; do
  echo "Generating: $card"
  curl -s -X POST "https://api.openai.com/v1/images/generations" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d "{
      \"model\": \"dall-e-3\",
      \"prompt\": \"${PROMPTS[$card]}\",
      \"size\": \"1024x1024\",
      \"quality\": \"standard\",
      \"n\": 1
    }" | jq -r '.data[0].url' | xargs -I {} curl -s {} -o "$OUTPUT_DIR/$card.png"
  echo "Saved: $OUTPUT_DIR/$card.png"
done

echo "All 12 cards generated!"
