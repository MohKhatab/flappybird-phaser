import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class FlappyBird extends Scene {
    bird: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    pipeGroup: Phaser.Physics.Arcade.Group;
    isAlive = false;
    score = 0;
    pipeHeight = 400;
    gap = 250;
    isPaused = true;

    constructor() {
        super("FlappyBird");
    }

    preload() {
        this.load.image(
            "pipe",
            "https://placehold.co/50x400/008000/000000?text=P"
        );
        this.load.image(
            "bird",
            "https://placehold.co/60x40/FFD700/000000?text=B"
        );
    }

    create() {
        this.isAlive = true;
        this.score = 0;
        if (this.isPaused) this.physics.pause();

        // Bird
        this.bird = this.physics.add
            .sprite(100, 300, "bird")
            .setOrigin(0.5, 0.5);
        this.bird.body.setGravityY(10);
        this.bird.setCollideWorldBounds(true);
        this.bird.body.onWorldBounds = true;

        // Pipes
        this.pipeGroup = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });

        this.time.addEvent({
            delay: 1500,
            callback: this.spawnPipePair,
            callbackScope: this,
            loop: true,
        });

        // Collision & Controls
        this.physics.add.collider(
            this.bird,
            this.pipeGroup,
            this.onHit,
            undefined,
            this
        );

        EventBus.on("restart-game", this.restartGame, this);
        EventBus.on("start-game", this.startGame, this);
        this.input.on("pointerdown", this.jump, this);
    }

    jump() {
        if (this.isAlive) {
            this.bird.body.setVelocityY(-550);
            this.tweens.add({
                targets: this.bird,
                angle: -20,
                duration: 150,
            });
        }
    }

    onHit() {
        this.isAlive = false;
        this.bird.setTint(0xff0000);
        this.bird.setVelocity(0);
        this.physics.pause();
        EventBus.emit("game-lose");
    }

    startGame() {
        this.isPaused = false;
        this.restartGame();
    }

    spawnPipePair() {
        if (!this.isAlive) return;
        if (this.isPaused) return;
        const minGapY = 100;
        const maxGapY = this.scale.height - 100;
        const center = Phaser.Math.Between(
            minGapY + this.gap / 2,
            maxGapY - this.gap / 2
        );

        const topPipeLength = center - this.gap / 2;
        const bottomPipeLength = this.scale.height - (center + this.gap / 2);

        const topPipe = this.pipeGroup.create(
            this.scale.width,
            topPipeLength / 2,
            "pipe"
        );
        topPipe.setFlipY(true);
        topPipe.setDisplaySize(topPipe.width, topPipeLength);

        // Scoreline
        const scoreLine = this.add.rectangle(
            this.scale.width,
            center,
            1,
            600,
            0xffffff,
            0
        );
        this.physics.world.enable(scoreLine);
        (scoreLine.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        (scoreLine.body as Phaser.Physics.Arcade.Body).immovable = true;
        (scoreLine.body as Phaser.Physics.Arcade.Body).setVelocityX(-200);
        scoreLine.name = "scoreLine";

        this.physics.add.overlap(
            this.bird,
            scoreLine,
            this.increaseScore,
            undefined,
            this
        );

        const bottomPipe = this.pipeGroup.create(
            this.scale.width,
            center + this.gap / 2 + bottomPipeLength / 2,
            "pipe"
        );
        bottomPipe.setDisplaySize(bottomPipe.width, bottomPipeLength);

        topPipe.setVelocityX(-200);
        bottomPipe.setVelocityX(-200);
    }

    increaseScore(_bird: unknown, scoreLine: unknown) {
        const sl = scoreLine as Phaser.GameObjects.Rectangle;
        if (sl && sl.name === "scoreLine" && this.isAlive) {
            this.score += 1;
            sl.destroy();
            EventBus.emit("score-update", this.score);
        }
    }

    restartGame() {
        this.score = 0;
        EventBus.emit("game-start");
        EventBus.emit("score-update", this.score);
        this.scene.restart();
    }

    update(): void {
        if (!this.isAlive) return;

        this.pipeGroup.getChildren().forEach((pipe) => {
            const p = pipe as Phaser.Physics.Arcade.Sprite;
            if (p.x < -p.width) {
                p.destroy();
            }
        });

        if (this.bird.body.velocity.y > 0) {
            this.tweens.add({
                targets: this.bird,
                angle: 45,
                duration: 150,
            });
        }
    }

    shutdown() {
        EventBus.off("restart-game", this.restartGame, this);
    }
}
