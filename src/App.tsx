import { h, Fragment, createContext } from "preact";
import Header from "./Header";
import settingsManager from "./settings";
import { Toaster } from "./Toaster";
import Wordle from "./Wordle";
import { loadGameOrNew, useWordle } from "./wordleState";

export interface AppContext {
    isDaily: boolean,
    setIsDaily?: (isDaily: boolean) => void,
}

export const AppContext = createContext<AppContext>({
    isDaily: false,
});

export default function App() {
    const [wordle, dispatchWordle] = useWordle(() => loadGameOrNew(true, settingsManager.get()));
    const setIsDaily = (isDaily: boolean) => {
        if (isDaily !== wordle.isDaily) {
            dispatchWordle({
                type: "load",
                newState: loadGameOrNew(isDaily, settingsManager.get(), wordle),
            });
        }
    };

    const context: AppContext = {
        isDaily: wordle.isDaily,
        setIsDaily,
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
        </AppContext.Provider>
    );
}
