import { store } from "../state/store";
import { attachActionListeners } from "../handlers/employeeEvents";

const employeesListBody = document.querySelector<HTMLTableSectionElement>('#employees-list')!;

export function renderEmployeesList() {
    employeesListBody.innerHTML = '';
    store.employees.forEach(emp => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${emp.name}</td>
            <td>${emp.daily_wage}€</td>
            <td>${emp.overtime_rate}€</td>
            <td>${emp.bank_daily_amount}€</td>
            <td>
                <div class="materials-actions">
                    <button class="material-edit-btn" data-id="${emp.id}">Επεξεργασία</button>
                    <button class="material-delete-btn" data-id="${emp.id}">Διαγραφή</button>
                </div>
            </td>
        `;
        employeesListBody.appendChild(row);
    });
    attachActionListeners();
}