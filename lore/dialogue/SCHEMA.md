# Dialogue Schema

## Structure

```json
{
  "npc_id": "string",
  "npc_name": "string",
  "location": "string",
  "nodes": [
    {
      "id": "node_id",
      "text": "NPC dialogue text",
      "choices": [
        {
          "text": "Player response option",
          "next_node": "next_node_id",
          "action": {
            "type": "action_type",
            "params": {}
          }
        }
      ]
    }
  ]
}
```

## Action Types

| Type | Description |
|------|-------------|
| `start_mission` | Initiates a mission |
| `show_panel` | Opens a game panel (missions, status, etc.) |
| `give_reward` | Grants XP or items |
| `close` | Ends conversation |
| `unlock_room` | Unlocks a new station area |

## Dialogue Flow

1. **Greeting Node**: Initial contact when player approaches
2. **Menu Node**: Offers multiple interaction options
3. **Response Nodes**: Branch based on player choice
4. **Action Nodes**: Triggers game mechanics
5. **Farewell Node**: Ends conversation gracefully

## Example

```json
{
  "npc_id": "director",
  "npc_name": "The Director",
  "location": "Command Center",
  "nodes": [
    {
      "id": "greeting",
      "text": "Commander, welcome to the Command Center. How can I assist you today?",
      "choices": [
        {
          "text": "Give me a mission briefing.",
          "next_node": "mission_briefing"
        },
        {
          "text": "Show me the station status.",
          "next_node": "station_status"
        },
        {
          "text": "Just checking in.",
          "next_node": "farewell"
        }
      ]
    }
  ]
}
```
