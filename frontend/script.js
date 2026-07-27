const API_URL = "https://campus-market-92ie.onrender.com";


// ================= SOCKET.IO =================

const socket = io("https://campus-market-92ie.onrender.com");


const currentUser = JSON.parse(
    localStorage.getItem("user")
);


if(currentUser){

    socket.emit(
        "join",
        currentUser.id
    );

}



// ================= NOTIFICATIONS =================


socket.on(
"newNotification",
()=>{

    if(!currentUser) return;

    updateMessageCount();

});



let allProducts = [];



// ================= LOAD PRODUCTS =================


async function loadProducts(){


    try{


        const response =
        await fetch(API_URL);


        allProducts =
        await response.json();


        displayProducts(allProducts);


    }


    catch(error){

        console.log(error);

    }


}



// ================= DISPLAY PRODUCTS =================


function displayProducts(products){


const container =
document.getElementById("products");


if(!container) return;


container.innerHTML = "";


let favorites =
JSON.parse(
localStorage.getItem("favorites")
) || [];


products.forEach(product=>{


const saved =
favorites.includes(product._id);


const sellerId =
product.seller
?
product.seller._id
:
"";
console.log("Logged in user:", currentUser);
console.log("Seller ID:", sellerId);
console.log("Current User ID:", currentUser ? currentUser.id : "No user");

const sellerName =
product.seller
?
product.seller.name
:
"Student Seller";


const image =
product.image
?
product.image
:
"https://via.placeholder.com/500";


container.innerHTML += `

<div class="card">

<div class="image-box"
onclick="openProduct('${product._id}')">

<img

src="${image}"

alt="${product.name}"

loading="lazy"

>

<button

class="heart-btn"

onclick="
event.stopPropagation();
favoriteProduct('${product._id}')
">

${saved ? "❤️" : "🤍"}

</button>

<span class="category-badge">

${product.category || "General"}

</span>

<span class="market-badge">

🎓 Campus Market

</span>

</div>

<div class="card-content"

onclick="openProduct('${product._id}')">

<h3>

${product.name}

</h3>

<div class="price">

MK ${Number(product.price).toLocaleString()}

</div>

<div class="product-info">

<p>

📍 LUANAR Campus

</p>

<p class="seller-name">

👤 ${sellerName}

</p>

</div>

</div>

<div class="card-buttons">

${
currentUser && sellerId === currentUser.id
?

`
<button
class="view-btn"
onclick="editProduct('${product._id}')">
✏️ Edit
</button>

<button
style="background:#ef4444;color:white;"
onclick="deleteProduct('${product._id}')">
🗑 Delete
</button>
`

:

`
<button
class="chat-btn"
onclick="
chatSeller(
'${sellerId}',
'${sellerName}',
'${product._id}'
)
">
💬 Chat
</button>

<button
class="view-btn"
onclick="openProduct('${product._id}')">
👀 View
</button>
`

}

</div>
</div>

`;

});

}



// ================= SEARCH =================


document.addEventListener(
"DOMContentLoaded",
()=>{


const searchInput =
document.getElementById("searchInput");


if(searchInput){


searchInput.addEventListener(
"input",
function(){


const value =
this.value.toLowerCase();


const filtered =
allProducts.filter(product=>

product.name
.toLowerCase()
.includes(value)

);


displayProducts(filtered);


});


}


});



// ================= CATEGORY FILTER =================


function filterCategory(category){


if(category==="all"){

displayProducts(allProducts);

return;

}


const filtered =
allProducts.filter(product=>

product.category &&

product.category
.toLowerCase()
===
category.toLowerCase()

);


displayProducts(filtered);


}



// ================= OPEN PRODUCT =================


function openProduct(id){

window.location.href =
`product.html?id=${id}`;

}



// ================= FAVORITES =================


function favoriteProduct(id){


let favorites =
JSON.parse(
localStorage.getItem("favorites")
)
|| [];


if(favorites.includes(id)){

favorites =
favorites.filter(
item=>item!==id
);

}

else{

favorites.push(id);

}


localStorage.setItem(
"favorites",
JSON.stringify(favorites)
);


displayProducts(allProducts);

}



// ================= CHAT =================


function chatSeller(
sellerId,
sellerName,
productId
){


if(!sellerId){

alert(
"This product has no seller account."
);

return;

}


window.location.href =

`chat.html?seller=${sellerId}&name=${encodeURIComponent(sellerName)}&product=${productId}`;

}



// ================= USER =================


function showUser(){


const userArea =
document.getElementById("user-area");


if(!userArea) return;


const user =
localStorage.getItem("user");


if(user){


const currentUser =
JSON.parse(user);


userArea.innerHTML = `

<span>

Welcome ${currentUser.name}

</span>

<a href="sell.html">

<button class="sell-btn">

+ Sell Item

</button>

</a>

`;

}

}



// ================= MESSAGE COUNT =================


async function updateMessageCount(){


const token =
localStorage.getItem("token");


if(!token) return;


try{


const response =
await fetch(

"https://campus-market-92ie.onrender.com/messages/inbox"

{

headers:{

"Authorization":

`Bearer ${token}`

}

}

);


if(!response.ok) return;


const data =
await response.json();


const badge =
document.getElementById(
"message-count"
);


if(!badge) return;


const unread =
data.unreadCount || 0;


if(unread > 0){

badge.innerHTML =
unread;

badge.style.display =
"inline-block";

}

else{

badge.innerHTML="";

badge.style.display="none";

}

}

catch(error){

console.log(error);

}

}


setInterval(
()=>{

updateMessageCount();

},
5000
);



// ================= LOGOUT =================


function logout(){

localStorage.removeItem("user");

localStorage.removeItem("token");

alert(
"Logged out successfully"
);

window.location.href =
"login.html";

}



// ================= START =================


showUser();

loadProducts();

updateMessageCount();
function editProduct(id){
    window.location.href = `edit-product.html?id=${id}`;
}

async function deleteProduct(id){

    if(!confirm("Delete this product?")) return;

    const token = localStorage.getItem("token");

    try{

        const response = await fetch(
            `https://campus-market-92ie.onrender.com/products/${id}`,
            {
                method:"DELETE",
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if(response.ok){
            alert("✅ Product deleted.");
            loadProducts();
        }else{
            alert(data.message);
        }

    }catch(err){
        console.log(err);
        alert("Server error.");
    }
}