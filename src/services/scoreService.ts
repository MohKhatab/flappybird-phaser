import axios from "axios";
import { Score } from "../types";

export const getLeaderboard = async () => {
    return (await axios.get<Score[]>("https://flappybird-nest.onrender.com/"))
        .data;
};

export const submitScore = async (score: Score) => {
    await axios.post("https://flappybird-nest.onrender.com/", score);
};
