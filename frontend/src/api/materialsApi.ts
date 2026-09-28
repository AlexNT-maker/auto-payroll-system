import type { Material } from "../models/material";

const BASE_URL = "http://127.0.0.1:8000/materials";

type MaterialPayload = {
    name: string;
    category: string;
    unit: string;
    price: number;
};

export async function getMaterials(): Promise<Material[]> {
    const response = await fetch(`${BASE_URL}/`);

    if (!response.ok) {
        throw new Error("Failed to fetch materials");
    }

    return response.json();
}

export async function createMaterial(
    material: MaterialPayload
): Promise<Material> {

    const response = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(material)
    });

    if (!response.ok) {
        throw new Error("Failed to create material");
    }

    return response.json();
}

export async function updateMaterial(
    id: number,
    material: MaterialPayload
): Promise<Material> {

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(material)
    });

    if (!response.ok) {
        throw new Error("Failed to update material");
    }

    return response.json();
}

export async function deleteMaterial(
    id: number
): Promise<void> {

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Failed to delete material");
    }
}