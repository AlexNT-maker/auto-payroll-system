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
    const boatSelect = row.querySelector('.boat-select') as HTMLInputElement;
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

fetchData();