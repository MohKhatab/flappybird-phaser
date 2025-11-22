import { useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { EventBus } from "./game/EventBus";
import { GameStates } from "./types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getLeaderboard, submitScore } from "./services/scoreService";
function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    const [score, setScore] = useState<number>(0);
    const [gameState, setGameState] = useState<GameStates>("menu");
    const [name, setName] = useState<string>("");
    const [submitted, setSubmitted] = useState<boolean>(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["score"],
        queryFn: getLeaderboard,
    });

    const { mutate, isPending, isSuccess, isError } = useMutation({
        mutationFn: submitScore,
        onSuccess: () => {
            setName("");
            refetch();
        },
    });

    function handleRestartClick() {
        EventBus.emit("restart-game");
        setSubmitted(false);
    }

    function handleStartClick() {
        EventBus.emit("start-game");
        setGameState("running");
        setSubmitted(false);
    }

    function handleScoreSubmit() {
        setSubmitted(true);
        mutate({
            name: name || "Player",
            score,
        });
    }

    return (
        <div
            id="app"
            className="h-screen overflow-hidden flex flex-col items-center justify-center"
        >
            <PhaserGame
                ref={phaserRef}
                setScore={setScore}
                setGameState={setGameState}
            />

            <p className="text-4xl font-bold text-white text-shadow-black text-shadow-lg p-4 absolute top-8 z-10">
                {score}
            </p>

            {gameState === "lost" && (
                <div className="w-full h-screen bg-black/60 relative z-10 flex flex-col items-center justify-center p-6 gap-8">
                    <div className="bg-gray-50 w-full max-w-sm p-8 rounded-xl flex flex-col items-center shadow-xl">
                        <p className="text-2xl text-red-600 font-bold">
                            Gameover
                        </p>
                        <p className="mt-8 text-lg">Score : {score}</p>
                        <button
                            className="bg-green-600 text-white px-8 py-4 font-bold rounded-lg mt-8 cursor-pointer hover:bg-green-500 transition-colors"
                            onClick={handleRestartClick}
                        >
                            Restart
                        </button>

                        <button
                            onClick={() => setGameState("menu")}
                            className="mt-4 text-sm text-green-600 cursor-pointer py-3"
                        >
                            Main Menu
                        </button>
                    </div>
                    <div className="w-full max-w-sm flex flex-col gap-4">
                        <input
                            type="text"
                            className="bg-white w-full rounded-xl py-4 px-4"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <button
                            onClick={handleScoreSubmit}
                            disabled={isPending || submitted}
                            className="bg-green-600 hover:bg-green-500 disabled:hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 font-bold rounded-xl cursor-pointer transition-colors"
                        >
                            Submit Score
                        </button>
                        {isSuccess && submitted && (
                            <p className="text-green-500 text-center">
                                Score Submitted!
                            </p>
                        )}
                        {isError && submitted && (
                            <p className="text-red-500 text-center">
                                Failed To Submit
                            </p>
                        )}
                    </div>
                </div>
            )}

            {gameState === "menu" && (
                <div className="w-full h-screen bg-black/60 relative z-10 flex flex-col items-center justify-center p-6">
                    <button
                        className="bg-green-600 text-white px-8 py-3 font-bold rounded-lg mt-8 cursor-pointer hover:bg-green-500 transition-colors"
                        onClick={handleStartClick}
                    >
                        Start
                    </button>

                    <table className="w-full max-w-sm bg-white rounded-xl mt-8 overflow-hidden shadow">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="text-left p-4 font-medium">
                                    Name
                                </th>
                                <th className="text-left p-4 font-medium">
                                    Score
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading || !data ? (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="text-center p-6 text-gray-500"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : (
                                data.map((s) => (
                                    <tr
                                        key={s.name + s.score}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="p-4">{s.name}</td>
                                        <td className="p-4">{s.score}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default App;
