import Phaser from "phaser";
import { Config } from "./src/Config.js";
import { Boot } from "./src/scenes/Boot.js";
import { Preloader } from "./src/scenes/Preloader.js";
import { GameScene } from "./src/scenes/GameScene.js";

const phaserConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#2E3641",
  roundPixels: true,
  pixelArt: false,
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: "100%",
    height: "100%",
  },
  scene: [Boot, Preloader, GameScene],
};

const game = new Phaser.Game(phaserConfig);
