import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import Instructions, {
    ToggleLanguagesButton,
    useInstructionsLanguage,
} from "./Instructions";
import { Modal } from "./Modal";

const instructionsNotYetShown = () => {
    let shown = false;
    try {
        shown = localStorage.getItem("instructionsShown") === "true";
        if (!shown) {
            localStorage.setItem("instructionsShown", "true");
        }
    } catch (err) {
        console.log(err);
    }
    return !shown;
};

export function InstructionsModal() {
    const [open, setOpen] = useState(instructionsNotYetShown);
    const onClose = () => setOpen(false);

    const [language, setLanguage] = useInstructionsLanguage();
    const name = language === "is" ? "Leiðbeiningar" : "Instructions";

    return (
        <Modal
            name={name}
            open={open}
            onClose={onClose}
            headerComponents={
                <ToggleLanguagesButton classNames="modal-header-button" />
            }
        >
            <hr />
            <Instructions />
        </Modal>
    );
}
