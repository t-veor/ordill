import { h, Fragment, RenderableProps, ComponentChildren } from "preact";

export interface TabProps {
    name: string;
    open: boolean;
    headerComponents?: ComponentChildren;
    onClose?: () => void;
}

export default function Tab({
    name,
    open,
    headerComponents,
    onClose,
    children,
}: RenderableProps<TabProps>) {
    let tabClass = "tab";
    if (!open) {
        tabClass += " closed";
    }

    return (
        <div class={tabClass}>
            <div class="tab-contents">
                <div class="tab-header">
                    <h2 class="tab-title">{name}</h2>
                    {headerComponents}
                    <button class="tab-button" onClick={onClose}>
                        X
                    </button>
                </div>
                <hr />
                <div class="tab-body">{children}</div>
            </div>
        </div>
    );
}
