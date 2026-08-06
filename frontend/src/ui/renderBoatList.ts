import { store } from "../state/store";
import { attachBoatListeners } from "../handlers/boatEvents";

const boatsListBody = document.querySelector<HTMLTableSectionElement>('#boats-list')!;

export function renderBoatsList(){
    
  boatsListBody.innerHTML = '';
  store.boats.forEach(boat => {
    const row = document.createElement('tr');
    row.innerHTML = `
    <td>${boat.name}</td>
    <td style="display: flex; align-items:center;">
    <button class="action-btn hover-lift btn-analysis" data-id="${boat.id}" 
                style="background-color: #3b82f6; color: white; margin-right: 0.5rem;">
          Ανάλυση
        </button>
        <button class="action-btn btn-edit hover-lift" data-id="${boat.id}" data-type="boat">Επεξεργασία</button>
        <button class="action-btn btn-delete hover-lift" data-id="${boat.id}" data-type="boat">Διαγραφή</button>
      </td>
      `;
      boatsListBody.appendChild(row);
  })
   attachBoatListeners();
}