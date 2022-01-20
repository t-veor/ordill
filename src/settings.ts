import { createContext } from "preact";

export interface Settings {
    dark?: boolean;
    highContrast?: boolean;
    hardMode?: boolean;
    symbols?: boolean;
}

const tryLoadSettingsFromStorage = () => {
    const settings: Settings = {};

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

        if (parsedSettings.hardMode != null) {
            settings.hardMode = !!parsedSettings.hardMode;
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

export class SettingsManager {
    private static instance?: SettingsManager;

    static getInstance(): SettingsManager {
        if (!this.instance) {
            this.instance = new SettingsManager();
        }
        return this.instance;
    }

    private callbacks: Array<(settings: Settings) => void> = [];
    private settings: Settings;

    private constructor() {
        this.settings = loadSettings();
        this.onChanged();
    }

    subscribe(callback: (settings: Settings) => void) {
        if (!this.callbacks.includes(callback)) {
            this.callbacks.push(callback);
        }
    }

    unsubscribe(callback: (settings: Settings) => void) {
        this.callbacks = this.callbacks.filter((i) => i !== callback);
    }

    get(): Settings {
        return this.settings;
    }

    update(delta: Settings) {
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
