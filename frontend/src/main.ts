// -- 1. The kind of data we expect --
interface Employee {
  id: number;
  name: string;
  daily_wage: number;
  overtime_rate: number;
  bank_daily_amount: number;
}

interface Boat{
  id: number;
  name: string;
}

let employees: Employee[] = [];
let boats: Boat[] = []

// -- 2. Choose html elements --
const tableBody = document.querySelector<HTMLTableSectionElement>('#attendance-list')!;
const datePicker = document.querySelector<HTMLInputElement>('#date-picker')!;
const form = document.querySelector<HTMLFormElement>('#attendance-form')!;
const btnEditDaily = document.querySelector<HTMLButtonElement>('#btn-edit-daily')!;
const btnSubmitDaily = document.querySelector<HTMLButtonElement>('#btn-submit-daily')!;

// Set as default today
datePicker.valueAsDate = new Date();

// -- 3. Fetch data from backend --
async function fetchData() {
  try{
    const boatResponse = await fetch('http://127.0.0.1:8000/boats/');
    boats = await boatResponse.json();

    const employeesResponse = await fetch('http://127.0.0.1:8000/employees/');
    employees = await employeesResponse.json();
    renderTable();
    await loadDayData();
  } catch (error) {
    console.error("Error during fetching the data");
    alert("Not succesful connection with the server");
  }
}

// -- 4. Creating table --
function renderTable(existingData: any[]=[]){
  tableBody.innerHTML = '';

  employees.forEach((employee) => {
    const record = existingData.find(r => r.employee_id === employee.id);
    const row = document.createElement('tr');

    // Cell No.1 Employees
    const nameCell = document.createElement('td');
    nameCell.textContent = employee.name ;
    row.appendChild(nameCell);

    // Cell No.2 Input checkbox
    const presentCell = document.createElement('td');
    const presentInput = document.createElement('input');
    presentInput.type = 'checkbox';
    presentInput.dataset.empId = employee.id.toString();
    presentInput.classList.add('presence-checkbox');
    if (record && record.present) presentInput.checked = true;
    presentCell.appendChild(presentInput);
    row.appendChild(presentCell);

    // Cell No.3 Boat (Dropdown style)
    const boatCell = document.createElement('td');
    const boatSelect = document.createElement('select');
    boatSelect.classList.add('boat-select');

    // Create an empty default option for the dropdown menu
    const defaultOption = document.createElement('option');
    defaultOption.text = '-- Επιλογή --' ;
    defaultOption.value = '';
    boatSelect.appendChild(defaultOption);

    // Fill the dropdown with boats from the database
    boats.forEach(boat => {
      const option = document.createElement('option');
      option.value = boat.id.toString();
      option.textContent = boat.name;
      if (record && record.boat_id === boat.id) option.selected = true;
      boatSelect.appendChild(option);
    });
    boatCell.appendChild(boatSelect);
    row.appendChild(boatCell);

    // Cell No.4 Overtime
    const overtimeCell = document.createElement('td');
    const overtimeInput = document.createElement('input');
    overtimeInput.type = 'number';
    overtimeInput.min = '0';
    overtimeInput.classList.add('overtime-input');
    // Αν υπάρχει record, βάζουμε την τιμή
    overtimeInput.value = record ? record.overtime_hours.toString() : '0';
    
    overtimeCell.appendChild(overtimeInput);
    row.appendChild(overtimeCell);

    tableBody.appendChild(row);
  });
}

// 5. -- Management of data when user clicks submit --
form.addEventListener('submit', async (event: Event)=>{
  event.preventDefault() ; 

  const date = datePicker.value;
  if(!date){
    alert('Παρακαλώ επιλέξτε ημερομηνία');
    return ;
  }

  const rows = tableBody.querySelectorAll('tr');

  for (const row of rows) {
    const checkbox = row.querySelector('.presence-checkbox') as HTMLInputElement;
    const boatSelect = row.querySelector('.boat-select') as HTMLSelectElement;
    const overtimeInput = row.querySelector('.overtime-input') as HTMLInputElement;

    const empId = parseInt(checkbox.dataset.empId!);
    const isPresent = checkbox.checked;

    if(isPresent && !boatSelect.value){
      alert ('Παρακαλώ επιλέξτε σκάφος, για όλους τους παρόντες');
      return ;
    }

    const payload = {
      date: date,
      employee_id: empId,
      boat_id: boatSelect.value ? parseInt(boatSelect.value) : 1, 
      present: isPresent,
      overtime_hours: parseFloat(overtimeInput.value) || 0,
      extra_amount: 0,
      extra_reason: ""
    };

    if (isPresent) {
        try {
            await fetch('http://127.0.0.1:8000/attendance/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.error('Error saving row', err);
        }
    }
  }

  alert('Η αποθήκευση ολοκληρώθηκε!');

  window.location.reload();
})

// -- 6. Navigation logic --
const pages={
  home: document.getElementById('page-home')!,
  employees: document.getElementById('page-employees')!,
  boats: document.getElementById('page-boats')!,
  expenses: document.getElementById('page-expenses')!,
  payments: document.getElementById('page-payments')!,
};

const navButtons = {
  home: document.getElementById('nav-home')!,
  employees: document.getElementById('nav-employees')!,
  boats: document.getElementById('nav-boats')!,
  expenses: document.getElementById('nav-expenses')!,
  payments: document.getElementById('nav-payments')!,
};

function navigateTo(pageName: 'home' | 'employees' | 'boats'| 'expenses'| 'payments') {
  Object.values(pages).forEach(page => {
    if (page) page.classList.add('hidden');
  });
  pages[pageName].classList.remove('hidden');

  Object.values(navButtons).forEach(btn => btn.classList.remove('active'));
  navButtons[pageName].classList.add('active');

  if (pageName === 'employees') renderEmployeesList();
  if (pageName === 'boats') renderBoatsList() ;
  if (pageName === 'expenses') initExpensesPage();
  if (pageName === 'payments') initPayrollPage();
}

// Functions to lock form when we submit and to unlock when the edit button is clicked
function lockForm() {
  const inputs = tableBody.querySelectorAll('input, select');
  inputs.forEach((input: any) => input.disabled = true);
  btnSubmitDaily.classList.add('hidden');
  btnEditDaily.classList.remove('hidden');
}

function unlockForm() {
  const inputs = tableBody.querySelectorAll('input, select');
  inputs.forEach((input: any) => input.disabled = false);
  btnSubmitDaily.classList.remove('hidden');
  btnEditDaily.classList.add('hidden');
}

async function loadDayData() {
  const date = datePicker.value;
  if (!date) return;
  try{
    const response = await fetch(`http://127.0.0.1:8000/attendance/${date}`);
    if(response.ok){
      const data = await response.json();

      console.log("Δεδομένα που ήρθαν", data);

      if (data.length > 0){
        renderTable(data);
        lockForm();
      } else {
        renderTable([]);
        unlockForm();
      }
    }
  } catch(error) {
    console.error("Error loading day data", error);
  }
}

datePicker.addEventListener('change', loadDayData);

btnEditDaily.addEventListener('click', () => {
    unlockForm();
    alert("Η φόρμα ξεκλείδωσε. Μην ξεχάσετε να πατήσετε 'Αποθήκευση' μετά τις αλλαγές!");
});

navButtons.home.addEventListener('click',() => navigateTo('home'));
navButtons.employees.addEventListener('click',() => navigateTo('employees'));
navButtons.boats.addEventListener('click',() => navigateTo('boats'));
navButtons.expenses.addEventListener('click',() => navigateTo('expenses'));
navButtons.payments.addEventListener('click', () => navigateTo('payments'));

// 7. -- Employee management logic -- 

// Modal and list items
const modal = document.querySelector<HTMLDivElement>('#modal-employee')!;
const btnAddEmployee = document.querySelector<HTMLButtonElement>('#btn-add-employee')!;
const btnCancel = document.querySelector<HTMLButtonElement>('#btn-cancel')!;
const employeeForm = document.querySelector<HTMLFormElement>('#employee-form')!;
const employeesListBody = document.querySelector<HTMLTableSectionElement>('#employees-list')!;
const modalExtra = document.querySelector<HTMLDivElement>('#modal-extra')!;
const extraForm = document.querySelector<HTMLFormElement>('#extra-form')!;
const btnCancelExtra = document.querySelector<HTMLButtonElement>('#btn-cancel-extra')!;

// Form Inputs
const inputName = document.querySelector<HTMLInputElement>('#emp-name')!;
const inputWage = document.querySelector<HTMLInputElement>('#emp-wage')!;
const inputOvertime = document.querySelector<HTMLInputElement>('#emp-overtime')!;
const inputBank = document.querySelector<HTMLInputElement>('#emp-bank')!;
const inputId = document.querySelector<HTMLInputElement>('#emp-id')!;

// Function to display the list
function renderEmployeesList(){
  employeesListBody.innerHTML = '';
  employees.forEach(emp =>{
  const row = document.createElement('tr');

  row.innerHTML=`
  <td>${emp.name}</td>
  <td>${emp.daily_wage}€</td>
  <td>${emp.overtime_rate}€</td>
  <td>${emp.bank_daily_amount}€</td>
  <td>
  <button class="action-btn btn-edit hover-lift" data-id="${emp.id}">Επεξεργασία</button>
  <button class="action-btn btn-delete hover-lift" data-id="${emp.id}">Διαγραφή</button>
  </td>
  `;
  employeesListBody.appendChild(row);
  });
  attachActionListeners();
}

function attachActionListeners() {
    // Logic for Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            openEditModal(id);
        });
    });

    // Logic for Delete buttons 
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            if(confirm("Είστε σίγουρος για τη διαγραφή;")) {
                deleteEmployee(id);
            }
        });
    });
}


// -- 8. Modal functions --
function openModal() {
    modal.classList.remove('hidden');
    employeeForm.reset(); 
    inputId.value = '';   
    document.getElementById('modal-title')!.textContent = "Νέος Εργαζόμενος";
}

function closeModal() {
    modal.classList.add('hidden');
}

function openEditModal(id: number) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    inputName.value = emp.name;
    inputWage.value = emp.daily_wage.toString();
    inputOvertime.value = emp.overtime_rate.toString();
    inputBank.value = emp.bank_daily_amount.toString();
    inputId.value = emp.id.toString();

    document.getElementById('modal-title')!.textContent = "Επεξεργασία Εργαζόμενου";
    modal.classList.remove('hidden');
}


// 9. -- Modal Event Listeners --

btnAddEmployee.addEventListener('click', openModal);

btnCancel.addEventListener('click', () => {
  modal.classList.add('hidden');
});




// 10. -- Save employee logic --

employeeForm.addEventListener('submit', async (e) =>{
  e.preventDefault();

  const formData = {
    name: inputName.value,
    daily_wage: parseFloat(inputWage.value),
    overtime_rate: parseFloat(inputOvertime.value),
    bank_daily_amount: parseFloat(inputBank.value)
  };

  const id = inputId.value;

  try {
    let response;

    // --- PUT ---
    if (id) {
      response = await fetch(`http://127.0.0.1:8000/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
    } else {
      // --- POST ---
      response = await fetch('http://127.0.0.1:8000/employees/', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }

    if (response.ok) {
      closeModal();
      await fetchData(); 
      alert(id ? "Τα στοιχεία ενημερώθηκαν!" : "Ο εργαζόμενος προστέθηκε!");
    } else {
      alert("Υπήρξε πρόβλημα κατά την αποθήκευση.");
    }

  } catch (error) {
    console.error("Error saving employee:", error);
    alert("Σφάλμα επικοινωνίας με τον server.");
  }

  await loadDayData();
  alert("Επιτυχής αποθήκευση")
});


// 11. -- Delete logic --
async function deleteEmployee(id:number) {
  try{
    const response = await fetch(`http://127.0.0.1:8000/employees/${id}`, {
      method: 'DELETE'
  });

  if(response.ok){
  await fetchData();
  alert("Ο εργαζόμενος διαγράφηκε επιτυχώς");
} else{
  const errorData = await response.json();
  alert("Σφάλμα διαγραφής: " + (errorData.detail || "Άγνωστο σφάλμα"));
}
} catch (error) {
  console.error("Delete error:", error);
  alert("Δεν ήταν δυνατή η σύνδεση με τον server");
}
}


// 12. --Boats create logic --
// Selectors
const modalBoat = document.querySelector<HTMLDivElement>('#modal-boat')!;
const btnAddBoat = document.querySelector<HTMLButtonElement>('#btn-add-boat')!;
const btnCancelBoat = document.querySelector<HTMLButtonElement>('#btn-cancel-boat')!;
const boatForm = document.querySelector<HTMLFormElement>('#boat-form')!;
const boatsListBody = document.querySelector<HTMLTableSectionElement>('#boats-list')!;
const inputBoatName = document.querySelector<HTMLInputElement>('#boat-name')!;
const inputBoatId = document.querySelector<HTMLInputElement>('#boat-id')!;
const modalAnalysis = document.querySelector<HTMLDivElement>('#modal-boat-analysis')!;
const btnCloseAnalysis = document.querySelector<HTMLButtonElement>('#btn-close-analysis')!;
const btnRunAnalysis = document.querySelector<HTMLButtonElement>('#btn-run-analysis')!;
const inputStart = document.querySelector<HTMLInputElement>('#analysis-start')!;
const inputEnd = document.querySelector<HTMLInputElement>('#analysis-end')!;
const resultsDiv = document.querySelector<HTMLDivElement>('#analysis-results')!;
const totalCostSpan = document.querySelector<HTMLSpanElement>('#total-cost')!;
const analysisListBody = document.querySelector<HTMLTableSectionElement>('#analysis-list')!;
const analysisTitle = document.querySelector<HTMLHeadingElement>('#analysis-title')!;


let currentAnalysisBoatId: number | null = null;

function renderBoatsList(){
  boatsListBody.innerHTML = '';
  boats.forEach(boat => {
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

function attachBoatListeners() {
    boatsListBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            openBoatModal(id);
        });
    });

    boatsListBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            if(confirm("Είστε σίγουρος για τη διαγραφή;")) deleteBoat(id);
        });
    });

    boatsListBody.querySelectorAll('.btn-analysis').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt((e.target as HTMLElement).dataset.id!);
            openAnalysisModal(id);
        });
    });
}

function openAnalysisModal(boatId: number){
  currentAnalysisBoatId = boatId;
  const boat = boats.find(b => b.id === boatId);
    analysisTitle.textContent = `Ανάλυση: ${boat ? boat.name : ''}`;

    const now = new Date() ;
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() +1, 0) ;
    inputStart.valueAsDate = firstDay; 
    inputEnd.valueAsDate = lastDay;

    resultsDiv.classList.add('hidden'); 
    modalAnalysis.classList.remove('hidden');
}

btnRunAnalysis.addEventListener('click', async () => {
    if (!currentAnalysisBoatId) return;
    
    const start = inputStart.value;
    const end = inputEnd.value;

    if (!start || !end) {
        alert("Παρακαλώ επιλέξτε ημερομηνίες.");
        return;
    }
    
    try {
        const response = await fetch(`http://127.0.0.1:8000/boats/${currentAnalysisBoatId}/analysis?start=${start}&end=${end}`);
        
        if (response.ok) {
            const data = await response.json();
            
            analysisTitle.textContent = `Ανάλυση: ${data.boat_name}`;
            totalCostSpan.textContent = `${data.total_cost.toFixed(2)} €`;

            analysisListBody.innerHTML = ''; 
            
            data.analysis_data.forEach((item: any) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.date}</td>
                    <td>${item.employee_name}</td>
                    <td style="font-weight: bold;">${item.total_cost.toFixed(2)} €</td>
                `;
                analysisListBody.appendChild(row);
            });

            resultsDiv.classList.remove('hidden');

        } else {
            alert("Σφάλμα κατά τη λήψη δεδομένων.");
        }
    } catch (error) {
        console.error(error);
        alert("Σφάλμα σύνδεσης.");
    }
});

btnAddBoat.addEventListener('click', () => openBoatModal());
btnCancelBoat.addEventListener('click', () => modalBoat.classList.add('hidden'));
btnCloseAnalysis.addEventListener('click', () => {
  modalAnalysis.classList.add('hidden');
});


boatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = inputBoatName.value;
    const id = inputBoatId.value;
    
    try {
        let response;
        if (id) {
            response = await fetch(`http://127.0.0.1:8000/boats/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }) 
            });
        } else {
            response = await fetch('http://127.0.0.1:8000/boats/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
        }
        if (response.ok) {
            modalBoat.classList.add('hidden');
            await fetchData(); 
            renderBoatsList(); 
            alert("Επιτυχία!");
        } else {
            alert("Σφάλμα αποθήκευσης");
        }
    } catch (err) {
        console.error(err);
        alert("Σφάλμα δικτύου");
    }
});


function openBoatModal(id?: number) { 
    modalBoat.classList.remove('hidden');
    boatForm.reset();
    
    if (id) {
        
        const boat = boats.find(b => b.id === id);
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
async function deleteBoat(id: number) {
    try {
        const res = await fetch(`http://127.0.0.1:8000/boats/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await fetchData();
            renderBoatsList();
            alert("Το σκάφος διαγράφηκε");
        } else {
            alert("Αδυναμία διαγραφής");
        }
    } catch (err) {
        console.error(err);
    }
  }

  // -- 14. Expenses Logic --

const expStart = document.querySelector<HTMLInputElement>('#exp-start')!;
const expEnd = document.querySelector<HTMLInputElement>('#exp-end')!;
const expBoatSelect = document.querySelector<HTMLSelectElement>('#exp-boat')!;
const expEmpSelect = document.querySelector<HTMLSelectElement>('#exp-emp')!;
const btnCalcExpenses = document.querySelector<HTMLButtonElement>('#btn-calc-expenses')!;
const expensesListBody = document.querySelector<HTMLTableSectionElement>('#expenses-list')!;
const expTotalAmount = document.querySelector<HTMLSpanElement>('#exp-total-amount')!;
const expensesSummaryDiv = document.querySelector<HTMLDivElement>('#expenses-summary')!;

function initExpensesPage() {
    expBoatSelect.innerHTML = '<option value="">-- Όλα τα σκάφη --</option>';
    boats.forEach(boat => {
        const opt = document.createElement('option');
        opt.value = boat.id.toString();
        opt.textContent = boat.name;
        expBoatSelect.appendChild(opt);
    });

    expEmpSelect.innerHTML = '<option value="">-- Όλοι οι εργαζόμενοι --</option>';
    employees.forEach(emp => {
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

btnCalcExpenses.addEventListener('click', async () => {
    const start = expStart.value;
    const end = expEnd.value;
    const boatId = expBoatSelect.value;
    const empId = expEmpSelect.value;

    if (!start || !end) {
        alert("Παρακαλώ επιλέξτε ημερομηνίες.");
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
            alert("Σφάλμα κατά τη λήψη δεδομένων.");
        }
    } catch (error) {
        console.error(error);
        alert("Σφάλμα σύνδεσης.");
    }
});

// -- 15. Payments Logic/ Payroll --

const payStart = document.querySelector<HTMLInputElement>('#pay-start')!;
const payEnd = document.querySelector<HTMLInputElement>('#pay-end')!;
const btnCalcPayroll = document.querySelector<HTMLButtonElement>('#btn-calc-payroll')!;
const btnPrintPayroll = document.querySelector<HTMLButtonElement>('#btn-print-payroll')!;
const payrollListBody = document.querySelector<HTMLTableSectionElement>('#payroll-list')!;
const payrollActions = document.querySelector<HTMLDivElement>('#payroll-actions')!;

function initPayrollPage(){
  if (!payStart.value){
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(),1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
        payStart.value = firstDay.toISOString().split('T')[0];
        payEnd.value = lastDay.toISOString().split('T')[0];
  }
}

// Calculate wage
btnCalcPayroll.addEventListener('click', async () => {
    const start = payStart.value;
    const end = payEnd.value;

    if (!start || !end) {
        alert("Παρακαλώ επιλέξτε ημερομηνίες.");
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/payroll/?start=${start}&end=${end}`);
        
        if (response.ok) {
            const data = await response.json(); 

            payrollListBody.innerHTML = '';
            
            if (data.payments.length === 0) {
                payrollListBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Δεν βρέθηκαν πληρωμές για αυτό το διάστημα.</td></tr>';
                payrollActions.classList.add('hidden');
                return;
            }
            payrollActions.classList.remove('hidden');

            data.payments.forEach((item: any) => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td style="font-weight: 500;">${item.employee_name}</td>
                    <td style="text-align: center;">${item.days_worked}</td>
                    <td>${item.total_wage.toFixed(2)} €</td>
                    <td>${item.total_overtime.toFixed(2)} €</td>
                    <td style="font-weight: 800;">${item.grand_total.toFixed(2)} €</td>
                    
                    <td style="background-color: #eff6ff; color: #1e40af; font-weight: bold;">
                        ${item.bank_pay.toFixed(2)} €
                    </td>
                    
                    <td style="background-color: #fffbeb; color: #92400e; font-weight: bold;">
                        ${item.cash_pay.toFixed(2)} €
                    </td>
                    <button class="action-btn btn-add-extra" data-id="${item.employee_id}"style="background-color: #b35b2f; color: white; margin-left : 10px;">
            + Extra
        </button>
    </td>
                `;
                payrollListBody.appendChild(row);
            });

        } else {
            alert("Σφάλμα κατά τη λήψη μισθοδοσίας.");
        }
    } catch (error) {
        console.error(error);
        alert("Σφάλμα σύνδεσης.");
    }
});

payrollListBody.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('btn-add-extra')) {
        const empId = target.dataset.id;
        (document.getElementById('extra-emp-id') as HTMLInputElement).value = empId!;
        modalExtra.classList.remove('hidden');
    }
});

btnCancelExtra.addEventListener('click', () => modalExtra.classList.add('hidden'));

extraForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const empId = (document.getElementById('extra-emp-id') as HTMLInputElement).value;
    const amount = parseFloat((document.getElementById('extra-amount') as HTMLInputElement).value);
    const reason = (document.getElementById('extra-reason') as HTMLInputElement).value;

const payload = {
    date: payEnd.value, 
    employee_id: parseInt(empId),
    boat_id: 1, 
    present: false, 
    overtime_hours: 0,
    extra_amount: amount,
    extra_reason: reason
    };

try {
        const res = await fetch('http://127.0.0.1:8000/attendance/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            modalExtra.classList.add('hidden');
            extraForm.reset();
            btnCalcPayroll.click(); // Ανανέωση πίνακα για να δούμε το νέο σύνολο
            alert("Το Extra προστέθηκε!");
        }
    } catch (err) {
        console.error(err);
    }
});


// PDF Logic
btnPrintPayroll.addEventListener('click', () => {
    const start = payStart.value;
    const end = payEnd.value;

    if (!start || !end) {
        alert("Παρακαλώ επιλέξτε ημερομηνίες.");
        return;
    }
    const url = `http://127.0.0.1:8000/payroll/pdf?start=${start}&end=${end}`;    
    window.open(url, '_blank');
});


fetchData();