import { h, Fragment, createContext } from "preact";
import { getTodayNumber } from "./words/daily";
import Header from "./Header";
import settingsManager from "./settings";
import { Toaster } from "./Toaster";
import Wordle from "./Wordle";
import { loadGameOrNew, useWordle } from "./wordleState";
import { Stats } from "./Stats";
import { useState } from "preact/hooks";

export interface AppContext {
    isDaily: boolean,
    setIsDaily?: (isDaily: boolean) => void,
    openStats?: () => void,
    showingStats: boolean,
}

export const AppContext = createContext<AppContext>({
    isDaily: false,
    showingStats: false,
});

export default function App() {
    const [wordle, dispatchWordle] = useWordle(
        () => loadGameOrNew(settingsManager.get(), getTodayNumber()),
    );
    const setIsDaily = (isDaily: boolean) => {
        const prevIsDaily = wordle.dailyNumber != null;
        if (isDaily !== prevIsDaily) {
            dispatchWordle({
                type: "load",
                newState: loadGameOrNew(
                    settingsManager.get(),
                    isDaily ? getTodayNumber() : undefined,
                    wordle,
                ),
            });
        }
    };

    const [statsOpen, setStatsOpen] = useState(false);
    const closeStats = () => setStatsOpen(false);
    const openStats = () => setStatsOpen(true);

    const context: AppContext = {
        isDaily: wordle.dailyNumber != null,
        setIsDaily,
        openStats,
        showingStats: false,
    };

    return (
        <AppContext.Provider value={context}>
            <div class="main-container">
                <Header />
                <hr />
                <Wordle
                    wordle={wordle}
                    dispatchWordle={dispatchWordle}
                />
                <Toaster />
            </div>
            <Stats open={statsOpen} onClose={closeStats} />
        </AppContext.Provider>
    );
}
