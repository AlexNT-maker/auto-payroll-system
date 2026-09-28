import { store } from "../state/store";
import { getBoats } from "../api/boatsApi";
import { getEmployees } from "../api/employeesApi";
import { getMaterials } from "../api/materialsApi";
import { getMaterialUsages } from "../api/materialsUsageApi";
import { getSuppliers, getNamedItems } from "../api/settingsApi";

export async function fetchData() {
    try {
        store.boats = await getBoats(); 

        store.employees = await getEmployees();

        store.materials = await getMaterials();

        store.materialUsages = await getMaterialUsages();

        store.suppliers = await getSuppliers();
        store.invoiceCategories = await getNamedItems("invoice-categories");
        store.materialUnits = await getNamedItems("material-units");
        store.materialCategories = await getNamedItems("material-categories");

    } catch (error) {
        console.error(error);
    }
}