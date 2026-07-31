import type { Employee } from "../models/employee";
import { renderBoatOptions } from "./renderBoatOptions";

export function renderEmployeeRow(
    employee: Employee,
    record: any
): HTMLTableRowElement {

    const row = document.createElement("tr");

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

    const halfCell = document.createElement('td');
    const halfInput = document.createElement('input');
    halfInput.type = 'checkbox';
    halfInput.dataset.empId = employee.id.toString();
    halfInput.classList.add('half-checkbox');
    halfCell.appendChild(halfInput);
    row.appendChild(halfCell);

    // -- TEMP SYNC: Checkboxes --
    if (employee.tempPresent !== undefined ? employee.tempPresent : (record && record.present)) {
        presentInput.checked = true;
    }
    if (employee.tempHalfDay !== undefined ? employee.tempHalfDay : (record && record.is_half_day)) {
        halfInput.checked = true;
    }

    presentInput.addEventListener('change', () => { if(presentInput.checked) halfInput.checked = false; });
    halfInput.addEventListener('change', () => { if(halfInput.checked) presentInput.checked = false; });

    // Cell No.3 Boat (Dropdown style)
    const boatCell = document.createElement('td');
    const boatSelect = document.createElement('select');
    boatSelect.classList.add('boat-select');

renderBoatOptions(
    boatSelect,
    employee.tempBoat !== undefined
        ? employee.tempBoat
        : (record && record.boat_id
            ? record.boat_id.toString()
            : ""),
    "-- Επιλογή --"
);

boatCell.appendChild(boatSelect);
row.appendChild(boatCell);

    const otBoatCell = document.createElement('td');
    const otBoatSelect = document.createElement('select');
    otBoatSelect.classList.add('ot-boat-select');

renderBoatOptions(
    otBoatSelect,
    employee.tempOtBoat !== undefined
        ? employee.tempOtBoat
        : (record && record.overtime_boat_id
            ? record.overtime_boat_id.toString()
            : ""),
    "-- Ίδιο με Ημερ. --"
);

otBoatCell.appendChild(otBoatSelect);
row.appendChild(otBoatCell);


    // Cell No.4 Overtime
    const overtimeCell = document.createElement('td');
    const overtimeInput = document.createElement('input');
    overtimeInput.type = 'number';
    overtimeInput.min = '0';
    overtimeInput.step = '0.5';
    overtimeInput.classList.add('overtime-input');
    
    // -- TEMP SYNC: Ώρες Υπερωρίας --
    overtimeInput.value = employee.tempOvertime !== undefined ? employee.tempOvertime : (record ? record.overtime_hours.toString() : '0');
    
    overtimeCell.appendChild(overtimeInput);
    row.appendChild(overtimeCell);

    return row;
}