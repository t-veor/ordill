export interface Settings {
    dark?: boolean;
    highContrast?: boolean;
    symbols?: boolean;
}

const tryLoadSettingsFromStorage = () => {
    const settings: Partial<Settings> = {};

    try {
        const settingsString = localStorage.getItem("settings");
        if (settingsString == null) {
            return settings;
        }

        const parsedSettings = JSON.parse(settingsString);

        if (parsedSettings.dark != null) {
            settings.dark = !!parsedSettings.dark;
        }

        if (parsedSettings.highContrast != null) {
            settings.highContrast = !!parsedSettings.highContrast;
        }

        if (parsedSettings.symbols != null) {
            settings.symbols = !!parsedSettings.symbols;
        }
    } catch (err) {
        console.log(err);
    }

    return settings;
};

const tryMigrateDarkMode = () => {
    try {
        const legacyDarkMode = localStorage.getItem("darkMode");
        localStorage.removeItem("darkMode");

        if (legacyDarkMode != null) {
            return legacyDarkMode === "true";
        }
    } catch (err) {
        console.log(err);
    }
};

const tryDetectDarkMode = () => {
    try {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return true;
        }
    } catch (err) {
        console.log(err);
    }
};

const loadSettings = (): Settings => {
    const settings = tryLoadSettingsFromStorage();

    if (settings.dark == null) {
        settings.dark = tryMigrateDarkMode();
    }

    if (settings.dark == null) {
        settings.dark = tryDetectDarkMode();
    }

    return settings;
};

const saveSettings = (settings: Settings) => {
    try {
        localStorage.setItem("settings", JSON.stringify(settings));
    } catch (err) {
        console.log(err);
    }
};

export type SettingsCallback = (settings: Settings) => void;

export class SettingsManager {
    private static instance?: SettingsManager;

    static getInstance(): SettingsManager {
        if (!this.instance) {
            this.instance = new SettingsManager();
        }
        return this.instance;
    }

    private callbacks: SettingsCallback[] = [];
    private settings: Settings;
    private gameInProgress: boolean = false;

    private constructor() {
        this.settings = loadSettings();
        this.onChanged();
    }

    subscribe(callback: SettingsCallback) {
        if (!this.callbacks.includes(callback)) {
            this.callbacks.push(callback);
        }
    }

    unsubscribe(callback: SettingsCallback) {
        this.callbacks = this.callbacks.filter((i) => i !== callback);
    }

    get(): Settings {
        return this.settings;
    }

    update(delta: Partial<Settings>) {
        // toast("Ekki hægt að kveikja á erfiðisstillingunni í miðjum leik");
        this.settings = { ...this.settings, ...delta };
        this.onChanged();
    }

    private onChanged() {
        const { dark, highContrast, symbols } = this.settings;

        const bodyClasses = document.body.classList;
        bodyClasses.toggle("dark", !!dark);
        bodyClasses.toggle("high-contrast", !!highContrast);
        bodyClasses.toggle("use-symbols", !!symbols);

        saveSettings(this.settings);
        for (const cb of this.callbacks) {
            cb(this.settings);
        }
    }
}

const settingsManager = SettingsManager.getInstance();
export default settingsManager;
