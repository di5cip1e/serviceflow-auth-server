/**
 * MistakeDetector.js
 * 
 * Detects objectively poor AI ruler decisions and rewards the player with threaten tokens.
 * 
 * **Philosophy:**
 * Good counsel isn't just about what you say - it's about recognizing when your ruler makes
 * mistakes. This system rewards observant players who understand strategy and can identify
 * when their AI ruler screws up.
 * 
 * **Mistake Categories:**
 * 1. Economic Mistakes - Bankruptcy, poor financial management
 * 2. Military Mistakes - Crushing defeats, wasteful battles
 * 3. Diplomatic Mistakes - Breaking valuable alliances, unnecessary wars
 * 4. Strategic Mistakes - Abandoning sieges, ignoring threats
 * 
 * **Token Rewards:**
 * - Minor mistake: +1 threaten token
 * - Major mistake: +2 threaten tokens
 * - Critical mistake: +3 threaten tokens
 * 
 * **Cooldown:**
 * Same category mistakes have 30-second cooldown to prevent spam.
 */

export class MistakeDetector {
  constructor(worldManager, counselManager) {
    this.worldManager = worldManager;
    this.counselManager = counselManager;
    
    // Track recent mistakes to prevent duplicate detection
    this.recentMistakes = new Map(); // category -> timestamp
    this.cooldownMs = 30000; // 30 seconds
    
    // Historical data for comparison
    this.previousState = {
      gold: null,
      armiesCount: null,
      citiesCount: null,
      allies: new Set(),
      wars: new Set()
    };
    
    // Mistake thresholds
    this.thresholds = {
      bankruptcyWarning: 100,      // Gold < 100
      severeDefeat: 0.6,           // Lost 60%+ of army
      crushingDefeat: 0.8,         // Lost 80%+ of army
      poorTradeoff: 0.4,           // Took 40%+ casualties for nothing
      economicCrisis: -50,         // Net income < -50
      rapidDecline: 0.3,           // Lost 30%+ gold in one turn
      abandonedSiege: 0.7          // Siege was 70%+ complete
    };
    
    // Statistics for notifications
    this.stats = {
      totalMistakesDetected: 0,
      tokensAwarded: 0,
      mistakesByCategory: {
        economic: 0,
        military: 0,
        diplomatic: 0,
        strategic: 0
      }
    };
  }
  
  /**
   * Update detection - called periodically to check for mistakes
   */
  update() {
    if (!this.worldManager.playerNation || this.worldManager.playerNation.eliminated) {
      return;
    }
    
    // Check various mistake categories
    this.checkEconomicMistakes();
    this.checkDiplomaticMistakes();
    
    // Update historical state for next check
    this.updateHistoricalState();
  }
  
  /**
   * Check for economic management mistakes
   */
  checkEconomicMistakes() {
    const nation = this.worldManager.playerNation;
    if (!nation) return;
    
    // Bankruptcy - ran out of gold
    if (nation.gold <= 0 && this.previousState.gold > 0) {
      this.detectMistake({
        category: 'economic',
        type: 'bankruptcy',
        severity: 'critical',
        title: '💸 BANKRUPTCY DETECTED',
        description: `Your ruler has depleted the national treasury! Gold: ${nation.gold}g`,
        advice: 'Consider building roads for income or negotiating trade agreements.',
        tokens: 3
      });
    }
    
    // Near bankruptcy with negative income
    else if (nation.gold < this.thresholds.bankruptcyWarning && 
             nation.gold > 0 && 
             this.worldManager.incomeSystem) {
      const netIncome = this.worldManager.incomeSystem.calculateIncome(nation).netIncome;
      
      if (netIncome < this.thresholds.economicCrisis) {
        this.detectMistake({
          category: 'economic',
          type: 'economic_crisis',
          severity: 'major',
          title: '⚠️ ECONOMIC CRISIS',
          description: `Treasury critically low (${nation.gold}g) with severe deficit (${netIncome}g/turn)`,
          advice: 'Your ruler is heading toward bankruptcy. Suggest disbanding armies or building income sources.',
          tokens: 2
        });
      }
    }
    
    // Rapid economic decline - lost significant gold
    if (this.previousState.gold !== null) {
      const goldLost = this.previousState.gold - nation.gold;
      const percentLost = goldLost / this.previousState.gold;
      
      if (percentLost > this.thresholds.rapidDecline && goldLost > 300) {
        this.detectMistake({
          category: 'economic',
          type: 'rapid_decline',
          severity: 'major',
          title: '📉 RAPID ECONOMIC DECLINE',
          description: `Lost ${goldLost.toFixed(0)}g (${(percentLost * 100).toFixed(0)}% of treasury) in short time`,
          advice: 'Your ruler is spending recklessly. This pace is unsustainable.',
          tokens: 2
        });
      }
    }
    
    // Wasteful expansion - too many cities without income to support them
    if (this.worldManager.incomeSystem && nation.cities.length > 3) {
      const incomeData = this.worldManager.incomeSystem.calculateIncome(nation);
      const cityMaintenance = incomeData.expenses.find(e => e.category === 'City Maintenance')?.amount || 0;
      const cityIncome = incomeData.sources.find(s => s.source === 'Cities')?.amount || 0;
      
      // If city maintenance exceeds city income by 50%+
      if (cityMaintenance > cityIncome * 1.5 && cityMaintenance > 100) {
        this.detectMistake({
          category: 'economic',
          type: 'wasteful_expansion',
          severity: 'minor',
          title: '🏛️ WASTEFUL EXPANSION',
          description: `City maintenance (${cityMaintenance.toFixed(0)}g) far exceeds city income (${cityIncome.toFixed(0)}g)`,
          advice: 'Your ruler is expanding faster than the economy can support.',
          tokens: 1
        });
      }
    }
  }
  
  /**
   * Check for diplomatic blunders
   */
  checkDiplomaticMistakes() {
    const nation = this.worldManager.playerNation;
    if (!nation) return;
    
    const diplomacy = this.worldManager.diplomacyManager;
    if (!diplomacy) return;
    
    // Get current allies and wars
    const currentAllies = new Set();
    const currentWars = new Set();
    
    for (const [otherId, relationship] of Object.entries(nation.relationships)) {
      if (relationship.treaties.includes('alliance')) {
        currentAllies.add(parseInt(otherId));
      }
      if (relationship.atWar) {
        currentWars.add(parseInt(otherId));
      }
    }
    
    // Broke alliance with friendly nation
    for (const formerAlly of this.previousState.allies) {
      if (!currentAllies.has(formerAlly)) {
        const otherNation = this.worldManager.nations.find(n => n.id === formerAlly);
        if (otherNation && !otherNation.eliminated) {
          this.detectMistake({
            category: 'diplomatic',
            type: 'broke_alliance',
            severity: 'major',
            title: '🤝 ALLIANCE BROKEN',
            description: `Your ruler ended the alliance with ${otherNation.name}`,
            advice: 'Breaking alliances damages diplomatic reputation and removes military support.',
            tokens: 2
          });
        }
      }
    }
    
    // Started too many simultaneous wars
    const warCount = currentWars.size;
    if (warCount >= 3 && warCount > this.previousState.wars.size) {
      this.detectMistake({
        category: 'diplomatic',
        type: 'too_many_wars',
        severity: 'major',
        title: '⚔️ OVEREXTENDED IN WAR',
        description: `Your ruler is now at war with ${warCount} nations simultaneously`,
        advice: 'Fighting multiple wars divides military strength and drains the economy.',
        tokens: 2
      });
    }
    
    // Declared war on much stronger nation (if alone)
    for (const newWarId of currentWars) {
      if (!this.previousState.wars.has(newWarId)) {
        const enemy = this.worldManager.nations.find(n => n.id === newWarId);
        if (enemy && !enemy.eliminated) {
          // Calculate relative strength
          const playerStrength = this.calculateNationStrength(nation);
          const enemyStrength = this.calculateNationStrength(enemy);
          
          // Enemy is 2x stronger and we have no allies
          if (enemyStrength > playerStrength * 2 && currentAllies.size === 0) {
            this.detectMistake({
              category: 'diplomatic',
              type: 'suicidal_war',
              severity: 'critical',
              title: '💀 SUICIDAL WAR DECLARED',
              description: `Your ruler declared war on ${enemy.name}, which is much stronger (${enemyStrength.toFixed(0)} vs ${playerStrength.toFixed(0)})`,
              advice: 'This war appears unwinnable without allies. Consider immediate peace negotiations.',
              tokens: 3
            });
          }
        }
      }
    }
  }
  
  /**
   * Check battle results for military mistakes
   * Called by BattleSystem after battles
   */
  checkBattleResult(battleResult) {
    const nation = this.worldManager.playerNation;
    if (!nation) return;
    
    // Only check if player's nation was involved
    const playerInvolved = battleResult.attacker === nation.name || battleResult.defender === nation.name;
    if (!playerInvolved) return;
    
    const isPlayerAttacker = battleResult.attacker === nation.name;
    const playerArmy = isPlayerAttacker ? battleResult.attackingArmy : battleResult.defendingArmy;
    const playerStartUnits = playerArmy.initialUnits || playerArmy.units;
    const playerFinalUnits = playerArmy.units;
    const playerCasualties = playerStartUnits - playerFinalUnits;
    const playerCasualtyRate = playerCasualties / playerStartUnits;
    
    // Player lost the battle
    if (battleResult.victor !== nation.name) {
      // Crushing defeat - lost 80%+ of army
      if (playerCasualtyRate >= this.thresholds.crushingDefeat) {
        this.detectMistake({
          category: 'military',
          type: 'crushing_defeat',
          severity: 'critical',
          title: '💀 CRUSHING DEFEAT',
          description: `Your army was annihilated! Lost ${playerCasualties}/${playerStartUnits} units (${(playerCasualtyRate * 100).toFixed(0)}%)`,
          advice: 'This battle was a disaster. Consider better army composition or avoiding unfavorable terrain.',
          tokens: 3
        });
      }
      // Severe defeat - lost 60%+ of army
      else if (playerCasualtyRate >= this.thresholds.severeDefeat) {
        this.detectMistake({
          category: 'military',
          type: 'severe_defeat',
          severity: 'major',
          title: '⚠️ SEVERE DEFEAT',
          description: `Heavy losses in battle: ${playerCasualties}/${playerStartUnits} units (${(playerCasualtyRate * 100).toFixed(0)}%)`,
          advice: 'Your army was severely weakened. The battle preparation was inadequate.',
          tokens: 2
        });
      }
      // Poor tactical decision - lost battle despite having numbers
      else if (playerStartUnits > (isPlayerAttacker ? battleResult.defendingArmy.units : battleResult.attackingArmy.units) * 1.3) {
        this.detectMistake({
          category: 'military',
          type: 'numerical_advantage_lost',
          severity: 'major',
          title: '📊 NUMERICAL ADVANTAGE SQUANDERED',
          description: `Lost battle despite having ${playerStartUnits} vs ${isPlayerAttacker ? battleResult.defendingArmy.initialUnits : battleResult.attackingArmy.initialUnits} units`,
          advice: 'Your ruler wasted a numerical advantage. Poor tactics, equipment, or terrain choice.',
          tokens: 2
        });
      }
    }
    
    // Player won but took heavy casualties (pyrrhic victory)
    else if (playerCasualtyRate >= this.thresholds.poorTradeoff) {
      const enemyArmy = isPlayerAttacker ? battleResult.defendingArmy : battleResult.attackingArmy;
      const enemyCasualties = (enemyArmy.initialUnits || enemyArmy.units) - enemyArmy.units;
      
      // Won but lost more units than enemy (somehow)
      if (playerCasualties > enemyCasualties * 1.5) {
        this.detectMistake({
          category: 'military',
          type: 'pyrrhic_victory',
          severity: 'minor',
          title: '⚔️ PYRRHIC VICTORY',
          description: `Won but at terrible cost: Lost ${playerCasualties} units vs enemy's ${enemyCasualties}`,
          advice: 'The victory was too costly. Better preparation would have saved lives.',
          tokens: 1
        });
      }
    }
    
    // Attacked into heavily fortified position
    if (isPlayerAttacker && battleResult.defenseBonus >= 2.0 && playerCasualtyRate >= 0.5) {
      this.detectMistake({
        category: 'military',
        type: 'foolish_assault',
        severity: 'major',
        title: '🏰 FOOLISH ASSAULT',
        description: `Attacked fortified position (${battleResult.defenseBonus.toFixed(1)}x defense) and took heavy casualties`,
        advice: 'Assaulting fortified positions without overwhelming force is wasteful.',
        tokens: 2
      });
    }
  }
  
  /**
   * Check for strategic mistakes (sieges abandoned, opportunities missed)
   * Called by ConquestSystem
   */
  checkSiegeAbandoned(siegeData) {
    const nation = this.worldManager.playerNation;
    if (!nation || siegeData.attackerNationId !== nation.id) return;
    
    // Abandoned siege that was near completion
    if (siegeData.progress >= this.thresholds.abandonedSiege * 100) {
      this.detectMistake({
        category: 'strategic',
        type: 'abandoned_siege',
        severity: 'major',
        title: '⏳ SIEGE ABANDONED',
        description: `Your ruler abandoned a ${siegeData.progress.toFixed(0)}% complete siege of ${siegeData.cityName}`,
        advice: 'The siege was nearly complete! This wastes time and military positioning.',
        tokens: 2
      });
    }
  }
  
  /**
   * Record a detected mistake and award tokens
   */
  detectMistake(mistakeData) {
    const { category, type, severity, title, description, advice, tokens } = mistakeData;
    
    // Check cooldown for this category
    const now = Date.now();
    const lastMistake = this.recentMistakes.get(category);
    if (lastMistake && now - lastMistake < this.cooldownMs) {
      return; // Too soon to detect same category
    }
    
    // Update cooldown
    this.recentMistakes.set(category, now);
    
    // Award threaten tokens
    if (this.counselManager) {
      this.counselManager.threatenTokens += tokens;
    }
    
    // Update stats
    this.stats.totalMistakesDetected++;
    this.stats.tokensAwarded += tokens;
    this.stats.mistakesByCategory[category]++;
    
    // Log to console
    console.log(`%c${title}`, 'color: #ff4444; font-weight: bold; font-size: 14px');
    console.log(`%c${description}`, 'color: #ffaa44');
    console.log(`%c${advice}`, 'color: #aaaaaa; font-style: italic');
    console.log(`%c+${tokens} Threaten Token${tokens > 1 ? 's' : ''} Awarded`, 'color: #44ff44; font-weight: bold');
    
    // Show notification to player
    this.showMistakeNotification(title, description, tokens);
    
    // Trigger UI update if counsel manager exists
    if (this.counselManager && this.counselManager.updateUI) {
      this.counselManager.updateUI();
    }
  }
  
  /**
   * Show visual notification to player
   */
  showMistakeNotification(title, description, tokens) {
    // Use MessageFeed if available
    if (this.worldManager.messageFeed) {
      this.worldManager.messageFeed.addMessage({
        title,
        description,
        type: 'mistake',
        tokens
      });
    }
  }
  
  /**
   * Calculate nation's relative strength for comparison
   */
  calculateNationStrength(nation) {
    let strength = 0;
    
    // Gold (economic power)
    strength += nation.gold * 0.1;
    
    // Cities (production)
    strength += nation.cities.length * 500;
    
    // Territory (resources)
    strength += nation.tiles.length * 2;
    
    // Military (armies)
    if (this.worldManager.armyManager) {
      const armies = this.worldManager.armyManager.getArmiesForNation(nation.id);
      for (const army of armies) {
        strength += army.units * 10;
        // Quality equipment adds more
        if (army.equipment === 'quality') strength += army.units * 2;
        if (army.equipment === 'elite') strength += army.units * 5;
      }
    }
    
    // Allies (diplomatic strength)
    let allyCount = 0;
    for (const rel of Object.values(nation.relationships)) {
      if (rel.treaties.includes('alliance')) allyCount++;
    }
    strength += allyCount * 1000;
    
    return strength;
  }
  
  /**
   * Update historical state for comparison
   */
  updateHistoricalState() {
    const nation = this.worldManager.playerNation;
    if (!nation) return;
    
    // Save current state
    this.previousState.gold = nation.gold;
    this.previousState.armiesCount = this.worldManager.armyManager?.getArmiesForNation(nation.id).length || 0;
    this.previousState.citiesCount = nation.cities.length;
    
    // Save allies and wars
    this.previousState.allies.clear();
    this.previousState.wars.clear();
    
    for (const [otherId, relationship] of Object.entries(nation.relationships)) {
      if (relationship.treaties.includes('alliance')) {
        this.previousState.allies.add(parseInt(otherId));
      }
      if (relationship.atWar) {
        this.previousState.wars.add(parseInt(otherId));
      }
    }
  }
  
  /**
   * Get statistics for debugging
   */
  getStats() {
    return {
      ...this.stats,
      currentTokens: this.counselManager?.threatenTokens || 0
    };
  }
}
