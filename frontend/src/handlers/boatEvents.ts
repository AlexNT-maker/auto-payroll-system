import { deleteBoat } from "../api/boatsApi";
const boatsListBody = document.querySelector<HTMLTableSectionElement>('#boats-list')!;

export function attachBoatListeners() {
    boatsListBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            openBoatModal(id);
        });
    });

    boatsListBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            if(confirm("Είστε σίγουρος για τη διαγραφή;")) handleDeleteBoat(id);
        });
    });

    boatsListBody.querySelectorAll('.btn-analysis').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            openAnalysisModal(id);
        });
    });
}