import type { Boat } from "../models/boat";

const BASE_URL = "http://127.0.0.1:8000/boats";

type BoatPayload = {
    name: string;
};

export async function getBoats(): Promise<Boat[]> {
    const response = await fetch(`${BASE_URL}/`);

    if (!response.ok) {
        throw new Error("Failed to fetch boats");
    }

    return response.json();
}

export async function createBoat(
    boat: BoatPayload
): Promise<Boat> {

    const response = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(boat)
    });

    if (!response.ok) {
        throw new Error("Failed to create boat");
    }

    return response.json();
}

export async function updateBoat(
    id: number,
    boat: BoatPayload
): Promise<Boat> {

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(boat)
    });

    if (!response.ok) {
        throw new Error("Failed to update boat");
    }

    return response.json();
}

export async function deleteBoat(
    id: number
): Promise<void> {

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Failed to delete boat");
    }
}
    
