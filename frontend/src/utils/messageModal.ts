const messageModal = document.querySelector<HTMLDivElement>("#message-modal")!;
const messageTitle = document.querySelector<HTMLHeadingElement>('#message-modal-title')!;
const messageText = document.querySelector<HTMLDivElement>("#message-modal-text")!;
const btnOk = document.querySelector<HTMLButtonElement>("#message-modal-ok")!;
const btnCancel = document.querySelector<HTMLButtonElement>("#message-modal-cancel")!;
const messageWindow = document.querySelector<HTMLDivElement>(".message-modal-window")!;

type MessageType = 
| "success"
| "error"
| "warning"
| "info";


export function showMessageModal(
    title:string, 
    message: string,
    type: MessageType = "info"
): void {
    if (!messageModal || !messageText || !messageTitle || !messageWindow) return;

        messageTitle.style.color = "#264653"

    switch(type){
        case "info":
            btnOk.style.backgroundColor = "#264653";
            break;
        case "warning":
            btnOk.style.backgroundColor = "#d97706";
            break;
        case "success":
            btnOk.style.backgroundColor = "#16a34a";
            break;
        case "error":
            btnOk.style.backgroundColor = "#dc2626";
            messageTitle.style.color = "#dc2626";
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

    messageModal.classList.remove("hidden");
}

export function hideMessageModal(): void {
    if(!messageModal) return ; 
    messageModal?.classList.add("hidden");
}

export function initMessageModal() {
    btnOk?.addEventListener("click", hideMessageModal);
}