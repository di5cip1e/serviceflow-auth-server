# Time-Based Systems Integration Guide

This guide explains how to integrate the time-based systems with the game's real-time speed slider.

## Overview

The following systems have been converted from turn-based to time-based:

1. **TechTree.js** - Research point generation
2. **EventSystem.js** - Random event triggering
3. **VictorySystem.js** - Victory/defeat condition checking
4. **AIMemory.js** - AI strategy adaptation

## Integration in Main Game Loop

Add the following to your game's main update loop, after updating game time:

```javascript
// In your game update loop (called every frame):
function updateGame(deltaTime) {
    // deltaTime = milliseconds since last frame
    // gameSpeed = speed slider value (0.25 to 4.0)
    
    // Calculate scaled elapsed time
    const scaledDeltaTime = deltaTime * gameSpeed;
    
    // Update time-based systems
    const researchResult = techTree.processTimeElapsed(scaledDeltaTime);
    const eventResult = eventSystem.processTimeElapsed(scaledDeltaTime);
    const victoryResult = victorySystem.processTimeElapsed(scaledDeltaTime);
    
    // Handle event if triggered
    if (eventResult && eventResult.id) {
        showEventUI(eventResult);
    }
    
    // Handle victory/defeat
    if (victoryResult.victory || victoryResult.defeat) {
        handleGameEnd(victoryResult);
    }
}
```

## System Details

### TechTree.js

**Research Rate**: 2 RP per 10 seconds at 1x speed (0.2 RP/sec)

```javascript
// Get current RP rate
const rpPerSecond = techTree.getResearchRatePerSecond();

// Adjust research rate (optional)
techTree.setResearchRatePerSecond(0.3); // 3 RP per 10 seconds

// Result from processTimeElapsed:
{
    secondsElapsed: 16.67,
    pointsGained: 3.33,
    totalPoints: 153.33
}
```

### EventSystem.js

**Event Frequency**: Random event every 15-30 seconds at 1x speed

```javascript
// Adjust event frequency (optional)
eventSystem.setEventFrequency(20000, 45000); // 20-45 seconds at 1x

// Result from processTimeElapsed (when event triggers):
{
    id: 'plague',
    name: 'The Great Plague',
    icon: '☠️',
    category: 'natural',
    description: '...',
    choices: [...]
}

// Result when no event:
null
```

### VictorySystem.js

**Check Interval**: Every 30 seconds at 1x speed

```javascript
// Adjust check interval (optional)
victorySystem.setVictoryCheckInterval(60000); // Check every 60 seconds

// Result from processTimeElapsed:
{
    checked: true,        // Whether full check was performed
    victory: false,
    type: null,
    defeat: false,
    defeatType: null,
    progress: {
        domination: 0.15,
        diplomatic: 0.33,
        economic: 0.45,
        conquest: 0.0,
        prestige: 0.22
    },
    nextCheckIn: 25000   // When next check will occur
}
```

### AIMemory.js

**Adaptation Interval**: Every 10 seconds at 1x speed

```javascript
// Adjust adaptation interval (optional)
aiMemory.setAdaptationInterval(15000); // Every 15 seconds

// Result from processTimeElapsed:
{ adapted: true, modifiers: { receptiveness: 0.05, riskTolerance: 0.1, trustWeight: 0 } }
{ adapted: false, nextIn: 3200 } // Not time yet
```

## Speed Slider Effects

| Speed | Effect on RP Generation | Effect on Event Timing |
|-------|------------------------|----------------------|
| 0.25x | 0.5 RP / 10 sec | Event every 60-120 sec |
| 0.5x  | 1 RP / 10 sec   | Event every 30-60 sec |
| 1x    | 2 RP / 10 sec   | Event every 15-30 sec |
| 2x    | 4 RP / 10 sec   | Event every 7.5-15 sec |
| 4x    | 8 RP / 10 sec   | Event every 3.75-7.5 sec |

## Backward Compatibility

The old turn-based methods are still available but deprecated:

- `techTree.processTurn(cityCount)` - Now uses time estimation
- `eventSystem.triggerRandomEvent()` - Now uses time estimation
- `victorySystem.checkVictoryConditions()` - Still works, use processTimeElapsed for real-time

## Example Game Speed Handler

```javascript
class GameSpeedManager {
    constructor() {
        this.gameSpeed = 1.0; // Default 1x
        this.minSpeed = 0.25;
        this.maxSpeed = 4.0;
    }
    
    setSpeed(speed) {
        this.gameSpeed = Math.max(this.minSpeed, Math.min(this.maxSpeed, speed));
    }
    
    // In your UI, show current speed
    getSpeedLabel() {
        if (this.gameSpeed <= 0.25) return 'Pause';
        if (this.gameSpeed <= 0.5) return 'Slow';
        if (this.gameSpeed <= 1.0) return 'Normal';
        if (this.gameSpeed <= 2.0) return 'Fast';
        return 'Ultra';
    }
}
```

## Initialization

When initializing your game, reset the time trackers:

```javascript
// On new game start
techTree.lastResearchTime = Date.now();
eventSystem.lastEventTime = Date.now();
victorySystem.lastVictoryCheckTime = Date.now();
aiMemory.lastAdaptationTime = Date.now();
```
