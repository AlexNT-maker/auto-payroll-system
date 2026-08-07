import { store } from "../state/store";
import { renderEmployeeRow } from "./renderEmployeeRow";
import type { AttendanceRecord } from "../models/attendance";

const tableBody = document.querySelector<HTMLTableSectionElement>('#attendance-list')!;


export function renderTable(existingData: AttendanceRecord[]=[]){
  tableBody.innerHTML = '';

  store.employees.forEach((employee) => {
    const record = existingData.find(r => r.employee_id === employee.id);

    const row = renderEmployeeRow(employee, record);

    tableBody.appendChild(row);
  });
}


