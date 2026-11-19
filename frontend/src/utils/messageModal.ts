import infoIcon from "../icon/info-circle.svg?raw";
import warningIcon from "../icon/exclamation-triangle.svg?raw";
import successIcon from "../icon/check-circle.svg?raw";
import errorIcon from "../icon/x-circle.svg?raw";

let autoActionTimer: ReturnType<typeof setTimeout> | null = null;
let currentOnConfirm: (() => void) | null = null;

const messageModal = document.querySelector<HTMLDivElement>("#message-modal")!;
const messageTitle = document.querySelector<HTMLHeadingElement>('#message-modal-title')!;
const messageText = document.querySelector<HTMLDivElement>("#message-modal-text")!;
const btnOk = document.querySelector<HTMLButtonElement>("#message-modal-ok")!;
const btnCancel = document.querySelector<HTMLButtonElement>("#message-modal-cancel")!;
const messageWindow = document.querySelector<HTMLDivElement>(".message-modal-window")!;
const messageIcon = document.querySelector<HTMLDivElement>('#message-modal-icon')!;

type MessageType = 
| "success"
| "error"
| "warning"
| "info";


export function showMessageModal(
    title:string, 
    message: string,
    type: MessageType = "info",
    onConfirm?: () => void
): void {
    if (autoActionTimer) {
    clearTimeout(autoActionTimer);
}

    if (!messageModal || !messageText || !messageTitle || !messageWindow) return;

    switch(type){
        case "info":
            messageIcon.innerHTML = infoIcon;
            break;
        case "warning":
            messageIcon.innerHTML = warningIcon;
            break;
        case "success":
            messageIcon.innerHTML = successIcon;
            break;
        case "error":
            messageIcon.innerHTML = errorIcon;
            break;
    }
    messageTitle.textContent = title;
    messageText.textContent = message;

    btnCancel?.classList.add("hidden");

    messageWindow.classList.remove(
    "modal-success",
    "modal-error",
    "modal-warning",
    "modal-info"
    
);

messageWindow.classList.add(`modal-${type}`);

if (onConfirm) {
    autoActionTimer = setTimeout(() => {
        onConfirm();
        autoActionTimer = null;
    }, 10000);
}

currentOnConfirm = onConfirm ?? null;

    messageModal.classList.remove("hidden");
}

export function hideMessageModal(): void {
    if (!messageModal) return;
    
    if (autoActionTimer) {
        clearTimeout(autoActionTimer);
        autoActionTimer = null;
    }
    messageModal.classList.add("hidden");
        currentOnConfirm?.();
        currentOnConfirm = null;
}

export function initMessageModal() {
    btnOk?.addEventListener("click", hideMessageModal);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter"  && !messageModal.classList.contains("hidden")) {
        e.preventDefault();
        btnOk?.click();
    }
});