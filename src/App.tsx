import { h, Fragment, createContext } from "preact";
import { getTodayNumber } from "./words/daily";
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
import { Stats, useStats } from "./stats";
import { InstructionsModal } from "./InstructionsModal";
import { MigrateStatsConfirmModal } from "./MigrateStatsConfirmModal";

export interface AppContext {
    isDaily: boolean;
    setIsDaily?: (isDaily: boolean) => void;

    stats?: Stats;
    statsDidShow: boolean;
    openStats?: () => void;

    hardMode: boolean;
    gameInProgress: boolean;
    setHardMode?: (hardMode: boolean) => void;
}

export const AppContext = createContext<AppContext>({
    isDaily: false,
    statsDidShow: false,
    hardMode: false,
    gameInProgress: false,
});

export default function App() {
    const [wordle, dispatchWordle] = useWordle(() =>
        loadGameOrNew(settingsManager.get(), getTodayNumber())
    );
    const [currDaily, setCurrDaily] = useState<WordleState | null>(null);
    useEffect(() => {
        if (wordle.dailyNumber != null) {
            setCurrDaily(wordle);
        }
    }, [wordle]);

    const [stats, setStats, updateStats] = useStats();
    useEffect(() => updateStats(wordle), [wordle]);

    const setIsDaily = (isDaily: boolean) => {
        const prevIsDaily = wordle.dailyNumber != null;
        if (isDaily !== prevIsDaily) {
            dispatchWordle({
                type: "load",
                newState: loadGameOrNew(
                    settingsManager.get(),
                    isDaily ? getTodayNumber() : undefined,
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
        const isDaily = wordle.dailyNumber != null;

        if (isDaily && isEndGame) {
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
    }, [wordle.gameState, wordle.dailyNumber]);

    const setHardMode = (hardMode: boolean) => {
        dispatchWordle({ type: "setHardMode", hardMode });
    };

    const context: AppContext = {
        isDaily: wordle.dailyNumber != null,
        setIsDaily,
        stats,
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
            <MigrateStatsConfirmModal setStats={setStats} />
        </AppContext.Provider>
    );
}
