import { h, Fragment } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { toast } from "./Toaster";

interface EditableDailyNumberProps {
    value: number;
    todayNumber: number;
    onChange: (newNumber: number) => void;
}

const EditableDailyNumber = ({
    value,
    todayNumber,
    onChange,
}: EditableDailyNumberProps) => {
    const [state, setState] = useState(value);
    useEffect(() => setState(value), [value]);

    const onInput = useCallback(
        (event: Event) => {
            const target = event.target as HTMLInputElement;
            const parsed = Number(target.value);
            if (
                isNaN(parsed) ||
                parsed !== (parsed | 0) ||
                parsed - 1 < 0 ||
                parsed - 1 > todayNumber
            ) {
                toast(
                    `Enter a number between 1 and today (${todayNumber + 1})`
                );
                setState(state);
                return;
            } else {
                toast(`Loading day ${parsed}`);
                setState(parsed - 1);
                onChange(parsed - 1);
            }
        },
        [state, onChange]
    );

    return (
        <input
            class="daily-nav-input"
            inputMode="numeric"
            pattern="\d+"
            value={state + 1}
            style={{ width: `calc(${`${todayNumber + 1}`.length}ch + 5px)` }}
            onChange={onInput}
        />
    );
};

export interface ModeDisplayProps {
    dailyNumber?: number;
    todayNumber: number;
    setDailyNumber: (dailyNumber: number) => void;
}

export default function ModeDisplay({
    dailyNumber,
    todayNumber,
    setDailyNumber,
}: ModeDisplayProps) {
    const setFirstDaily = useCallback(
        () => setDailyNumber(0),
        [setDailyNumber]
    );
    const setLastDaily = useCallback(
        () => setDailyNumber(todayNumber),
        [todayNumber, setDailyNumber]
    );
    const incrDailyNumber = useCallback(() => {
        if (dailyNumber != null) {
            setDailyNumber(dailyNumber + 1);
        }
    }, [dailyNumber, setDailyNumber]);
    const decrDailyNumber = useCallback(() => {
        if (dailyNumber != null) {
            setDailyNumber(dailyNumber - 1);
        }
    }, [dailyNumber, setDailyNumber]);

    const atBeginning = dailyNumber != null && dailyNumber === 0;
    const atEnd = dailyNumber != null && dailyNumber === todayNumber;

    if (dailyNumber == null) {
        return (
            <div class="mode-display">
                <div class="mode-display-main">Frjálst</div>
            </div>
        );
    } else {
        return (
            <div class="mode-display">
                <button
                    class="daily-nav-button"
                    disabled={atBeginning}
                    onClick={setFirstDaily}
                >
                    {"\u{2b70}"}
                </button>
                <button
                    class="daily-nav-button"
                    disabled={atBeginning}
                    onClick={decrDailyNumber}
                >
                    {"\u{2b60}"}
                </button>
                <div class="mode-display-main">
                    Daglegt - #
                    <EditableDailyNumber
                        value={dailyNumber}
                        todayNumber={todayNumber}
                        onChange={setDailyNumber}
                    />
                </div>
                <button
                    class="daily-nav-button"
                    disabled={atEnd}
                    onClick={incrDailyNumber}
                >
                    {"\u{2b62}"}
                </button>
                <button
                    class="daily-nav-button"
                    disabled={atEnd}
                    onClick={setLastDaily}
                >
                    {"\u{2b72}"}
                </button>
            </div>
        );
    }
}
