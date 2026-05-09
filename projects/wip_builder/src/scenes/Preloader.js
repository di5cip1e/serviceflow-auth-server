import Phaser from "phaser";
import { ASSETS } from "../../manifest.js";
import { BuildingRegistry } from "../BuildingRegistry.js";

export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Background image - centered, always shows center of square
    const bg = this.add.image(centerX, centerY, "loading_bg");
    const screenSize = Math.max(this.scale.width, this.scale.height);
    bg.setDisplaySize(screenSize, screenSize);

    // Responsive bar width (80% of screen, max 400px)
    const barWidth = Math.min(400, this.scale.width * 0.8);
    const fontSize = Math.min(24, this.scale.width * 0.05);

    // Background bar
    const barBg = this.add.rectangle(centerX, centerY, barWidth, 30, 0x141517);
    barBg.setStrokeStyle(2, 0x3a3a3a);

    // Progress bar
    const barFill = this.add.rectangle(
      centerX - barWidth / 2 + 2,
      centerY,
      0,
      26,
      0xffffff,
    );
    barFill.setOrigin(0, 0.5);

    // Loading text
    const loadingText = this.add
      .text(centerX, centerY - 50, "Loading...", {
        fontFamily: '"Press Start 2P"',
        fontSize: `${fontSize}px`,
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Update progress bar as assets load
    const fillWidth = barWidth - 4;
    this.load.on("progress", (value) => {
      barFill.width = fillWidth * value;
    });

    this.load.on("complete", () => {
      loadingText.setText("Complete!");
    });

    // Load all images from manifest
    Object.entries(ASSETS.images).forEach(([key, url]) => {
      if (url) {
        this.load.image(key, url);
      }
    });

    // Load audio if needed
    if (ASSETS.audio && ASSETS.audio.bgMusic) {
      // Note: Tone.js handles its own audio loading, so we don't load it here
      // But if we switch to Phaser audio later, we would load it here
    }
  }

  create() {
    // Brief delay to show "Complete!" then start the game
    this.time.delayedCall(500, () => {
      this.scene.start("GameScene");
    });
  }
}
