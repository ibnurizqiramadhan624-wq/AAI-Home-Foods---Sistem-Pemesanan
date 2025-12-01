const API_URL = "http://localhost:4000";

// Load orders saat halaman dibuka
document.addEventListener("DOMContentLoaded", loadOrders);

async function loadOrders() {
    const res = await fetch(`${API_URL}/orders`);
    const orders = await res.json();

    displayOrders(orders);
    window.allOrders = orders; // simpan untuk filter
}

function displayOrders(data) {
    const list = document.getElementById("ordersList");
    list.innerHTML = "";

    data.forEach(order => {
        const itemsPreview = JSON.parse(order.items)
            .map(i => `${i.name} (${i.quantity})`)
            .join(", ");

        list.innerHTML += `
            <tr>
                <td>${order.id}</td>
                <td>${order.user_name || "-"}</td>
                <td>${itemsPreview}</td>
                <td>Rp ${order.total.toLocaleString()}</td>
                <td>${order.date}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td>
                    <button class="btn-primary btn-sm" onclick="openDetail(${order.id})">
                        Detail
                    </button>
                </td>
            </tr>
        `;
    });
}

// =================== Modal Detail ===================

function openDetail(orderId) {
    const order = window.allOrders.find(o => o.id === orderId);
    const itemsHTML = JSON.parse(order.items)
        .map(i => `<li>${i.name} x ${i.quantity} — Rp ${i.price}</li>`)
        .join("");

    document.getElementById("orderDetails").innerHTML = `
        <p><strong>ID:</strong> ${order.id}</p>
        <p><strong>User:</strong> ${order.user_name}</p>
        <p><strong>Total:</strong> Rp ${order.total.toLocaleString()}</p>
        <p><strong>Tanggal:</strong> ${order.date}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <h4>Items:</h4>
        <ul>${itemsHTML}</ul>
    `;

    window.currentOrderId = orderId;

    document.getElementById("orderModal").style.display = "flex";
}

// Tutup modal
document.querySelector(".close-modal").onclick = () => {
    document.getElementById("orderModal").style.display = "none";
};

// =================== Update Status ===================

document.getElementById("markCompleted").onclick = async () => {
    await updateStatus(window.currentOrderId, "completed");
};

document.getElementById("markCancelled").onclick = async () => {
    await updateStatus(window.currentOrderId, "cancelled");
};

async function updateStatus(id, status) {
    await fetch(`${API_URL}/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });

    document.getElementById("orderModal").style.display = "none";
    loadOrders();
}

// =================== Filter + Search ===================

document.getElementById("searchOrder").oninput = () => {
    const keyword = searchOrder.value.toLowerCase();

    const filtered = window.allOrders.filter(o =>
        o.user_name?.toLowerCase().includes(keyword) ||
        JSON.parse(o.items).some(i => i.name.toLowerCase().includes(keyword))
    );

    displayOrders(filtered);
};

document.getElementById("filterStatus").onchange = () => {
    const val = filterStatus.value;

    if (val === "all") return displayOrders(window.allOrders);

    const filtered = window.allOrders.filter(o => o.status === val);
    displayOrders(filtered);
};
