import { store } from "../state/store";
import { deleteBoat } from "../api/boatsApi";
import { renderBoatsList } from "../ui/renderBoatList";

import { fetchData } from "../services/appLoader";
import {
    createBoat,
    updateBoat
} from "../api/boatsApi";
import { openAnalysisModal } from "./boatAnalysisEvents.ts";

const modalBoat = document.querySelector<HTMLDivElement>('#modal-boat')!;
const boatForm = document.querySelector<HTMLFormElement>('#boat-form')!;
const boatsListBody = document.querySelector<HTMLTableSectionElement>('#boats-list')!;
const inputBoatName = document.querySelector<HTMLInputElement>('#boat-name')!;
const inputBoatId = document.querySelector<HTMLInputElement>('#boat-id')!;
const btnAddBoat = document.querySelector<HTMLButtonElement>('#btn-add-boat')!;
const btnCancelBoat = document.querySelector<HTMLButtonElement>('#btn-cancel-boat')!;

export  function initBoatEvents() {
boatForm.addEventListener('submit', handleBoatSubmit);
btnAddBoat.addEventListener('click', () => openBoatModal());
btnCancelBoat.addEventListener('click', closeBoatModal);
}


 export async function handleBoatSubmit(e : Event){
    e.preventDefault();
    const name = inputBoatName.value;
    const id = inputBoatId.value;
    
try {

    if (id) {
        await updateBoat(Number(id), { name });
    } else {
        await createBoat({ name });
    }

    modalBoat.classList.add('hidden');

    await fetchData();

    renderBoatsList();

    alert("Επιτυχία!");

} catch (err) {

    console.error(err);

    alert("Σφάλμα δικτύου");

}
};

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

function openBoatModal(id?: number) { 
    modalBoat.classList.remove('hidden');
    boatForm.reset();
    
    if (id) {
        
        const boat = store.boats.find(b => b.id === id);
        if (boat) {
            inputBoatName.value = boat.name;
            inputBoatId.value = boat.id.toString();
            document.getElementById('modal-boat-title')!.textContent = "Επεξεργασία Σκάφους";
        }
    } else {
        inputBoatId.value = '';
        document.getElementById('modal-boat-title')!.textContent = "Νέο Σκάφος";
    }
}

// 13. -- Boats Delete Logic --
export async function handleDeleteBoat(id: number) {
  try {

    await deleteBoat(id);

    await fetchData();

    renderBoatsList();

    alert("Το σκάφος διαγράφηκε");

} catch (err) {

    console.error(err);

    alert("Αδυναμία διαγραφής");

}
  }

  function closeBoatModal(){
modalBoat.classList.add('hidden')
  }




