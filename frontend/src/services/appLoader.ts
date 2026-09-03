import { store } from "../state/store";
import { getBoats } from "../api/boatsApi";
import { getEmployees } from "../api/employeesApi";
import { getMaterials } from "../api/materialsApi";

export async function fetchData() {
    try {
        store.boats = await getBoats(); 

        store.employees = await getEmployees();

        store.materials = await getMaterials();

    } catch (error) {
        console.error(error);
    }
}