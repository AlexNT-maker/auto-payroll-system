const messageModal = document.querySelector<HTMLDivElement>("#message-modal")!;

const messageTitle = document.querySelector<HTMLHeadingElement>("#message-modal-title")!;

const messageText = document.querySelector<HTMLDivElement>("#message-modal-text")!;

const btnOk = document.querySelector<HTMLButtonElement>("#message-modal-ok")!;

const btnCancel = document.querySelector<HTMLButtonElement>("#message-modal-cancel")!;

const messageWindow = document.querySelector<HTMLDivElement>(".message-modal-window")!;

type MessageType =
    | "success"
    | "error"
    | "warning"
    | "info";


export function showConfirmModal(
    title: string,
    message: string,
    type: MessageType = "warning"
): Promise<boolean> {

    return new Promise((resolve) => {

        messageTitle.textContent = title;
        messageText.textContent = message;

        btnCancel.classList.remove("hidden");

        messageWindow.classList.remove(
            "modal-success",
            "modal-error",
            "modal-warning",
            "modal-info"
        );
        messageWindow.classList.add(`modal-${type}`);


        function confirmAction(){
            messageModal.classList.add('hidden');
            resolve(true);
            btnOk.removeEventListener('click', confirmAction);
            btnCancel.removeEventListener('click', cancelAction);
            document.removeEventListener("keydown", handleKeyDown);
        }

        function cancelAction(){
            messageModal.classList.add("hidden");
            resolve(false);
             btnOk.removeEventListener('click', confirmAction);
            btnCancel.removeEventListener('click', cancelAction);
            document.removeEventListener("keydown", handleKeyDown);

    }

        function handleKeyDown(e: KeyboardEvent) {
    if(e.key === "Enter" || e.code === "NumpadEnter") {
        e.preventDefault();
        confirmAction();
    }

    if (e.key === "Escape") {
        e.preventDefault();
        cancelAction();
    }
}

        btnOk.addEventListener('click', confirmAction);

        btnCancel.addEventListener('click', cancelAction);

        document.addEventListener('keydown', handleKeyDown);

        messageModal.classList.remove("hidden");


    });

}



