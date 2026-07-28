const API_URL = "https://campus-market-92ie.onrender.com/products";



async function loadProduct(){



const params =
new URLSearchParams(
window.location.search
);



const id =
params.get("id");




if(!id){


document.getElementById(
"product-details"
).innerHTML =
"<h2>Product not found</h2>";


return;


}




try{



const response =
await fetch(
`${API_URL}/${id}`
);



const product =
await response.json();




const seller =
product.seller || {};




const container =
document.getElementById(
"product-details"
);






container.innerHTML = `



<div class="product-detail-card">



<div class="product-image">



<img

src="${
product.image ||
'https://via.placeholder.com/500'
}"

alt="${product.name}"

>



</div>







<div class="product-info">





<span class="detail-category">

${product.category || "General"}

</span>






<h1>

${product.name}

</h1>






<div class="product-price">

MK ${Number(product.price).toLocaleString()}

</div>






<div class="quick-info">


<p>

📍 LUANAR Campus

</p>


<p>

🎓 Student Marketplace

</p>


</div>








<div class="description">


<h3>

Description

</h3>


<p>

${
product.description ||
"No description available"
}

</p>


</div>









<div class="seller-box">



<h3>

👤 Seller

</h3>




${
seller._id

?

`

<img

src="${
seller.profileImage ||
'https://via.placeholder.com/100'
}"

class="seller-image">


<h4>

<a href="seller.html?id=${seller._id}">

${seller.name}

</a>


</h4>




<p>

📍 ${seller.campus || "LUANAR Campus"}

</p>



<p>

⭐ ${seller.rating || 0}

(${seller.reviews || 0} reviews)

</p>




<p>

${seller.bio || "Student seller"}

</p>



`

:

`

<p>

Student Seller

</p>

`

}



</div>








<button

class="chat-button"

onclick="chatSeller(

'${seller._id}',

'${product._id}',

'${seller.name}',

'${encodeURIComponent(product.name)}',

'${product.price}',

'${encodeURIComponent(product.image || "")}'

)">



💬 Message Seller



</button>







</div>



</div>



`;



}



catch(error){



console.log(error);



document.getElementById(
"product-details"
).innerHTML =
"<h2>Error loading product</h2>";



}



}










function chatSeller(
sellerId,
productId,
sellerName,
productName,
price,
image
){



if(!sellerId){


alert(
"Seller account not found"
);


return;


}





window.location.href =


`chat.html?seller=${sellerId}&product=${productId}&name=${encodeURIComponent(sellerName)}&productName=${productName}&price=${price}&image=${image}`;



}







loadProduct();