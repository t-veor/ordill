import { h, Fragment, createContext } from "preact";
import { getTodayNumber, timeUntilNextDayMs } from "./words/daily";
import Header from "./Header";
import settingsManager from "./settings";
import { Toaster } from "./Toaster";
import Wordle from "./Wordle";
import {
    inProgress,
    loadGameOrNew,
    useWordle,
    WordleState,
} from "./wordleState";
import { StatsModal } from "./StatsModal";
import { useEffect, useRef, useState } from "preact/hooks";
import { useStats } from "./stats";
import { InstructionsModal } from "./InstructionsModal";

export interface AppContext {
    isDaily: boolean;
    setIsDaily?: (isDaily: boolean) => void;
    todayNumber: number;

    statsDidShow: boolean;
    openStats?: () => void;

    hardMode: boolean;
    gameInProgress: boolean;
    setHardMode?: (hardMode: boolean) => void;
}

export const AppContext = createContext<AppContext>({
    isDaily: false,
    statsDidShow: false,
    todayNumber: getTodayNumber(),
    hardMode: false,
    gameInProgress: false,
});

export default function App() {
    const [todayNumber, setTodayNumber] = useState(getTodayNumber());
    useEffect(() => {
        const timeout = setTimeout(() => {
            setTodayNumber(getTodayNumber());
        }, timeUntilNextDayMs(todayNumber));
        return () => clearTimeout(timeout);
    }, [todayNumber]);

    const [wordle, dispatchWordle] = useWordle(() =>
        loadGameOrNew(settingsManager.get(), todayNumber)
    );
    const [currDaily, setCurrDaily] = useState<WordleState | null>(null);
    useEffect(() => {
        if (wordle.dailyNumber === todayNumber) {
            setCurrDaily(wordle);
        }
    }, [wordle, todayNumber]);

    const [stats, updateStats] = useStats();
    useEffect(() => updateStats(wordle), [wordle]);

    const setIsDaily = (isDaily: boolean) => {
        const prevIsDaily = wordle.dailyNumber != null;
        if (isDaily !== prevIsDaily) {
            dispatchWordle({
                type: "load",
                newState: loadGameOrNew(
                    settingsManager.get(),
                    isDaily ? todayNumber : undefined,
                    wordle
                ),
            });
        }
    };

    const [statsOpen, setStatsOpen] = useState(false);
    const [statsDidShow, setStatsDidShow] = useState(false);
    const statsDidShowHandle = useRef<number | null>(null);

    const closeStats = () => setStatsOpen(false);
    const openStats = () => {
        if (statsDidShowHandle.current != null) {
            clearTimeout(statsDidShowHandle.current);
        }
        setStatsDidShow(true);
        setStatsOpen(true);
    };
    useEffect(() => {
        const isEndGame = wordle.gameState.name !== "playing";
        const isTodaysDaily = wordle.dailyNumber === todayNumber;

        if (isTodaysDaily && isEndGame) {
            statsDidShowHandle.current = setTimeout(() => {
                setStatsDidShow(true);
                setStatsOpen(true);
            }, 2000);
            return () => {
                if (statsDidShowHandle.current != null) {
                    clearTimeout(statsDidShowHandle.current);
                }
            };
        } else {
            setStatsDidShow(false);
            setStatsOpen(false);
        }
    }, [wordle.gameState, wordle.dailyNumber, todayNumber]);

    const setHardMode = (hardMode: boolean) => {
        dispatchWordle({ type: "setHardMode", hardMode });
    };

    const context: AppContext = {
        isDaily: wordle.dailyNumber != null,
        setIsDaily,
        todayNumber,
        openStats,
        statsDidShow,
        hardMode: wordle.hardMode,
        gameInProgress: inProgress(wordle),
        setHardMode,
    };

    return (
        <AppContext.Provider value={context}>
            <div class="main-container">
                <Header />
                <hr />
                <Wordle
                    wordle={wordle}
                    dispatchWordle={dispatchWordle}
                    todayNumber={todayNumber}
                    onShowStats={openStats}
                />
                <Toaster />
            </div>
            <StatsModal
                stats={stats}
                open={statsOpen}
                onClose={closeStats}
                wordle={currDaily}
            />
            <InstructionsModal />
        </AppContext.Provider>
    );
}
