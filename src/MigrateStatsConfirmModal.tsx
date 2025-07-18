import { h, Fragment } from "preact"
import { useEffect, useState } from "preact/hooks";
import { Stats, tryMigrateStats } from "./stats";
import { Modal } from "./Modal"

export interface MigrateStatsConfirmModalProps {
    setStats?: (stats: Stats) => void;
}

export const MigrateStatsConfirmModal = (
    { setStats }: MigrateStatsConfirmModalProps,
) => {
    const [pendingStats, setPendingStats] = useState(tryMigrateStats);
    const [tempStats, _] = useState(pendingStats);

    const open = !!pendingStats;
    const onClose = () => setPendingStats(null);

    const played = tempStats?.played;
    const win_percentage = tempStats && Math.round(100 * tempStats.wins / Math.max(tempStats.played, 1));
    const streak = tempStats?.currStreak;
    const maxStreak = tempStats?.maxStreak;

    const onConfirm = () => {
        if (pendingStats !== null) {
            setStats?.(pendingStats);
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            name="Staðfestu gagnafæringu"
        >
            <hr />
            <p>
                Ertu viss að þú vilt yfirskrifa gögnin þín á þessu tæki?
            </p>
            <p>
                Þú ert að skrifa þessi gögn:
                <br />
                Spilað: {played}
                <br />
                % unnin: {win_percentage}
                <br />
                Unnin í röð: {streak}
                <br />
                Oftast í röð: {maxStreak}
            </p>
            <hr />
            <div class="modal-buttons">
                <button onClick={onClose}>
                    Nei
                </button>
                <button class="primary" onClick={onConfirm}>
                    Já
                </button>
            </div>
        </Modal>
    )
};
