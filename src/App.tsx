import { h, Fragment, Component } from "preact";
import Header from "./Header";
import { loadSettings, saveSettings, Settings, SettingsCtx } from "./settings";
import Wordle from "./Wordle";

interface AppState {
    settings: Settings,
}

export default class App extends Component<{}, AppState> {
    state: AppState = {
        settings: {}
    };

    componentDidMount() {
        this.onSettingsChange(loadSettings());
    }

    onSettingsChange = (changedSettings: Settings) => {
        const settings = { ...this.state.settings, ...changedSettings };
        this.setState({
            settings,
        }, () => {
            document.body.classList.toggle("dark", !!settings.dark);
            document.body.classList.toggle("high-contrast", !!settings.highContrast);
            document.body.classList.toggle("use-symbols", !!settings.symbols);

            saveSettings(settings);
        })
    }

    render(_: {}, { settings }: AppState) {
        const settingsCtx = {
            settings,
            onSettingsChange: this.onSettingsChange,
        };

        return (
            <SettingsCtx.Provider value={settingsCtx}>
                <div class="main-container">
                    <Header />
                    <hr />
                    <Wordle settings={settings} />
                </div>
            </SettingsCtx.Provider>
        );
    }
}
