export async function loadAttendance(date: string) {
    const response = await fetch(`http://127.0.0.1:8000/attendance/${date}`);  

    if (!response.ok) {
        throw new Error("Failed to load attendance");
    }

    return response.json();
}

