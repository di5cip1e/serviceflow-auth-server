// TitleScene.js - Stormy title screen
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        // Dark stormy background
        this.cameras.main.setBackgroundColor('#0a0a12');
        
        // Create rain particles
        this.createRain();
        
        // Create lightning system
        this.createLightning();
        
        // Create glowing TRAP title
        this.createTitle();
        
        // Create pulsing TAP TO START
        this.createStartPrompt();
        
        // Input to start game
        this.input.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });
        
        // Also allow keyboard input
        this.input.keyboard.on('keydown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });
    }

    createRain() {
        const rainGraphics = this.add.graphics();
        rainGraphics.fillStyle(0x8899aa, 0.3);
        
        // Create rain drops
        this.rainDrops = [];
        for (let i = 0; i < 150; i++) {
            const x = Phaser.Math.Between(0, this.scale.width);
            const y = Phaser.Math.Between(0, this.scale.height);
            const length = Phaser.Math.Between(10, 25);
            const speed = Phaser.Math.Between(800, 1500);
            
            rainGraphics.fillRect(x, y, 1, length);
            
            this.rainDrops.push({ x, y, length, speed, graphics: rainGraphics });
        }
        
        // Animate rain
        this.time.addEvent({
            delay: 16,
            callback: () => {
                rainGraphics.clear();
                rainGraphics.fillStyle(0x8899aa, 0.3);
                
                this.rainDrops.forEach(drop => {
                    drop.y += drop.speed * 0.016;
                    if (drop.y > this.scale.height) {
                        drop.y = -drop.length;
                        drop.x = Phaser.Math.Between(0, this.scale.width);
                    }
                    rainGraphics.fillRect(drop.x, drop.y, 1, drop.length);
                });
            },
            loop: true
        });
    }

    createLightning() {
        // White overlay for lightning flash
        this.lightningOverlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0xffffff,
            0
        );
        
        // Random lightning flashes
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 6000),
            callback: () => {
                this.triggerLightning();
                this.time.addEvent({
                    delay: Phaser.Math.Between(2000, 6000),
                    callback: () => this.triggerLightning(),
                    loop: true
                });
            },
            loop: true
        });
    }

    triggerLightning() {
        // Flash
        this.lightningOverlay.setFillStyle(0xffffff, 0.8);
        this.tweens.add({
            targets: this.lightningOverlay,
            alpha: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                // Secondary flash sometimes
                if (Math.random() > 0.5) {
                    this.time.delayedCall(100, () => {
                        this.lightningOverlay.setFillStyle(0xffffff, 0.4);
                        this.tweens.add({
                            targets: this.lightningOverlay,
                            alpha: 0,
                            duration: 100
                        });
                    });
                }
            }
        });
        
        // Flash background briefly
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.time.delayedCall(100, () => {
            this.cameras.main.setBackgroundColor('#0a0a12');
        });
    }

    createTitle() {
        // Glow layers (behind text)
        const glowColors = [0x00ffff, 0x00cccc, 0x009999];
        const glows = [];
        
        glowColors.forEach((color, i) => {
            const glow = this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 - 50,
                'TRAP',
                {
                    fontFamily: 'Arial Black',
                    fontSize: '80px',
                    color: '#' + color.toString(16).padStart(6, '0'),
                    fontStyle: 'bold'
                }
            );
            glow.setOrigin(0.5);
            glow.setAlpha(0.3 - i * 0.1);
            glow.setScale(1.1 + i * 0.05);
            glows.push(glow);
        });
        
        // Main text
        const title = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 50,
            'TRAP',
            {
                fontFamily: 'Arial Black',
                fontSize: '80px',
                color: '#00ffff',
                fontStyle: 'bold'
            }
        );
        title.setOrigin(0.5);
        
        // Pulsing glow effect
        this.tweens.add({
            targets: [...glows, title],
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createStartPrompt() {
        const startText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 80,
            'TAP TO START',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#aaaaaa'
            }
        );
        startText.setOrigin(0.5);
        
        // Pulsing effect
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Slight scale pulse
        this.tweens.add({
            targets: startText,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}
