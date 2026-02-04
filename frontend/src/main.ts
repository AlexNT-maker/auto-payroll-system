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

const tableBody = document.querySelector<HTMLTableSectionElement>(#attendance-list)!;
const datePicker = document.querySelector<HTMLInputElement>(#date-picker)!;
const form = document.querySelector<HTMLFormElement>(#attendance-form)!;

// Set as default today
datePicker.valueAsDate = new Date();