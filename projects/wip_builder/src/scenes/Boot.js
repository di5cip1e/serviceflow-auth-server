import Phaser from "phaser";
import { ASSETS } from "../../manifest.js";

export class Boot extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    // Load background image for preloader
    this.load.image("loading_bg", ASSETS.images.loading_bg);
  }

  async create() {
    // Show loading_bg immediately while font loads
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const bg = this.add.image(centerX, centerY, "loading_bg");
    const screenSize = Math.max(this.scale.width, this.scale.height);
    bg.setDisplaySize(screenSize, screenSize);

    // Load webfont before rendering any text
    await document.fonts.load('16px "Press Start 2P"');

    // Initialize game-wide settings
    this.registry.set("money", 100);
    this.registry.set("population", 0);
    this.registry.set("happiness", 1.0);

    // Transition to Preloader
    this.scene.start("Preloader");
  }
}
