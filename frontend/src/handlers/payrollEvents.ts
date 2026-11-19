import { API_URL } from "../config/api";
import { showConfirmModal } from "../utils/confirmModal";
import { showMessageModal } from "../utils/messageModal";

const payStart = document.querySelector<HTMLInputElement>('#pay-start')!;
const payEnd = document.querySelector<HTMLInputElement>('#pay-end')!;
const btnCalcPayroll = document.querySelector<HTMLButtonElement>('#btn-calc-payroll')!;
const btnPrintPayroll = document.querySelector<HTMLButtonElement>('#btn-print-payroll')!;
const payrollListBody = document.querySelector<HTMLTableSectionElement>('#payroll-list')!;
const payrollActions = document.querySelector<HTMLDivElement>('#payroll-actions')!;
const payrollSummary = document.querySelector<HTMLDivElement>('#payroll-summary')!;
const btnClearExtra = document.querySelector<HTMLButtonElement>('#btn-clear-extra')!; 
const modalExtra = document.querySelector<HTMLDivElement>('#modal-extra')!;
const extraForm = document.querySelector<HTMLFormElement>('#extra-form')!;
const btnCancelExtra = document.querySelector<HTMLButtonElement>('#btn-cancel-extra')!;


export function initPayrollEvents() {
    btnCalcPayroll.addEventListener(
    "click",
    handlePayrollCalculation
);

btnPrintPayroll.addEventListener(
    "click",
    printPayrollPdf
);

payrollListBody.addEventListener(
    "click",
    handleOpenExtraModal
);

btnCancelExtra.addEventListener(
    "click",
    closeExtraModal
);

extraForm.addEventListener(
    "submit",
    handleExtraSubmit
);

btnClearExtra.addEventListener(
    "click",
    handleResetExtra
);
}

export function initPayrollPage() {
  if (!payStart.value){
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
    payStart.value = firstDay.toISOString().split('T')[0];
    payEnd.value = lastDay.toISOString().split('T')[0];
  }
}

async function handlePayrollCalculation() {
    const start = payStart.value;
    const end = payEnd.value;

    if (!start || !end) {
        showMessageModal("Προσοχή", "Παρακαλώ επιλέξτε ημερομηνίες.", "warning");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/payroll/?start=${start}&end=${end}`);
        
        if (response.ok) {
            const data = await response.json(); 

            payrollListBody.innerHTML = '';
            
            if (data.payments.length === 0) {
                payrollListBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Δεν βρέθηκαν πληρωμές για αυτό το διάστημα.</td></tr>';
                payrollActions.classList.add('hidden');
                payrollSummary.classList.add('hidden');
                return;
            }
            payrollActions.classList.remove('hidden');
            renderPayrollSummary(data.payments);

            data.payments.forEach((item: any) => {
                const row = document.createElement('tr');
                row.className = "group payroll-row";
                const totalExtra = Number(item.total_extra ?? 0);
                const extraContent = totalExtra > 0
                    ? `
                        <button class="btn-add-extra payroll-extra-button payroll-extra-button-filled" data-id="${item.employee_id}" type="button">
                            <span class="payroll-extra-amount">${totalExtra.toFixed(2)} €</span>
                            <svg class="payroll-extra-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m-7-7h14" />
                            </svg>
                        </button>
                    `
                    : `
                        <button class="btn-add-extra payroll-extra-button payroll-extra-button-empty" data-id="${item.employee_id}" type="button">
                            + Προσθήκη
                        </button>
                    `;
                
                row.innerHTML = `
                    <td style="font-weight: 500;">${item.employee_name}</td>
                    <td style="text-align: center;">${item.days_worked}</td>
                    <td>${item.total_wage.toFixed(2)} €</td>
                    <td>${item.total_overtime.toFixed(2)} €</td>
                    <td class="payroll-total-amount">${item.grand_total.toFixed(2)} €</td>
                    <td class="payroll-bank-cell">
                        ${item.bank_pay.toFixed(2)} €
                    </td>
                    <td class="payroll-cash-cell">
                        ${item.cash_pay.toFixed(2)} €
                    </td>
                    <td class="payroll-extra-cell">${extraContent}</td>
                `;
                payrollListBody.appendChild(row);
            });

        } else {
            showMessageModal("Σφάλμα", "Πρόβλημα κατά τη λήψη μισθοδοσίας.", "error" );
        }
    } catch (error) {
        console.error(error);
        showMessageModal("Σφάλμα", "Πρόβλημα σύνδεσης.");
    }
}

function renderPayrollSummary(payments: any[]): void {
    const totals = payments.reduce(
        (summary, item) => ({
            grandTotal: summary.grandTotal + Number(item.grand_total ?? 0),
            bankPay: summary.bankPay + Number(item.bank_pay ?? 0),
            cashPay: summary.cashPay + Number(item.cash_pay ?? 0),
            totalExtra: summary.totalExtra + Number(item.total_extra ?? 0),
        }),
        { grandTotal: 0, bankPay: 0, cashPay: 0, totalExtra: 0 }
    );

    const formatAmount = (amount: number) => `${amount.toFixed(2)} €`;
    document.getElementById("payroll-summary-total")!.textContent = formatAmount(totals.grandTotal);
    document.getElementById("payroll-summary-bank")!.textContent = formatAmount(totals.bankPay);
    document.getElementById("payroll-summary-cash")!.textContent = formatAmount(totals.cashPay);
    document.getElementById("payroll-summary-extra")!.textContent = formatAmount(totals.totalExtra);
    payrollSummary.classList.remove("hidden");
}


function handleOpenExtraModal(e: Event) {
    const target = e.target as HTMLElement;
    const extraButton = target.closest<HTMLButtonElement>(".btn-add-extra");
    if (extraButton) {
        const empId = extraButton.dataset.id;
        (document.getElementById('extra-emp-id') as HTMLInputElement).value = empId!;
        (document.getElementById('extra-amount') as HTMLInputElement).value = '';
        (document.getElementById('extra-reason') as HTMLInputElement).value = '';
        
        if(modalExtra) modalExtra.classList.remove('hidden');
}
}

function closeExtraModal() {
    modalExtra.classList.add("hidden");
}


function printPayrollPdf() {
        const start = payStart.value;
        const end = payEnd.value;

        if (!start || !end) {
            showMessageModal("Προσοχή", "Παρακαλώ επιλέξτε ημερομηνίες.", "warning");
            return;
        }
        const url = `${API_URL}/payroll/pdf?start=${start}&end=${end}`;    
        window.open(url, '_blank');
}

async function handleExtraSubmit(e: Event) {
        e.preventDefault();
        const empId = (document.getElementById('extra-emp-id') as HTMLInputElement).value;
        const amount = parseFloat((document.getElementById('extra-amount') as HTMLInputElement).value);
        const reason = (document.getElementById('extra-reason') as HTMLInputElement).value;

        const payload = {
            date: payEnd.value,
            employee_id: parseInt(empId),
            boat_id: null,      
            present: null,      
            overtime_hours: null,
            extra_amount: amount,
            extra_reason: reason
        };

        try {
            const res = await fetch(`${API_URL}/attendance/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if(modalExtra) modalExtra.classList.add('hidden');
                btnCalcPayroll.click(); 
                showMessageModal("Επιτυχία", "Το Extra αποθηκεύτηκε!", "success");
            }
        } catch (err) {
            console.error(err);
            showMessageModal("Σφάλμα", "Πρόβλημα σύνδεσης", "error");
        }
}

async function handleResetExtra() {
        const empId = (document.getElementById('extra-emp-id') as HTMLInputElement).value;
        
        const payload = {
            date: payEnd.value,
            employee_id: parseInt(empId),
            boat_id: null,
            present: null,
            overtime_hours: null,
            extra_amount: 0,    
            extra_reason: ""    
        };

        if (await showConfirmModal("Προειδοποίηση", "Θέλετε να διαγράψετε το Extra ποσό;", "error")) {
            try {
                const res = await fetch(`${API_URL}/attendance/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    if(modalExtra) modalExtra.classList.add('hidden');
                    btnCalcPayroll.click(); 
                    showMessageModal("Επιτυχία", "Το Extra διαγράφηκε!", "success");
                }
            } catch (err) {
                console.error(err);
            }
        }
    };
