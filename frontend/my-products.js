const API_URL = "https://campus-market-92ie.onrender.com/products";
const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
}

async function loadMyProducts() {
    try {
        const response = await fetch(`${API_URL}/my`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const products = await response.json();
        const container = document.getElementById("products");
        container.innerHTML = "";

        if (!products.length) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px;">
                    <h2>📦 No Products Yet</h2>
                    <p>You haven't posted anything.</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            container.innerHTML += `
                <div class="card" id="${product._id}">
                    <div class="image-box">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="card-content">
                        <h3>${product.name}</h3>
                        <p class="price">MK ${product.price}</p>
                        <p>${product.category}</p>
                        <p>${product.description}</p>
                    </div>
                    <div class="card-buttons">
                        <button class="view-btn" onclick="viewProduct('${product._id}')">View</button>
                        <button class="chat-btn" onclick="editProduct('${product._id}')">Edit</button>
                        <button style="background:#ef4444;color:white;" onclick="deleteProduct('${product._id}')">Delete</button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.log(err);
        alert("Failed to load products.");
    }
}

function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

function editProduct(id) {
    window.location.href = `edit-product.html?id=${id}`;
}

async function deleteProduct(id) {
    const ok = confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById(id).remove();
            alert("✅ Product deleted successfully.");
        } else {
            alert(data.message || "Failed to delete.");
        }

    } catch (err) {
        console.log(err);
        alert("Server error.");
    }
}

loadMyProducts();