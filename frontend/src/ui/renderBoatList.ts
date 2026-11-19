import { store } from "../state/store";
import { attachBoatListeners } from "../handlers/boatEvents";

const boatsListBody = document.querySelector<HTMLTableSectionElement>('#boats-list')!;

export function renderBoatsList() {
    boatsListBody.innerHTML = '';
    store.boats.forEach(boat => {
        const row = document.createElement('tr');
        const invoiceExpenses = store.invoices
            .filter(invoice => invoice.boat_id === boat.id)
            .reduce((total, invoice) => total + invoice.amount, 0);
        const materialExpenses = store.materialUsages
            .filter(usage => usage.boat_id === boat.id)
            .reduce((total, usage) => total + usage.total_price, 0);
        const totalExpenses = invoiceExpenses + materialExpenses;

        row.innerHTML = `
            <td>
                ${boat.name}
                <div class="table-row-actions">
                    <button class="material-edit-btn" data-id="${boat.id}" data-type="boat" title="Επεξεργασία" aria-label="Επεξεργασία">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="material-delete-btn" data-id="${boat.id}" data-type="boat" title="Διαγραφή" aria-label="Διαγραφή">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
                    </button>
                </div>
            </td>
            <td class="amount-cell">${totalExpenses.toFixed(2)} €</td>
        `;
        boatsListBody.appendChild(row);
    });
    attachBoatListeners();
}