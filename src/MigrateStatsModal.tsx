import { createElement, Fragment, h } from "preact";
import { useEffect } from "preact/hooks";
import * as hooks from "preact/hooks";

import { generate } from "lean-qr";
import { makeAsyncComponent } from "lean-qr/extras/react";

import { Modal } from "./Modal";
import { migrateStatsLink, Stats } from "./stats";

export interface MigrateStatsModalProps {
    stats?: Stats;
    open: boolean;
    onClose?: () => void;
}

const QR = makeAsyncComponent({ createElement, ...hooks }, generate)

export function MigrateStatsModal({ stats, open, onClose }: MigrateStatsModalProps) {
    const url = stats && migrateStatsLink(stats);

    useEffect(() => {
        if (open && stats) {
            console.log("Migrate stats link:", url);
        }
    }, [stats, open])

    return (
        <Modal
            name="Færa gögn"
            open={open}
            onClose={onClose}
        >
            <hr />
            <p>
                Skannaðu QR-kóðann með tækinu sem þú vilt færa Orðilsgögnin þín
                (þar á meðal „streak“-ið) yfir á.
            </p>
            <p>
                <b>
                    ATHUGAÐU: Þetta mun yfirskrifa „streak“-ið á tækinu sem
                    skannar kóðann!
                </b>
            </p>
            <hr />
            <div className="migrate-stats-qr-code-container">
                {
                    open && url && (
                        <QR
                            className="migrate-stats-qr-code"
                            content={url}
                        />
                    )
                }
            </div>
        </Modal>
    )
}
