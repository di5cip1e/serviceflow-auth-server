import { 
  POSITIVE_TRAITS, 
  NEGATIVE_TRAITS, 
  GOVERNMENT_TYPES,
  MAX_STAT_POINTS,
  MAX_NEGATIVE_TRAITS,
  RULER_NAMES,
  NATION_NAMES,
  CAPITAL_NAMES
} from './config.js';

export class AIRulerGenerator {
  static generateRuler(usedNames = { rulers: [], nations: [], capitals: [] }) {
    // Pick random gender
    const genders = ['male', 'female', 'non-binary'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    
    // Generate unique names
    const rulerName = this.pickUniqueName(RULER_NAMES[gender === 'non-binary' ? 'nonbinary' : gender], usedNames.rulers);
    const nationName = this.pickUniqueName(NATION_NAMES, usedNames.nations);
    const capitalName = this.pickUniqueName(CAPITAL_NAMES, usedNames.capitals);
    
    // Pick random government type
    const govTypes = Object.keys(GOVERNMENT_TYPES);
    const governmentType = govTypes[Math.floor(Math.random() * govTypes.length)];
    
    // Generate traits using the same point system
    const traits = this.generateTraits();
    
    return {
      rulerName,
      rulerGender: gender,
      nationName,
      capitalName,
      governmentType,
      positiveTraits: traits.positive,
      negativeTraits: traits.negative,
      pointsSpent: traits.pointsSpent,
      pointsRefunded: traits.pointsRefunded
    };
  }
  
  static pickUniqueName(nameArray, usedNames) {
    const availableNames = nameArray.filter(name => !usedNames.includes(name));
    
    if (availableNames.length === 0) {
      // Fallback: add a number suffix
      const baseName = nameArray[Math.floor(Math.random() * nameArray.length)];
      return `${baseName} II`;
    }
    
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    usedNames.push(name);
    return name;
  }
  
  static generateTraits() {
    // AI uses same 7 base points
    let basePoints = MAX_STAT_POINTS;
    let pointsRefunded = 0;
    
    // Randomly decide how many negative traits (0-3)
    // Weighted toward having some flaws for interesting AI
    const negativeWeights = [0.2, 0.3, 0.3, 0.2]; // 0, 1, 2, or 3 negative traits
    const negativeCount = this.weightedRandom(negativeWeights);
    
    // Select random negative traits
    const selectedNegative = [];
    const shuffledNegative = [...NEGATIVE_TRAITS].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < negativeCount; i++) {
      const trait = shuffledNegative[i];
      selectedNegative.push(trait.id);
      pointsRefunded += trait.refund;
    }
    
    // Total points available
    const totalPoints = basePoints + pointsRefunded;
    
    // Spend points on positive traits
    const selectedPositive = [];
    let remainingPoints = totalPoints;
    
    // Shuffle positive traits for random selection
    const shuffledPositive = [...POSITIVE_TRAITS].sort(() => Math.random() - 0.5);
    
    // AI tries to spend most of its points (80-100%)
    const targetSpending = totalPoints * (0.8 + Math.random() * 0.2);
    
    for (const trait of shuffledPositive) {
      if (trait.cost <= remainingPoints) {
        // 70% chance to take a trait if affordable
        if (Math.random() < 0.7) {
          selectedPositive.push(trait.id);
          remainingPoints -= trait.cost;
          
          // Stop if we've reached target spending
          if (totalPoints - remainingPoints >= targetSpending) {
            break;
          }
        }
      }
    }
    
    return {
      positive: selectedPositive,
      negative: selectedNegative,
      pointsSpent: totalPoints - remainingPoints,
      pointsRefunded: pointsRefunded
    };
  }
  
  static weightedRandom(weights) {
    const total = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return i;
    }
    
    return weights.length - 1;
  }
}
