import { h, Fragment } from "preact";
import { useEffect } from "preact/hooks";

export interface StatsProps {
    open: boolean,
    onClose?: () => void,
}

export function Stats({ open, onClose }: StatsProps) {
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === "BUTTON" || target.tagName === "A") {
                return;
            }
            onClose?.();
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, [onClose]);

    let statsModalClass = "stats-modal";
    if (open) {
        statsModalClass += " open";
    }

    return (
        <div class={statsModalClass}>
            <div class="stats-modal-inner"></div>
        </div>
    );
}
