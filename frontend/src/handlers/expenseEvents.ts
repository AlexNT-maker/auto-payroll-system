import { store } from "../state/store";
import { showMessageModal } from "../utils/messageModal";

const expStart = document.querySelector<HTMLInputElement>('#exp-start')!;
const expEnd = document.querySelector<HTMLInputElement>('#exp-end')!;
const expBoatSelect = document.querySelector<HTMLSelectElement>('#exp-boat')!;
const expEmpSelect = document.querySelector<HTMLSelectElement>('#exp-emp')!;
const btnCalcExpenses = document.querySelector<HTMLButtonElement>('#btn-calc-expenses')!;
const expensesListBody = document.querySelector<HTMLTableSectionElement>('#expenses-list')!;
const expTotalAmount = document.querySelector<HTMLSpanElement>('#exp-total-amount')!;
const expensesSummaryDiv = document.querySelector<HTMLDivElement>('#expenses-summary')!;

export function initExpensesEvents() {
btnCalcExpenses.addEventListener('click', handleExpensesCalculation);
}

export function initExpensesPage() {
    expBoatSelect.innerHTML = '<option value="">-- Όλα τα σκάφη --</option>';
    store.boats.forEach(boat => {
        const opt = document.createElement('option');
        opt.value = boat.id.toString();
        opt.textContent = boat.name;
        expBoatSelect.appendChild(opt);
    });

    expEmpSelect.innerHTML = '<option value="">-- Όλοι οι εργαζόμενοι --</option>';
    store.employees.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.id.toString();
        opt.textContent = emp.name;
        expEmpSelect.appendChild(opt);
    });

    if (!expStart.value) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1); 
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
        expStart.value = firstDay.toISOString().split('T')[0];
        expEnd.value = lastDay.toISOString().split('T')[0];
    }
}

export async function handleExpensesCalculation() {
    const start = expStart.value;
    const end = expEnd.value;
    const boatId = expBoatSelect.value;
    const empId = expEmpSelect.value;

    if (!start || !end) {
        showMessageModal("Προσοχή", "Παρακαλώ επιλέξτε ημερομηνίες.", "warning");
        return;
    }

    try {
        let url = `http://127.0.0.1:8000/expenses/?start=${start}&end=${end}`;
        if (boatId) url += `&boat_id=${boatId}`;
        if (empId) url += `&emp_id=${empId}`;

        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json(); 
            
            expTotalAmount.textContent = `${data.total_sum.toFixed(2)} €`;
            expensesSummaryDiv.classList.remove('hidden');

            expensesListBody.innerHTML = '';
            if (data.results.length === 0) {
                expensesListBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Δεν βρέθηκαν εγγραφές.</td></tr>';
                return;
            }

            data.results.forEach((item: any) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.date}</td>
                    <td>${item.employee_name}</td>
                    <td>${item.boat_name}</td>
                    <td>${item.daily_cost.toFixed(2)} €</td>
                    <td>${item.overtime_cost.toFixed(2)} €</td>
                    <td style="font-weight: bold;">${item.total_cost.toFixed(2)} €</td>
                `;
                expensesListBody.appendChild(row);
            });

            } else {
            showMessageModal("Σφάλμα", "Πρόβλημα κατά τη λήψη δεδομένων.", "error");
        }
    } catch (error) {
        console.error(error);
        showMessageModal("Σφάλμα", "Πρόβλημα σύνδεσης.", "error");
    }
};