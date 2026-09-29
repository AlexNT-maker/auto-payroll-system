import { store } from "../state/store";
import { attachBoatListeners } from "../handlers/boatEvents";

const boatsListBody = document.querySelector<HTMLTableSectionElement>('#boats-list')!;

export function renderBoatsList() {
    boatsListBody.innerHTML = '';
    store.boats.forEach(boat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${boat.name}</td>
            <td>
                <div class="materials-actions">
                    <button class="material-edit-btn" data-id="${boat.id}" data-type="boat">Επεξεργασία</button>
                    <button class="material-delete-btn" data-id="${boat.id}" data-type="boat">Διαγραφή</button>
                </div>
            </td>
        `;
        boatsListBody.appendChild(row);
    });
    attachBoatListeners();
}