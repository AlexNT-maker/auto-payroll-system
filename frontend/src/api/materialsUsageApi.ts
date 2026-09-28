import type { MaterialUsage } from "../models/materialsUsage";

const BASE_URL = "http://127.0.0.1:8000/material-usages";

type MaterialUsagePayload = {
    date: string;
    material_id: number;
    boat_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
};

export async function getMaterialUsages(): Promise<MaterialUsage[]> {
    const response = await fetch(`${BASE_URL}/`);
    if (!response.ok) throw new Error("Failed to fetch material usages");
    return response.json();
}

export async function createMaterialUsage(usage: MaterialUsagePayload): Promise<MaterialUsage> {
    const response = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usage)
    });
    if (!response.ok) throw new Error("Failed to create material usage");
    return response.json();
}

export async function updateMaterialUsage(id: number, usage: MaterialUsagePayload): Promise<MaterialUsage> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usage)
    });
    if (!response.ok) throw new Error("Failed to update material usage");
    return response.json();
}

export async function deleteMaterialUsage(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete material usage");
}