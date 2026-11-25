import { store } from "../state/store";
import { attachActionListeners } from "../handlers/employeeEvents";

const employeesListBody = document.querySelector<HTMLTableSectionElement>('#employees-list')!;
const employeesSearch = document.querySelector<HTMLInputElement>('#employees-search')!;
const employeesCount = document.querySelector<HTMLElement>('#employees-count')!;

employeesSearch.addEventListener('input', renderEmployeesList);

export function renderEmployeesList() {
    employeesListBody.innerHTML = '';
    const searchTerm = employeesSearch.value.trim().toLocaleLowerCase('el');
    const filteredEmployees = store.employees.filter(emp =>
        !emp.is_deleted && emp.name.toLocaleLowerCase('el').includes(searchTerm)
    );

    employeesCount.textContent = `Σύνολο: ${filteredEmployees.length}`;

    filteredEmployees.forEach(emp => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td class="employee-name-cell">
                ${emp.name}
                <div class="table-row-actions">
                    <button class="employee-edit-btn material-edit-btn" data-id="${emp.id}" title="Επεξεργασία" aria-label="Επεξεργασία">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    ${emp.is_active
                        ? `<button class="employee-archive-btn material-delete-btn" data-id="${emp.id}" title="Αρχειοθέτηση" aria-label="Αρχειοθέτηση">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h18v4H3z"/><path d="M5 8v12h14V8"/><path d="M10 12h4"/></svg>
                        </button>`
                        : `<button class="employee-restore-btn material-edit-btn" data-id="${emp.id}" title="Επαναφορά" aria-label="Επαναφορά">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
                        </button>`
                    }
                    <button class="employee-delete-btn material-delete-btn" data-id="${emp.id}" title="Διαγραφή από το παρόν" aria-label="Διαγραφή από το παρόν">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
                    </button>
                </div>
            </td>
            <td>${emp.is_active ? "Ενεργός" : "Αρχειοθετημένος"}</td>
            <td class="amount-cell">${emp.daily_wage.toFixed(2)}€</td>
            <td class="amount-cell">${emp.overtime_rate.toFixed(2)}€</td>
            <td class="amount-cell">${emp.bank_daily_amount.toFixed(2)}€</td>
        `;
        employeesListBody.appendChild(row);
    });
    attachActionListeners();
}