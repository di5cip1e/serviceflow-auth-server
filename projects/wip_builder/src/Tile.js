import Phaser from "phaser";
import { Config } from "./Config.js";
import { IsoUtils } from "./IsoUtils.js";
import { getBuildingConfig } from "./BuildingRegistry.js";

export class Tile extends Phaser.GameObjects.Image {
  constructor(scene, x, y, type, row, col) {
    const config = getBuildingConfig(type);
    const texture = config.texture || type;
    super(scene, x, y, texture);
    this.scene = scene;
    this.gridRow = row;
    this.gridCol = col;
    this.isFlipped = false;
    this.buildingType = type;

    // Standard isometric anchor: bottom-center of footprint
    this.setOrigin(0.5, 1);
    this.updateScale();

    scene.add.existing(this);
  }

  setFlip(flipped) {
    this.isFlipped = flipped;
    this.updateScale();
  }

  playPlacementAnimation() {
    const config = getBuildingConfig(this.buildingType);
    if (this.buildingType === "grass") return;

    // Reset scale to 0 to start
    const targetScaleX = this.scaleX;
    const targetScaleY = this.scaleY;
    
    this.setScale(0, 0);

    this.scene.tweens.add({
      targets: this,
      scaleX: targetScaleX,
      scaleY: targetScaleY,
      duration: 500,
      ease: "Back.easeOut",
      easeParams: [1.5]
    });

    // Bounce effect: a little vertical hop
    const originalY = this.y;
    this.scene.tweens.add({
      targets: this,
      y: originalY - 20,
      duration: 150,
      yoyo: true,
      ease: "Quad.easeOut"
    });

    // Simple "poof" particles
    for (let i = 0; i < 8; i++) {
      const angle = Phaser.Math.DegToRad(i * (360 / 8));
      const dist = 40 + Math.random() * 20;
      const particle = this.scene.add.circle(
        this.x, 
        this.y - Config.tileHeight / 2, 
        4 + Math.random() * 4, 
        0xffffff, 
        0.8
      );
      this.scene.gridManager.container.add(particle);
      particle.setDepth(this.depth + 1);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * dist,
        y: this.y - Config.tileHeight / 2 + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.1,
        duration: 400 + Math.random() * 200,
        ease: "Cubic.easeOut",
        onComplete: () => particle.destroy()
      });
    }
  }

  playIncomeAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const originalScaleX = this.scaleX;
    const originalScaleY = this.scaleY;

    this.scene.tweens.add({
      targets: this,
      scaleX: originalScaleX * 1.1,
      scaleY: originalScaleY * 0.9,
      duration: 100,
      yoyo: true,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.setScale(originalScaleX, originalScaleY);
        this.isAnimating = false;
      }
    });
  }

  updateType(type) {
    this.buildingType = type;
    const config = getBuildingConfig(type);
    const texture = config.texture || type;
    this.setTexture(texture);
    this.updateScale();
  }

  updateScale() {
    const config = getBuildingConfig(this.buildingType);

    // Scale to match tile width (or multi-tile width)
    const targetWidth = Config.tileWidth * config.size;
    const currentWidth = this.width;

    if (currentWidth > 0) {
      const baseScale = targetWidth / currentWidth;
      this.setScale(this.isFlipped ? -baseScale : baseScale, baseScale);
    }

    const worldPos = IsoUtils.gridToWorld(this.gridRow, this.gridCol);
    const offsetToBottom =
      Config.tileHeight / 2 + (config.size - 1) * Config.tileHeight;

    this.setPosition(worldPos.x, worldPos.y + offsetToBottom);
  }
}
