import { h, Fragment, ComponentChildren, RenderableProps } from "preact";
import { useRef } from "preact/hooks";

export interface ModalProps {
    name: string;
    open: boolean;
    onClose?: () => void;
    headerComponents?: ComponentChildren;
}

export function Modal({
    name,
    open,
    onClose,
    headerComponents,
    children,
}: RenderableProps<ModalProps>) {
    const innerRef = useRef<HTMLDivElement>(null);
    const onClick = (event: MouseEvent) => {
        if (
            innerRef.current &&
            !innerRef.current.contains(event.target as Node)
        ) {
            onClose?.();
        }
    };

    let modalClass = "modal";
    if (open) {
        modalClass += " open";
    }

    return (
        <div class={modalClass} onClick={onClick}>
            <div class="modal-inner" ref={innerRef}>
                <div class="modal-header">
                    <h3 class="modal-title">{name}</h3>
                    {headerComponents}
                    <button class="modal-header-button" onClick={onClose}>
                        X
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
