import { h, Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";

interface Toast {
    message: string,
    id: number,
}

type ToastCallback = (toast: Toast) => void;
let toastCallbacks: Array<ToastCallback> = [];
let currId = 0;
const addToastCallback = (cb: ToastCallback) => {
    toastCallbacks.push(cb);
};
const removeToastCallback = (cb: ToastCallback) => {
    toastCallbacks = toastCallbacks.filter(i => i !== cb);
};

export const toast = (message: string) => {
    for (const cb of toastCallbacks) {
        const id = currId++;
        cb({ message, id });
    }
}

export function Toaster() {
    const [toast, setToast] = useState<Toast | null>(null);
    useEffect(() => {
        addToastCallback(setToast);
        return () => removeToastCallback(setToast);
    }, [])

    useEffect(() => {
        if (toast != null) {
            const handle = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(handle);
        }
    }, [toast])

    const toastElement = toast != null ?
        <div class="toast" key={toast.id}>{toast.message}</div> : null;

    return (
        <div class="toaster">
            {toastElement}
        </div>
    );
}
