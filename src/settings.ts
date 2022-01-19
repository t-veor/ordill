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

export const loadSettings = (): Settings => {
    const settings = tryLoadSettingsFromStorage();

    if (settings.dark == null) {
        settings.dark = tryMigrateDarkMode();
    }

    if (settings.dark == null) {
        settings.dark = tryDetectDarkMode();
    }

    return settings;
};

export const saveSettings = (settings: Settings) => {
    try {
        localStorage.setItem("settings", JSON.stringify(settings));
    } catch (err) {
        console.log(err);
    }
};

export const SettingsCtx = createContext<{
    settings: Settings;
    onSettingsChange?: (settings: Settings) => void;
}>({
    settings: {},
});
