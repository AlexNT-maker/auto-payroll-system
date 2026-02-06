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
  } catch (error) {
    console.error("Error during fetching the data");
    alert("Not succesful connection with the server");
  }
}

// -- 4. Creating table --
function renderTable(){
  tableBody.innerHTML = '';

  employees.forEach((employee) => {
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
    boats.forEach(boat =>{
    const option = document.createElement('option');
    option.value = boat.id.toString() ; 
    option.textContent = boat.name ; 
    boatSelect.appendChild(option);
    } )
    boatCell.appendChild(boatSelect);
    row.appendChild(boatCell);

    // Cell No.4 Overtime
    const overtimeCell = document.createElement('td');
    const overtimeInput = document.createElement('input');
    overtimeInput.type = 'number';
    overtimeInput.min = '0' ;
    overtimeInput.value = '0' ;
    overtimeInput.value = '0' ;
    overtimeInput.classList.add('overtime-input');
    overtimeCell.appendChild(overtimeInput) ;
    row.appendChild(overtimeCell);

    tableBody.appendChild(row);
  })
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
})

// -- 6. Navigation logic --
const pages={
  home: document.getElementById('page-home')!,
  employees: document.getElementById('page-employees')!,
  boats: document.getElementById('page-boats')!,
};

const navButtons = {
  home: document.getElementById('nav-home')!,
  employees: document.getElementById('nav-employees')!,
  boats: document.getElementById('nav-boats')!,
};

function navigateTo(pageName: 'home' | 'employees' | 'boats') {
  Object.values(pages).forEach(page => {
    if (page) page.classList.add('hidden');
  });
  pages[pageName].classList.remove('hidden');

  Object.values(navButtons).forEach(btn => btn.classList.remove('active'));
  navButtons[pageName].classList.add('active');

  if (pageName === 'employees') renderEmployeesList();
  if (pageName === 'boats') renderBoatsList() ;
}

navButtons.home.addEventListener('click',() => navigateTo('home'));
navButtons.employees.addEventListener('click',() => navigateTo('employees'));
navButtons.boats.addEventListener('click',() => navigateTo('boats'));

// 7. -- Employee management logic -- 

// Modal and list items
const modal = document.querySelector<HTMLDivElement>('#modal-employee')!;
const btnAddEmployee = document.querySelector<HTMLButtonElement>('#btn-add-employee')!;
const btnCancel = document.querySelector<HTMLButtonElement>('#btn-cancel')!;
const employeeForm = document.querySelector<HTMLFormElement>('#employee-form')!;
const employeesListBody = document.querySelector<HTMLTableSectionElement>('#employees-list')!;

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




fetchData();