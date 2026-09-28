import type { Employee } from "../models/employee";
import type { Boat } from "../models/boat";
import type { Material } from "../models/material";
import type { MaterialUsage } from "../models/materialsUsage";
import type { Supplier, NamedItem } from "../models/settings";

export const store = {
    employees: [] as Employee[],
    boats: [] as Boat[],
    materials: [] as Material[],
    materialUsages: [] as MaterialUsage[],
    suppliers: [] as Supplier[],
    invoiceCategories: [] as NamedItem[],
    materialUnits: [] as NamedItem[],
    materialCategories: [] as NamedItem[],
};

