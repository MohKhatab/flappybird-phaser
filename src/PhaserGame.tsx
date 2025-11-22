import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./game/main";
import { EventBus } from "./game/EventBus";
import { GameStates } from "./types";

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setGameState: React.Dispatch<React.SetStateAction<GameStates>>;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
    function PhaserGame({ setScore, setGameState }: IProps, ref) {
        const game = useRef<Phaser.Game | null>(null!);

        useLayoutEffect(() => {
            if (game.current === null) {
                game.current = StartGame("game-container");

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: null });
                } else if (ref) {
                    ref.current = { game: game.current, scene: null };
                }
            }

            return () => {
                if (game.current) {
                    game.current.destroy(true);
                    if (game.current !== null) {
                        game.current = null;
                    }
                }
            };
        }, [ref]);

        useEffect(() => {
            EventBus.on("score-update", setScore);
            EventBus.on("game-lose", () => setGameState("lost"));
            EventBus.on("game-start", () => setGameState("running"));

            return () => {
                EventBus.removeListener("score-update");
                EventBus.removeListener("game-lose");
            };
        }, [ref]);

        return (
            <div
                id="game-container"
                className="w-full h-screen absolute overflow-hidden"
            ></div>
        );
    }
);
