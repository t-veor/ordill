import { h, Fragment } from "preact";
import { useContext } from "preact/hooks";
import { SettingsCtx } from "./settings";
import Switch from "./Switch";
import Tab from "./Tab";

interface SettingProps {
    name: string,
    description?: string,
    value: boolean,
    onChange?: (newValue: boolean) => void;
}

function Setting({ name, description, value, onChange }: SettingProps) {
    const descriptionElement = description ?
        (<div class="setting-description">{description}</div>) : undefined;

    return (
        <div class="setting">
            <div class="setting-text">
                <div class="setting-name">{name}</div>
                {descriptionElement}
            </div>
            <Switch value={value} onChange={onChange} />
        </div>
    );
}

export interface SettingsTabProps {
    open: boolean,
    onClose?: () => void;
}

export default function SettingsTab(props: SettingsTabProps) {
    const { settings, onSettingsChange } = useContext(SettingsCtx);

    const onChangeHardMode = (hardMode: boolean) => onSettingsChange?.({ hardMode });
    const onChangeDark = (dark: boolean) => onSettingsChange?.({ dark });
    const onChangeHighContrast = (highContrast: boolean) => onSettingsChange?.({ highContrast });
    const onChangeSymbols = (symbols: boolean) => onSettingsChange?.({ symbols });

    return (
        <Tab name="Stillingar" {...props}>
            <Setting
                name="Erfiðari Leikur"
                description="Allar afhjúpaðar vísbendingar verður að nota í næstu tilraunum"
                value={!!settings.hardMode}
                onChange={onChangeHardMode}
            />
            <hr />
            <Setting
                name="Dökkt Þema"
                value={!!settings.dark}
                onChange={onChangeDark}
            />
            <hr />
            <Setting
                name="Litblindustilling"
                description="Skipta um lit til að gera þá auðsjáanlegri"
                value={!!settings.highContrast}
                onChange={onChangeHighContrast}
            />
            <hr />
            <Setting
                name="Nota Tákn"
                description={"Nota X, ? og \u{2713} til að sýna niðurstöður"}
                value={!!settings.symbols}
                onChange={onChangeSymbols}
            />
            <hr />
            <p><b>Þemadæmi:</b></p>
            <div class="word-grid-row">
                <div class="word-grid-cell correct">t</div>
                <div class="word-grid-cell incorrect">ö</div>
                <div class="word-grid-cell partial">l</div>
                <div class="word-grid-cell incorrect">v</div>
                <div class="word-grid-cell correct">a</div>
            </div>
        </Tab>
    );
}