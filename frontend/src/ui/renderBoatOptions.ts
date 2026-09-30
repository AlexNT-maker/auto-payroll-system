import { store } from "../state/store";


export function renderBoatOptions(
    select: HTMLSelectElement,
    selectedBoat: string,
    defaultText: string
) {
    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = defaultText;
    select.appendChild(defaultOption);

    store.boats.forEach((boat) => {
        const option = document.createElement("option");
        option.value = boat.id.toString();
        option.textContent = boat.name;

        if (boat.id.toString() === selectedBoat) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

