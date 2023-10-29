import { getTodayNumber } from "./daily";
import commonWords from "./common.wordlist.txt";

const mulberry32 = (a: number) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
};

const fisherYatesShuffle = (array: unknown[], rand: () => number) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = rand() % (i + 1);
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
};

const randomizerCache: Record<number, number[] | undefined> = {};
const getRandomizer = (generation: number) => {
    let cachedRandomizer = randomizerCache[generation];
    if (cachedRandomizer == null) {
        const randomizer = Array.from(
            { length: commonWords.length },
            (_, i) => i
        );
        fisherYatesShuffle(randomizer, mulberry32(0x9801d688 + generation));
        randomizerCache[generation] = randomizer;
        cachedRandomizer = randomizer;
    }
    return cachedRandomizer;
};

const getDailyIndex = (dayNumber: number) => {
    dayNumber = Math.max(0, dayNumber);
    const index = dayNumber % commonWords.length;
    const generation = (dayNumber / commonWords.length) | 0;
    return getRandomizer(generation)[index];
};

export const getDailyWord = (dayNumber: number) => {
    if (dayNumber === 666) {
        return "satan";
    }

    const index = getDailyIndex(dayNumber);
    return commonWords[index];
};

export const getRandomWord = () => {
    // Slight anti-spoiler thing - avoid picking words that come up as daily
    // words in the next 30 days.
    const nextDailyIndices = [];
    const today = getTodayNumber();
    for (let i = 0; i < 30; i++) {
        nextDailyIndices.push(getDailyIndex(today + i));
    }

    // Try to pick an index that is not included in the next 30 daily days. This
    // is bounded to 10 tries so that the extremely low probability of getting
    // caught in a loop doesn't happen
    let randomIndex = (Math.random() * commonWords.length) | 0;
    for (let i = 0; i < 10; i++) {
        if (!nextDailyIndices.includes(randomIndex)) {
            break;
        }
        randomIndex = (Math.random() * commonWords.length) | 0;
    }

    return commonWords[randomIndex];
};
