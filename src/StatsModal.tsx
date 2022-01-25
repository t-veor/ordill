import { h, Fragment } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { Modal } from "./Modal";
import { Stats } from "./stats";
import { WordleState } from "./wordleState";
import { timeUntilNextDayMs } from "./words/daily";

export interface StatsModalProps {
    stats: Stats;
    open: boolean;
    onClose?: () => void;
    wordle: WordleState | null;
}

function StatRow({ name, value }: { name: string; value: number }) {
    return (
        <div class="stats-modal-row">
            <div class="stats-modal-row-value">{value}</div>
            <div class="stats-modal-row-name">{name}</div>
        </div>
    );
}

function GuessDistribution({
    stats,
    activeRow,
}: {
    stats: Stats;
    activeRow?: number;
}) {
    const maxFreq = stats.distribution.reduce((a, b) => Math.max(a, b), 1);

    const rows = stats.distribution.map((freq, i) => {
        const fraction = freq / maxFreq;
        const width = `${(fraction * 100).toFixed(2)}%`;
        let innerClass = "distribution-bar-inner";
        if (activeRow === i) {
            innerClass += " active";
        }

        return (
            <div class="distribution-row">
                <div class="distribution-label">{i + 1}</div>
                <div class="distribution-bar">
                    <div class={innerClass} style={{ width }}>
                        {freq}
                    </div>
                </div>
            </div>
        );
    });

    return <div class="distribution">{rows}</div>;
}

function DailyTimer({
    tick,
    dailyNumber,
}: {
    tick: boolean;
    dailyNumber: number;
}) {
    const getTimeRemaining = useCallback(
        () => timeUntilNextDayMs(dailyNumber),
        [dailyNumber]
    );

    const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining);
    useEffect(() => {
        if (tick) {
            setTimeRemaining(getTimeRemaining());
            const handle = setInterval(() => {
                console.log("Ticking!");
                setTimeRemaining(getTimeRemaining());
            }, 1000);
            return () => clearInterval(handle);
        }
    }, [tick, getTimeRemaining]);

    const timeRemainingSeconds = Math.floor(timeRemaining / 1000);
    const seconds = `0${timeRemainingSeconds % 60}`.slice(-2);
    const minutes = `0${Math.floor(timeRemainingSeconds / 60) % 60}`.slice(-2);
    const hours = `0${Math.floor(timeRemainingSeconds / 3600)}`.slice(-2);

    return (
        <div class="stats-modal-timer">
            <div class="timer-description">Næsta dagleg þraut eftir</div>
            <div class="timer-clock">
                <div class="timer-digit">{hours[0]}</div>
                <div class="timer-digit">{hours[1]}</div>
                <div class="timer-sep">:</div>
                <div class="timer-digit">{minutes[0]}</div>
                <div class="timer-digit">{minutes[1]}</div>
                <div class="timer-sep">:</div>
                <div class="timer-digit">{seconds[0]}</div>
                <div class="timer-digit">{seconds[1]}</div>
            </div>
            <div class="timer-description">
                Viltu fleiri þrautir núna? Smelltu á „Spila Frjálst" takkann!
            </div>
        </div>
    );
}

export function StatsModal({ stats, open, onClose, wordle }: StatsModalProps) {
    const winPercentage = Math.round(
        (100 * stats.wins) / Math.max(1, stats.played)
    );

    let footer = undefined;
    let activeRow = undefined;
    if (
        wordle != null &&
        wordle.dailyNumber != null &&
        wordle.gameState.name !== "playing"
    ) {
        if (wordle.gameState.name === "won") {
            activeRow = wordle.guessedWords.length - 1;
        }
        footer = (
            <>
                <hr />
                <DailyTimer tick={open} dailyNumber={wordle.dailyNumber} />
            </>
        );
    }

    return (
        <Modal name="Tölfræði" open={open} onClose={onClose}>
            <div class="stats-modal-rows">
                <StatRow name="Spilað" value={stats.played} />
                <StatRow name="% unnin" value={winPercentage} />
                <StatRow name="Í röð" value={stats.currStreak} />
                <StatRow name="Oftast í röð" value={stats.maxStreak} />
            </div>
            <hr />
            <div class="stats-modal-subtitle">
                <h3>Dreifing ágiskana</h3>
            </div>
            <GuessDistribution stats={stats} activeRow={activeRow} />
            {footer}
        </Modal>
    );
}
