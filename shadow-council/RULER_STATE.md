# Ruler State Documentation

This document describes the global game state structure that stores the AI Ruler's configuration. This data is saved to `window.gameState` and will be used in future phases to drive the AI Ruler's decision-making behavior.

## Global State Structure

```javascript
window.gameState = {
  ruler: {
    name: string,              // Ruler's name (e.g., "Queen Elara")
    gender: string,            // "male", "female", or "non-binary"
    governmentType: string,    // "autocracy", "democracy", "theocracy", "oligarchy", or "militarism"
    positiveTraits: string[],  // Array of positive trait IDs
    negativeTraits: string[]   // Array of negative trait IDs
  },
  nation: {
    name: string,              // Nation name (e.g., "Valdoria")
    capital: string            // Capital city name (e.g., "Thornhaven")
  },
  initialized: boolean         // True when ruler creation is complete
}
```

## Government Types

Each government type influences the AI Ruler's baseline decision-making tendencies:

- **autocracy**: Centralized power, values control and decisive action
- **democracy**: Balanced interests, values popular support and representation
- **theocracy**: Religious authority, values moral law and divine guidance
- **oligarchy**: Elite council, values economic prosperity and privilege
- **militarism**: Military strength, values expansion and martial prowess

## Positive Traits

Positive traits cost points and enhance the ruler's capabilities. Each trait has specific behavioral impacts:

### 2-Point Traits (Major Strengths)

- **brilliant**: Exceptional strategic thinking
  - Impact: Makes highly intelligent decisions, sees through complex situations
  
- **charismatic**: Natural persuasion ability
  - Impact: Easily gains support, sways opinions favorably
  
- **decisive**: Quick, confident action
  - Impact: Makes swift decisions in critical moments
  
- **diplomatic**: Skilled negotiation
  - Impact: Prefers negotiation, finds common ground
  
- **shrewd**: Cunning political perception
  - Impact: Identifies deception, makes calculated strategic moves

### 1-Point Traits (Minor Strengths)

- **just**: Fair and balanced judgment
  - Impact: Considers ethics and fairness in decisions
  
- **ambitious**: Driven to expand
  - Impact: Pursues growth and expansion aggressively
  
- **pious**: Deeply religious
  - Impact: Considers religious doctrine and moral principles
  
- **merciful**: Compassionate and lenient
  - Impact: Forgiving, avoids harsh punishments
  
- **brave**: Fearless under pressure
  - Impact: Takes bold risks, stands firm

## Negative Traits

Negative traits refund points (allowing more positive traits) but impose behavioral penalties. Maximum 3 negative traits.

### 2-Point Refund (Major Flaws)

- **cruel**: Takes pleasure in harsh punishment
  - Impact: Inflicts severe consequences, rules through fear
  
- **paranoid**: Distrusts everyone
  - Impact: Suspects betrayal, acts defensively even against allies
  
- **wrathful**: Quick to anger
  - Impact: Responds with fury to slights and challenges
  
- **slothful**: Lazy and avoidant
  - Impact: Delays decisions, ignores pressing matters
  
- **weak**: Easily influenced, indecisive
  - Impact: Swayed by others, struggles to commit to decisions

### 1-Point Refund (Minor Flaws)

- **greedy**: Obsessed with wealth
  - Impact: Prioritizes economic gain over other considerations
  
- **arrogant**: Overconfident and dismissive
  - Impact: Ignores advice, underestimates threats
  
- **hateful**: Deep prejudices and grudges
  - Impact: Shows favoritism and discrimination
  
- **impulsive**: Acts without thinking
  - Impact: Makes rash decisions without proper consideration
  
- **stubborn**: Refuses to change course
  - Impact: Clings to failing strategies, ignores new information

## Implementation Notes for Phase 2+

When implementing the AI Ruler's decision-making system:

1. **Access the state**: `const rulerData = window.gameState.ruler;`

2. **Weight decisions** based on:
   - Government type (baseline tendencies)
   - Positive traits (enhanced capabilities)
   - Negative traits (behavioral penalties)

3. **Example decision logic**:
   ```javascript
   function shouldRulerListenToAdvice(advice) {
     const ruler = window.gameState.ruler;
     let listenChance = 0.5; // Base 50%
     
     // Government modifiers
     if (ruler.governmentType === 'democracy') listenChance += 0.2;
     if (ruler.governmentType === 'autocracy') listenChance -= 0.2;
     
     // Positive trait modifiers
     if (ruler.positiveTraits.includes('wise')) listenChance += 0.15;
     if (ruler.positiveTraits.includes('diplomatic')) listenChance += 0.1;
     
     // Negative trait modifiers
     if (ruler.negativeTraits.includes('arrogant')) listenChance -= 0.2;
     if (ruler.negativeTraits.includes('stubborn')) listenChance -= 0.15;
     if (ruler.negativeTraits.includes('weak')) listenChance += 0.2;
     
     return Math.random() < listenChance;
   }
   ```

4. **LLM System Prompt**: When using an LLM API for the AI Ruler, construct a system prompt that includes:
   - Ruler name and gender
   - Government type and its philosophy
   - All positive traits and their impacts
   - All negative traits and their impacts
   - Current game context (cities, resources, threats)

5. **Trait-Based Responses**: Each trait should consistently influence:
   - Decision probability (likelihood to take action)
   - Response tone (how the ruler communicates)
   - Strategic priorities (what the ruler values)
   - Risk tolerance (willingness to take chances)

## Example Complete Ruler Configuration

```javascript
window.gameState = {
  ruler: {
    name: "King Aldric",
    gender: "male",
    governmentType: "autocracy",
    positiveTraits: ["brilliant", "decisive", "ambitious"],
    negativeTraits: ["cruel", "arrogant"]
  },
  nation: {
    name: "Thornreach",
    capital: "Ironhold"
  },
  initialized: true
}
```

**Behavioral Profile**: King Aldric is a highly intelligent and decisive autocrat who pursues expansion aggressively. However, his cruelty makes him feared rather than loved, and his arrogance causes him to dismiss valuable counsel. He makes swift, calculated decisions but may underestimate threats due to overconfidence.
