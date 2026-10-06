import type { Employee } from "../models/employee";
import { API_URL } from "../config/api";

type EmployeePayload = {
    name: string;
    daily_wage: number;
    overtime_rate: number;
    bank_daily_amount: number;
};

const BASE_URL = `${API_URL}/employees`;

export async function getEmployees(): Promise<Employee[]> {
    const response = await fetch(`${BASE_URL}/`);

    if (!response.ok) {
        throw new Error("Failed to fetch employees");
    }

    return response.json();
}

export async function createEmployee(
    employee: EmployeePayload
): Promise<Employee> {

    const response = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(employee)
    });

    if (!response.ok) {
        throw new Error("Failed to create employee");
    }

    return response.json();
}

export async function updateEmployee(
    id: number,
    employee: EmployeePayload
): Promise<Employee> {

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(employee)
    });

    if (!response.ok) {
        throw new Error("Failed to update employee");
    }

    return response.json();
}

export async function deleteEmployee(id: number): Promise<void> {

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Failed to delete employee");
    }
}


