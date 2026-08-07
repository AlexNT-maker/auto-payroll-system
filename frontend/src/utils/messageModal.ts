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

        messageTitle.style.color = "#2b2b2b"

    switch(type){
        case "info":
            btnOk.style.backgroundColor = "#3b82f6";
            break;
        case "warning":
            btnOk.style.backgroundColor = "#f59e0b";
            break;
        case "success":
            btnOk.style.backgroundColor = "#22c55e";
            break;
        case "error":
            btnOk.style.backgroundColor = "#ef4444";
            messageTitle.style.color = "#ef4444";
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