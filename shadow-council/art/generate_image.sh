#!/bin/bash
# Image Generation Tool for Shadow Council
# Usage: ./generate_image.sh "prompt" output_filename.png

API_KEY=$(cat "$(dirname "$0")/../.env" | grep OPENAI_API_KEY | cut -d'=' -f2-)

if [ -z "$API_KEY" ]; then
    echo "Error: API key not found in .env"
    exit 1
fi

PROMPT="$1"
FILENAME="$2"

if [ -z "$PROMPT" ] || [ -z "$FILENAME" ]; then
    echo "Usage: $0 \"prompt\" output_filename.png"
    exit 1
fi

echo "Generating image: $FILENAME"
echo "Prompt: $PROMPT"

curl -s -X POST "https://api.openai.com/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"prompt\": \"$PROMPT\",
    \"n\": 1,
    \"size\": \"1024x1024\"
  }" | jq -r '.data[0].url' | xargs curl -s -o "$FILENAME"

if [ -f "$FILENAME" ]; then
    echo "Saved: $FILENAME"
else
    echo "Error: Failed to save image"
    exit 1
fi
