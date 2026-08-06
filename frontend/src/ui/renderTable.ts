import { store } from "../state/store";
import { renderBoatOptions } from "./renderBoatOptions";
import { renderEmployeeRow } from "./renderEmployeeRow";

const tableBody = document.querySelector<HTMLTableSectionElement>('#attendance-list')!;

export function renderTable(existingData: any[]=[]){
  tableBody.innerHTML = '';

  store.employees.forEach((employee) => {
    const record = existingData.find(r => r.employee_id === employee.id);

    const row = renderEmployeeRow(employee, record);

    tableBody.appendChild(row);
  });
}