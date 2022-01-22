import { h, Fragment, RenderableProps } from "preact";
import { useState, useEffect, useContext } from "preact/hooks";
import { AppContext } from "./App";
import settingsManager, { Settings } from "./settings";
import Switch from "./Switch";
import Tab from "./Tab";

interface SettingProps {
    name: string,
    description?: string,
}

function Setting({ name, description, children }: RenderableProps<SettingProps>) {
    const descriptionElement = description ?
        (<div class="setting-description">{description}</div>) : null;

    return (
        <div class="setting">
            <div class="setting-text">
                <div class="setting-name">{name}</div>
                {descriptionElement}
            </div>
            {children}
        </div>
    );
}

export interface SettingsTabProps {
    open: boolean,
    onClose?: () => void;
}

export default function SettingsTab(props: SettingsTabProps) {
    const { isDaily, setIsDaily } = useContext(AppContext);

    const [settings, setSettings] = useState(settingsManager.get());
    const [gameInProgress, setGameInProgress] = useState(settingsManager.isGameInProgress());
    useEffect(() => {
        const cb = (settings: Settings, gameInProgress: boolean) => {
            setSettings(settings);
            setGameInProgress(gameInProgress);
        };
        settingsManager.subscribe(cb);
        return () => { settingsManager.unsubscribe(cb); }
    }, []);

    const onChangeHardMode = (hardMode: boolean) => settingsManager.update({ hardMode });
    const onChangeDark = (dark: boolean) => settingsManager.update({ dark });
    const onChangeHighContrast = (highContrast: boolean) => settingsManager.update({ highContrast });
    const onChangeSymbols = (symbols: boolean) => settingsManager.update({ symbols });

    // TODO: Hook up stats and daily buttons to stuff
    return (
        <Tab name="Valmynd" {...props}>
            <Setting
                name="Tölfræðin Þín"
            >
                <button
                    class="show-stats-button"
                >
                    Sýna
                </button>
            </Setting>
            <hr />
            <Setting
                name="Spila Daglegt"
                description="Allir fá sama orðið, eingöngu eru sex tilraunir, aðeins eitt orð á dag"
            >
                <Switch
                    value={isDaily}
                    onChange={setIsDaily}
                />
            </Setting>
            <hr />
            <Setting
                name="Erfiðari Leikur"
                description="Allar afhjúpaðar vísbendingar verður að nota í næstu tilraunum"
            >
                <Switch
                    value={!!settings.hardMode}
                    disabled={!settings.hardMode && gameInProgress}
                    onChange={onChangeHardMode}
                />
            </Setting>
            <hr />
            <Setting name="Dökkt Þema">
                <Switch value={!!settings.dark} onChange={onChangeDark} />
            </Setting>
            <hr />
            <Setting
                name="Litblindustilling"
                description="Skipta um lit til að gera þá auðsjáanlegri"
            >
                <Switch
                    value={!!settings.highContrast}
                    onChange={onChangeHighContrast}
                />
            </Setting>
            <hr />
            <Setting
                name="Nota Tákn"
                description={"Nota X, ? og \u{2713} til að sýna niðurstöður"}
            >
                <Switch
                    value={!!settings.symbols}
                    onChange={onChangeSymbols}
                />
            </Setting>
            <hr />
            <p><b>Þemadæmi:</b></p>
            <div class="word-grid-row">
                <div class="word-grid-cell correct">t</div>
                <div class="word-grid-cell incorrect">ö</div>
                <div class="word-grid-cell partial">l</div>
                <div class="word-grid-cell incorrect">v</div>
                <div class="word-grid-cell correct">a</div>
            </div>
        </Tab >
    );
}
