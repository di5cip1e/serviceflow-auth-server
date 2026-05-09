// Kingdom Cards - Battle Engine
// Phaser 3 Game

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    preload() {
        // Title background
        const bg = this.make.graphics().fillStyle(0x1a0a2e).fillRect(0, 0, 1400, 900);
        bg.generateTexture('menuBg', 1400, 900);
    }
    
    create() {
        this.add.image(700, 450, 'menuBg');
        
        // Title
        this.add.text(700, 200, '⚔️ KINGDOM CARDS ⚔️', {
            fontSize: '64px',
            color: '#FFD700',
            fontFamily: 'MedievalSharp'
        }).setOrigin(0.5);
        
        this.add.text(700, 280, 'Battle for your Realm!', {
            fontSize: '28px',
            color: '#8b5cf6'
        }).setOrigin(0.5);
        
        // Start button
        const startBtn = this.add.text(700, 450, '⚔️ START BATTLE ⚔️', {
            fontSize: '40px',
            color: '#00ff00',
            backgroundColor: '#222',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        startBtn.on('pointerover', () => startBtn.setScale(1.1));
        startBtn.on('pointerout', () => startBtn.setScale(1));
        startBtn.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('BattleScene');
            });
        });
        
        // Credits
        this.add.text(700, 700, 'Zany Super-Jail Style', {
            fontSize: '18px',
            color: '#666'
        }).setOrigin(0.5);
        
        // Animated particles
        this.createParticles();
    }
    
    createParticles() {
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(100, 1300);
            const y = Phaser.Math.Between(100, 800);
            const particle = this.add.circle(x, y, Phaser.Math.Between(3, 8), 0x8b5cf6, 0.5);
            
            this.tweens.add({
                targets: particle,
                y: y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                yoyo: true,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
}

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
        
        // Game state
        this.playerElixir = 5;
        this.maxElixir = 10;
        this.elixirRegenRate = 500; // ms per elixir
        this.gameTime = 240; // 4 minutes in seconds
        this.gameState = 'playing'; // playing, paused, victory, defeat
        
        // Lanes (3 lanes: left=0, center=1, right=2)
        this.lanes = [
            { x: 250, y: 250 },
            { x: 700, y: 250 },
            { x: 1150, y: 250 }
        ];
        
        // Units arrays
        this.playerUnits = [];
        this.enemyUnits = [];
        
        // Card hand
        this.cardHand = [];
        this.selectedCard = null;
        
        // Towers
        this.playerKingHP = 1000;
        this.enemyKingHP = 1000;
        this.maxKingHP = 1000;
    }
    
    preload() {
        // Create placeholder graphics for cards
        this.createPlaceholderGraphics();
    }
    
    create() {
        // Background
        this.add.rectangle(700, 450, 1400, 900, 0x1a0a2e);
        
        // Create lanes
        this.createLanes();
        
        // Create towers
        this.createTowers();
        
        // Create UI
        this.createUI();
        
        // Create card hand
        this.createCardHand();
        
        // Start elixir regen
        this.time.addEvent({
            delay: this.elixirRegenRate,
            callback: this.regenElixir,
            callbackScope: this,
            loop: true
        });
        
        // Game timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        // Enemy AI spawner
        this.time.addEvent({
            delay: 4000,
            callback: this.enemySpawn,
            callbackScope: this,
            loop: true
        });
        
        // Combat loop
        this.time.addEvent({
            delay: 500,
            callback: this.combatLoop,
            callbackScope: this,
            loop: true
        });
        
        // Input
        this.input.on('pointerdown', this.onPointerDown, this);
    }
    
    createPlaceholderGraphics() {
        // Create card back texture
        const cardBack = this.make.graphics().fillStyle(0x4a0080).fillRoundedRect(0, 0, 100, 140, 10);
        cardBack.generateTexture('cardBack', 100, 140);
        
        // Create lane texture
        const lane = this.make.graphics().fillStyle(0x2a1a3e).fillRect(0, 0, 200, 300);
        lane.generateTexture('lane', 200, 300);
        
        // Create tower texture
        const tower = this.make.graphics().fillStyle(0x666666).fillRect(0, 0, 80, 120);
        tower.generateTexture('tower', 80, 120);
        
        // Create unit circle
        const unit = this.make.graphics().fillStyle(0xff6600).fillCircle(30, 30, 30);
        unit.generateTexture('unit', 60, 60);
        
        // Create enemy unit
        const enemyUnit = this.make.graphics().fillStyle(0xff0044).fillCircle(30, 30, 30);
        enemyUnit.generateTexture('enemyUnit', 60, 60);
    }
    
    createLanes() {
        // Draw lane dividers
        for (let i = 0; i < 3; i++) {
            const laneBg = this.add.graphics();
            laneBg.fillStyle(0x2a1a3e, 0.5);
            laneBg.fillRoundedRect(this.lanes[i].x - 100, 100, 200, 600, 20);
            
            // Lane label
            this.add.text(this.lanes[i].x, 680, `LANE ${i + 1}`, {
                fontSize: '16px',
                color: '#666'
            }).setOrigin(0.5);
        }
        
        // Battle zone
        const battleZone = this.add.graphics();
        battleZone.lineStyle(4, 0x8b5cf6, 0.8);
        battleZone.strokeRoundedRect(100, 120, 1200, 500, 20);
    }
    
    createTowers() {
        // Player towers (left side)
        this.playerTowers = [];
        for (let i = 0; i < 3; i++) {
            const tower = this.add.sprite(150, 180 + i * 180, 'tower').setScale(1.2);
            tower.hp = 400;
            tower.maxHp = 400;
            tower.lane = i;
            tower.isKing = false;
            this.playerTowers.push(tower);
            
            // HP bar
            tower.hpBar = this.add.graphics();
            this.updateTowerHP(tower);
        }
        
        // Player King Tower
        this.playerKing = this.add.sprite(80, 450, 'tower').setScale(1.8);
        this.playerKing.hp = this.maxKingHP;
        this.playerKing.maxHp = this.maxKingHP;
        this.playerKing.isKing = true;
        this.playerKingTower = this.add.graphics();
        this.updateKingHP(this.playerKing, this.playerKingTower);
        
        // Enemy towers (right side)
        this.enemyTowers = [];
        for (let i = 0; i < 3; i++) {
            const tower = this.add.sprite(1250, 180 + i * 180, 'tower').setScale(1.2).setTint(0xff4444);
            tower.hp = 400;
            tower.maxHp = 400;
            tower.lane = i;
            tower.isKing = false;
            this.enemyTowers.push(tower);
            
            tower.hpBar = this.add.graphics();
            this.updateTowerHP(tower);
        }
        
        // Enemy King Tower
        this.enemyKing = this.add.sprite(1320, 450, 'tower').setScale(1.8).setTint(0xff4444);
        this.enemyKing.hp = this.maxKingHP;
        this.enemyKing.maxHp = this.maxKingHP;
        this.enemyKing.isKing = true;
        this.enemyKingTower = this.add.graphics();
        this.updateKingHP(this.enemyKing, this.enemyKingTower);
    }
    
    updateTowerHP(tower) {
        tower.hpBar.clear();
        const pct = tower.hp / tower.maxHp;
        tower.hpBar.fillStyle(0x00ff00);
        tower.hpBar.fillRect(tower.x - 40, tower.y + 60, 80 * pct, 8);
        tower.hpBar.fillStyle(0xff0000);
        tower.hpBar.fillRect(tower.x - 40 + 80 * pct, tower.y + 60, 80 * (1 - pct), 8);
    }
    
    updateKingHP(king, graphics) {
        graphics.clear();
        const pct = king.hp / king.maxHp;
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(king.x - 50, king.y + 80, 100 * pct, 12);
        graphics.fillStyle(0xff0000);
        graphics.fillRect(king.x - 50 + 100 * pct, king.y + 80, 100 * (1 - pct), 12);
    }
    
    createUI() {
        // Top bar background
        const topBar = this.add.graphics();
        topBar.fillStyle(0x000000, 0.7);
        topBar.fillRect(0, 0, 1400, 80);
        
        // Timer
        this.timerText = this.add.text(700, 40, '4:00', {
            fontSize: '32px',
            color: '#fff'
        }).setOrigin(0.5);
        
        // Player elixir
        this.elixirText = this.add.text(100, 40, '⚗️ 5/10', {
            fontSize: '28px',
            color: '#00ff00'
        }).setOrigin(0.5);
        
        // Enemy elixir (for display)
        this.enemyElixirText = this.add.text(1300, 40, '⚗️ AI: 5', {
            fontSize: '24px',
            color: '#ff6666'
        }).setOrigin(0.5);
        
        // Battle instructions
        this.add.text(700, 750, 'Click card → Click lane to deploy', {
            fontSize: '18px',
            color: '#888'
        }).setOrigin(0.5);
    }
    
    createCardHand() {
        // Starting hand (4 cards)
        const cardIds = ['tunnel_terry', 'sgt_bust_through', 'miner_mike', 'mcgluff'];
        
        for (let i = 0; i < cardIds.length; i++) {
            this.addCardToHand(cardIds[i], i);
        }
    }
    
    addCardToHand(cardId, index) {
        const card = CARD_DATA[cardId];
        if (!card) return;
        
        const x = 200 + index * 300;
        const y = 800;
        
        // Card background
        const cardBg = this.add.graphics();
        cardBg.fillStyle(RARITY_COLORS[card.rarity]);
        cardBg.fillRoundedRect(0, 0, 120, 160, 12);
        cardBg.fillStyle(0x222222);
        cardBg.fillRoundedRect(10, 10, 100, 140, 8);
        
        // Generate texture
        cardBg.generateTexture(`card_${cardId}_${index}`, 120, 160);
        cardBg.destroy();
        
        const cardSprite = this.add.sprite(x, y, `card_${cardId}_${index}`).setInteractive();
        cardSprite.cardId = cardId;
        cardSprite.elixirCost = card.elixir;
        
        // Card name
        this.add.text(x, y - 50, card.name, {
            fontSize: '12px',
            color: '#fff'
        }).setOrigin(0.5);
        
        // Elixir cost
        this.add.text(x, y + 55, `⚗️${card.elixir}`, {
            fontSize: '20px',
            color: '#00ff00'
        }).setOrigin(0.5);
        
        // Card type/rarity
        this.add.text(x, y - 65, `${card.rarity.toUpperCase()}`, {
            fontSize: '10px',
            color: '#888'
        }).setOrigin(0.5);
        
        cardSprite.on('pointerdown', () => this.selectCard(cardSprite));
        
        this.cardHand.push(cardSprite);
    }
    
    selectCard(cardSprite) {
        // Check elixir
        if (cardSprite.elixirCost > this.playerElixir) {
            this.flashElixir();
            return;
        }
        
        // Deselect previous
        this.cardHand.forEach(c => c.setScale(1));
        
        // Select new
        cardSprite.setScale(1.2);
        this.selectedCard = cardSprite;
        
        // Highlight lanes
        this.highlightLanes();
    }
    
    highlightLanes() {
        // Remove old highlights
        this.laneHighlights = this.laneHighlights || [];
        this.laneHighlights.forEach(h => h.destroy());
        this.laneHighlights = [];
        
        if (!this.selectedCard) return;
        
        // Add highlights
        for (let i = 0; i < 3; i++) {
            const hl = this.add.graphics();
            hl.lineStyle(4, 0x00ff00, 0.8);
            hl.strokeRoundedRect(this.lanes[i].x - 100, 100, 200, 600, 20);
            this.laneHighlights.push(hl);
        }
    }
    
    flashElixir() {
        this.tweens.add({
            targets: this.elixirText,
            scale: 1.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
    }
    
    onPointerDown(pointer) {
        if (!this.selectedCard) return;
        
        // Check which lane was clicked
        for (let i = 0; i < 3; i++) {
            if (pointer.x > this.lanes[i].x - 100 && 
                pointer.x < this.lanes[i].x + 100 &&
                pointer.y > 100 && 
                pointer.y < 700) {
                
                this.deployCard(this.selectedCard, i);
                break;
            }
        }
    }
    
    deployCard(cardSprite, laneIndex) {
        const cardId = cardSprite.cardId;
        const card = CARD_DATA[cardId];
        
        // Deduct elixir
        this.playerElixir -= card.elixir;
        this.updateElixirDisplay();
        
        // Create unit
        const unit = this.add.sprite(180, 250 + laneIndex * 180, 'unit');
        unit.cardId = cardId;
        unit.hp = card.hp;
        unit.maxHp = card.hp;
        unit.damage = card.damage;
        unit.speed = card.speed;
        unit.type = card.type;
        unit.ability = card.ability;
        unit.lane = laneIndex;
        unit.isPlayer = true;
        
        // Unit HP bar
        unit.hpBar = this.add.graphics();
        this.updateUnitHP(unit);
        
        this.playerUnits.push(unit);
        
        // Remove from hand
        const idx = this.cardHand.indexOf(cardSprite);
        if (idx > -1) {
            this.cardHand.splice(idx, 1);
            cardSprite.destroy();
        }
        
        // Deselect
        this.selectedCard = null;
        this.highlightLanes();
        
        // Draw new card
        this.drawNewCard();
    }
    
    drawNewCard() {
        const cardIds = Object.keys(CARD_DATA);
        const randomId = cardIds[Math.floor(Math.random() * cardIds.length)];
        this.addCardToHand(randomId, this.cardHand.length);
    }
    
    updateUnitHP(unit) {
        unit.hpBar.clear();
        const pct = unit.hp / unit.maxHp;
        unit.hpBar.fillStyle(0x00ff00);
        unit.hpBar.fillRect(unit.x - 25, unit.y - 40, 50 * pct, 6);
    }
    
    regenElixir() {
        if (this.playerElixir < this.maxElixir) {
            this.playerElixir++;
            this.updateElixirDisplay();
        }
    }
    
    updateElixirDisplay() {
        this.elixirText.setText(`⚗️ ${this.playerElixir}/${this.maxElixir}`);
    }
    
    updateTimer() {
        if (this.gameState !== 'playing') return;
        
        this.gameTime--;
        
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        // Sudden death warning
        if (this.gameTime <= 60) {
            this.timerText.setColor('#ff0000');
            this.cameras.main.shake(100, 0.01);
        }
        
        // Game over
        if (this.gameTime <= 0) {
            this.endGame();
        }
    }
    
    enemySpawn() {
        if (this.gameState !== 'playing') return;
        
        // Simple AI: spawn random card in random lane
        const cardIds = Object.keys(CARD_DATA);
        const cardId = cardIds[Math.floor(Math.random() * cardIds.length)];
        const card = CARD_DATA[cardId];
        const lane = Math.floor(Math.random() * 3);
        
        const unit = this.add.sprite(1220, 250 + lane * 180, 'enemyUnit');
        unit.cardId = cardId;
        unit.hp = card.hp;
        unit.maxHp = card.hp;
        unit.damage = card.damage;
        unit.speed = card.speed;
        unit.type = card.type;
        unit.ability = card.ability;
        unit.lane = lane;
        unit.isPlayer = false;
        
        unit.hpBar = this.add.graphics();
        this.updateUnitHP(unit);
        
        this.enemyUnits.push(unit);
    }
    
    combatLoop() {
        if (this.gameState !== 'playing') return;
        
        // Move units
        this.playerUnits.forEach(unit => {
            if (unit.speed > 0) {
                unit.x += unit.speed * 2;
                
                // Check for enemy
                const target = this.enemyUnits.find(e => 
                    e.lane === unit.lane && 
                    Phaser.Math.Distance.Between(unit.x, unit.y, e.x, e.y) < 60
                );
                
                if (target) {
                    // Attack
                    target.hp -= unit.damage;
                    this.updateUnitHP(target);
                    
                    if (target.hp <= 0) {
                        target.destroy();
                        target.hpBar.destroy();
                        this.enemyUnits = this.enemyUnits.filter(e => e !== target);
                    }
                }
                
                // Check for enemy tower
                const tower = this.enemyTowers.find(t => t.lane === unit.lane);
                if (tower && unit.x > 1150) {
                    tower.hp -= unit.damage;
                    this.updateTowerHP(tower);
                    unit.destroy();
                    unit.hpBar.destroy();
                    this.playerUnits = this.playerUnits.filter(u => u !== unit);
                    
                    if (tower.hp <= 0) {
                        // Tower destroyed!
                    }
                }
                
                // Check for enemy king
                if (unit.x > 1280) {
                    this.enemyKing.hp -= unit.damage;
                    this.updateKingHP(this.enemyKing, this.enemyKingTower);
                    unit.destroy();
                    unit.hpBar.destroy();
                    this.playerUnits = this.playerUnits.filter(u => u !== unit);
                    
                    if (this.enemyKing.hp <= 0) {
                        this.gameState = 'victory';
                        this.showEndScreen('VICTORY! 🏆');
                    }
                }
            }
        });
        
        // Enemy units move left
        this.enemyUnits.forEach(unit => {
            if (unit.speed > 0) {
                unit.x -= unit.speed * 2;
                
                // Check for player unit
                const target = this.playerUnits.find(p => 
                    p.lane === unit.lane && 
                    Phaser.Math.Distance.Between(unit.x, unit.y, p.x, p.y) < 60
                );
                
                if (target) {
                    target.hp -= unit.damage;
                    this.updateUnitHP(target);
                    
                    if (target.hp <= 0) {
                        target.destroy();
                        target.hpBar.destroy();
                        this.playerUnits = this.playerUnits.filter(p => p !== target);
                    }
                }
                
                // Check for player tower
                const tower = this.playerTowers.find(t => t.lane === unit.lane);
                if (tower && unit.x < 250) {
                    tower.hp -= unit.damage;
                    this.updateTowerHP(tower);
                    unit.destroy();
                    unit.hpBar.destroy();
                    this.enemyUnits = this.enemyUnits.filter(e => e !== unit);
                }
                
                // Check for player king
                if (unit.x < 120) {
                    this.playerKing.hp -= unit.damage;
                    this.updateKingHP(this.playerKing, this.playerKingTower);
                    unit.destroy();
                    unit.hpBar.destroy();
                    this.enemyUnits = this.enemyUnits.filter(e => e !== unit);
                    
                    if (this.playerKing.hp <= 0) {
                        this.gameState = 'defeat';
                        this.showEndScreen('DEFEAT 💀');
                    }
                }
            }
        });
    }
    
    showEndScreen(message) {
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, 1400, 900);
        
        const text = this.add.text(700, 450, message, {
            fontSize: '64px',
            color: '#fff'
        }).setOrigin(0.5);
        
        // Restart button
        const restartBtn = this.add.text(700, 550, 'PLAY AGAIN', {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });
    }
    
    endGame() {
        if (this.playerKing.hp > this.enemyKing.hp) {
            this.gameState = 'victory';
            this.showEndScreen('VICTORY! 🏆');
        } else {
            this.gameState = 'defeat';
            this.showEndScreen('DEFEAT 💀');
        }
    }
}

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 900,
    parent: 'game-container',
    backgroundColor: '#1a0a2e',
    scene: [MenuScene, BattleScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

// Start Game
const game = new Phaser.Game(config);