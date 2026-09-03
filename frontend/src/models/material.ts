export interface Material {
    id: number;
    name: string;
    category: string;
    unit: string;
    price: number;
}

export const MATERIAL_UNITS: string[] = [
    "GAL",
    "KG",
    "PCS",
    "M",
    "5L",
    "1L",
    "3L",
    "SET"
];