interface Material {
    code: string;
    name: string;
    category: string;
    unit: string;
    price: number;
}

const materials: Material[] = [
    {
        code: "MAT001",
        name: "Primer",
        category: "Χρώματα",
        unit: "L",
        price: 24.50
    },
    {
        code: "MAT002",
        name: "Paint",
        category: "Χρώματα",
        unit: "GAL",
        price: 80.00
    },
    {
        code: "MAT003",
        name: "Γυαλόχαρτο",
        category: "Αναλώσιμα",
        unit: "PCS",
        price: 1.20
    }
];

const materialsList = document.querySelector<HTMLTableSectionElement>("#materials-list")!;

function renderMaterials(): void {
    materialsList.innerHTML = "";

    materials.forEach((material) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${material.code}</td>
            <td>${material.name}</td>
            <td>${material.category}</td>
            <td>${material.unit}</td>
            <td>${material.price.toFixed(2)} €</td>
            <td>
                <div class="materials-actions">
                    <button class="material-edit-btn">
                        Επεξεργασία
                    </button>

                    <button class="material-delete-btn">
                        Διαγραφή
                    </button>
                </div>
            </td>
        `;

        materialsList.appendChild(row);
    });
}

renderMaterials();