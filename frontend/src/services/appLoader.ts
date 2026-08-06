import { store } from "../state/store";
import { getBoats } from "../api/boatsApi";
import { getEmployees } from "../api/employeesApi";
import { renderTable } from "../ui/renderTable";
import { loadDayData } from "../handlers/attendanceEvents";


export async function fetchData() {
    try {
        store.boats = await getBoats(); 

        store.employees = await getEmployees();

        renderTable();

        await loadDayData();

    } catch (error) {
        console.error(error);
    }
}