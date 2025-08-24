import { h, Fragment } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";

interface Toast {
    message: string;
    id: number;
    expiry: number;
}

type ToastCallback = (toast: Toast) => void;
let toastCallbacks: Array<ToastCallback> = [];
let currId = 0;
const addToastCallback = (cb: ToastCallback) => {
    toastCallbacks.push(cb);
};
const removeToastCallback = (cb: ToastCallback) => {
    toastCallbacks = toastCallbacks.filter((i) => i !== cb);
};

const TOAST_TIMEOUT_MS = 3000;

export const toast = (message: string) => {
    const id = currId++;
    const expiry = Date.now() + TOAST_TIMEOUT_MS;
    const toast = { message, id, expiry };
    for (const cb of toastCallbacks) {
        cb(toast);
    }
};

export function Toaster() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const addToast = useCallback(
        (toast: Toast) => setToasts((prevToasts) => [...prevToasts, toast]),
        []
    );

    useEffect(() => {
        addToastCallback(addToast);
        return () => removeToastCallback(addToast);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setToasts((prevToasts) => {
                const now = Date.now();
                return prevToasts.filter((toast) => toast.expiry > now);
            });
        }, TOAST_TIMEOUT_MS);
    });

    return (
        <div class="toaster">
            {toasts.map((toast) => (
                <div class="toast" key={toast.id}>
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
