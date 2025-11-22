import { AUTO, Game } from "phaser";
import { FlappyBird } from "./scenes/FlappyBird";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 480,
    height: 800,
    parent: "game-container",
    backgroundColor: "#87CEEB",
    scene: [FlappyBird],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 1500 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 480,
        height: 800,
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
