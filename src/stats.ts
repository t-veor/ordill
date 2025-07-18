import { useEffect, useState } from "preact/hooks";
import { DAILY_GUESSES } from "./consts";
import { WordleState } from "./wordleState";

export interface Stats {
    played: number;
    wins: number;
    currStreak: number;
    maxStreak: number;
    lastCompletedDay: number;
    lastPlayedDay: number;
    distribution: number[];
}

const initialStats: Stats = {
    played: 0,
    wins: 0,
    currStreak: 0,
    maxStreak: 0,
    lastCompletedDay: -1,
    lastPlayedDay: -1,
    distribution: new Array(DAILY_GUESSES).fill(0),
};

const isObject = (obj: unknown): obj is Record<string, unknown> => {
    return typeof obj === "object" && obj !== null;
};

const isInteger = (x: unknown): x is number => Number.isInteger(x);

const tryParseDistribution = (obj: unknown): number[] | null => {
    if (!Array.isArray(obj)) {
        return null;
    }

    if (obj.length !== DAILY_GUESSES) {
        return null;
    }

    for (const i of obj) {
        if (!Number.isInteger(i)) {
            return null;
        }
    }

    return obj;
};

const tryParseStats = (obj: unknown): Stats | null => {
    if (!isObject(obj)) {
        return null;
    }

    const played = obj.played;
    if (!isInteger(played)) {
        return null;
    }

    const wins = obj.wins;
    if (!isInteger(wins)) {
        return null;
    }

    const currStreak = obj.currStreak;
    if (!isInteger(currStreak)) {
        return null;
    }

    const maxStreak = obj.maxStreak;
    if (!isInteger(maxStreak)) {
        return null;
    }

    const lastCompletedDay = obj.lastCompletedDay;
    if (!isInteger(lastCompletedDay)) {
        return null;
    }

    const lastPlayedDay = obj.lastPlayedDay;
    if (!isInteger(lastPlayedDay)) {
        return null;
    }

    const distribution = tryParseDistribution(obj.distribution);
    if (distribution == null) {
        return null;
    }

    return {
        played,
        wins,
        currStreak,
        maxStreak,
        lastCompletedDay,
        lastPlayedDay,
        distribution,
    };
};

const MIGRATE_STATS_PREFIX = "#migrateStats--"

export const migrateStatsLink = (stats: Stats): string => {
    const url = new URL(window.location.href);
    const encodedStats = encodeURIComponent(JSON.stringify(stats));
    url.hash = `${MIGRATE_STATS_PREFIX}${encodedStats}`;
    return url.href;
}

export const tryMigrateStats = (): Stats | null => {
    if (window.location.hash.startsWith(MIGRATE_STATS_PREFIX)) {
        const encodedStats = window.location.hash.slice(MIGRATE_STATS_PREFIX.length);
        window.location.hash = "";
        try {
            const parsed: unknown = JSON.parse(decodeURIComponent(encodedStats));
            return tryParseStats(parsed);
        } catch (err) {
            console.log(err);
        }
    }

    return null;
}

const loadStats = (): Stats => {
    try {
        const data = localStorage.getItem("stats");
        if (data == null) {
            return initialStats;
        }
        const parsed: unknown = JSON.parse(data);
        const stats = tryParseStats(parsed);
        if (stats != null) {
            return stats;
        }
    } catch (err) {
        console.log(err);
    }

    return initialStats;
};

const saveStats = (stats: Stats) => {
    try {
        localStorage.setItem("stats", JSON.stringify(stats));
    } catch (err) {
        console.log(err);
    }
};

const updateStats = (stats: Stats, game: WordleState): Stats => {
    const { gameState, guessedWords, dailyNumber } = game;
    const guesses = guessedWords.length;
    if (
        gameState.name === "playing" ||
        dailyNumber == null ||
        guesses > DAILY_GUESSES ||
        dailyNumber <= stats.lastPlayedDay
    ) {
        return stats;
    }

    const won = gameState.name === "won";

    const newStats = { ...stats };
    newStats.played += 1;
    if (won) {
        newStats.wins += 1;
        if (stats.currStreak < 0 || dailyNumber > stats.lastCompletedDay + 1) {
            newStats.currStreak = 1;
        } else {
            newStats.currStreak = stats.currStreak + 1;
        }
        newStats.lastCompletedDay = dailyNumber;
        newStats.distribution[guesses - 1] += 1;
    } else {
        newStats.currStreak = 0;
    }
    newStats.maxStreak = Math.max(newStats.currStreak, stats.maxStreak);
    newStats.lastPlayedDay = dailyNumber;

    return newStats;
};

export const useStats = (): [Stats, (stats: Stats) => void, (game: WordleState) => void] => {
    const [stats, setStats] = useState(loadStats);
    useEffect(() => saveStats(stats), [stats]);

    const update = (game: WordleState) => {
        setStats(updateStats(stats, game));
    };
    return [stats, setStats, update];
};
