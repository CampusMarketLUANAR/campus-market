const API_URL = "https://campus-market-92ie.onrender.com";


let selectedRating = 0;




// ================= LOAD SELLER =================


async function loadSeller(){


    const params =
    new URLSearchParams(
        window.location.search
    );


    const sellerId =
    params.get("id");



    if(!sellerId){

        document.getElementById(
            "seller-profile"
        ).innerHTML =
        "<h2>Seller not found</h2>";

        return;

    }



    try{


        const sellerResponse =
        await fetch(
            `${API_URL}/users/${sellerId}/profile`
        );


        const sellerData =
        await sellerResponse.json();


        const seller =
        sellerData.user;


        const stats =
        sellerData.stats;







        // ================= PRODUCTS =================


        const productResponse =
        await fetch(
            `${API_URL}/products`
        );


        const products =
        await productResponse.json();



        const sellerProducts =
        products.filter(product =>

            product.seller &&

            product.seller._id.toString()
            === sellerId

        );







        // ================= PROFILE CARD =================


        document.getElementById(
            "seller-profile"
        ).innerHTML = `



        <div class="seller-avatar">

            ${
                seller.profileImage

                ?

                `<img src="${seller.profileImage}"
                class="seller-image">`

                :

                "👤"

            }

        </div>



        <h1>
        ${seller.name}
        </h1>



        <p class="seller-status">

        ${
            stats.verified

            ?

            "✅ Verified Student Seller"

            :

            "🎓 Student Seller"

        }

        </p>



        <p>

        ⭐ ${stats.rating || 0}

        (${stats.reviews || 0} reviews)

        </p>



        <p>
        📍 ${seller.campus || "LUANAR Campus"}
        </p>



        <p class="seller-bio">

        ${
            seller.bio ||

            "Student seller on Campus Market"

        }

        </p>


        `;








        // ================= STATS =================


        const statsBox =
        document.getElementById(
            "seller-stats"
        );


        if(statsBox){


            statsBox.innerHTML = `


            <div>

                <h3>
                ${stats.totalProducts || sellerProducts.length}
                </h3>

                <p>
                Products
                </p>

            </div>




            <div>

                <h3>
                ⭐ ${stats.rating || 0}
                </h3>

                <p>
                Rating
                </p>

            </div>




            <div>

                <h3>
                ${stats.totalSales || 0}
                </h3>

                <p>
                Sales
                </p>

            </div>


            `;


        }








        // ================= ACTION BUTTON =================


        const actions =
        document.getElementById(
            "seller-actions"
        );


        if(actions){


            actions.innerHTML = `


            <button

            class="chat-button"

            onclick="chatSeller(
            '${seller._id}',
            '${seller.name}'
            )">


            💬 Chat With Seller


            </button>


            `;


        }









        // ================= PRODUCTS =================



        const container =
        document.getElementById(
            "seller-products"
        );



        container.innerHTML = "";




        if(sellerProducts.length===0){


            container.innerHTML =
            "<p>No products listed yet.</p>";


        }





        sellerProducts.forEach(product=>{



            container.innerHTML += `


            <div class="card"

            onclick="openProduct('${product._id}')">


                <div class="image-box">


                    <img src="${
                    
                    product.image ||

                    'https://via.placeholder.com/300'

                    }">


                </div>




                <div class="card-content">


                    <h3>
                    ${product.name}
                    </h3>



                    <div class="price">

                    MK ${product.price}

                    </div>



                    <p>

                    📚 ${
                    product.category ||
                    "General"
                    }

                    </p>



                </div>


            </div>



            `;


        });





        showRatingBox(sellerId);

        loadReviews(sellerId);



    }


    catch(error){

        console.log(error);

    }


}









// ================= CHAT =================


function chatSeller(id,name){


    window.location.href =

    `chat.html?seller=${id}&name=${encodeURIComponent(name)}`;


}









// ================= RATING =================


function showRatingBox(sellerId){


const box =
document.getElementById(
"rating-box"
);



if(!box)return;



box.innerHTML = `


<h2>
Rate Seller
</h2>



<div class="stars">

<span onclick="selectStar(1)">☆</span>
<span onclick="selectStar(2)">☆</span>
<span onclick="selectStar(3)">☆</span>
<span onclick="selectStar(4)">☆</span>
<span onclick="selectStar(5)">☆</span>

</div>




<textarea

id="reviewComment"

placeholder="Write your experience...">

</textarea>




<button

onclick="submitReview('${sellerId}')">

Submit Review

</button>



`;

}



function selectStar(number){


selectedRating = number;



document.querySelectorAll(
".stars span"
)
.forEach((star,index)=>{


star.innerHTML =

index < number

?

"★"

:

"☆";


});


}









async function submitReview(sellerId){


const user =

JSON.parse(
localStorage.getItem("user")
);



if(!user){

alert("Please login first");

return;

}




if(selectedRating===0){

alert("Select stars first");

return;

}



await fetch(

`${API_URL}/reviews`,

{


method:"POST",


headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

seller:sellerId,

buyer:user.id,

rating:selectedRating,

comment:
document.getElementById(
"reviewComment"
).value

})


}


);



alert(
"Review submitted"
);


location.reload();


}









// ================= REVIEWS =================


async function loadReviews(id){


try{


const response =

await fetch(

`${API_URL}/reviews/${id}`

);



const reviews =

await response.json();





const box =

document.getElementById(
"reviews-list"
);



box.innerHTML="";





if(reviews.length===0){


box.innerHTML =
"<p>No reviews yet</p>";

return;


}





reviews.forEach(review=>{


box.innerHTML += `



<div class="rating-card">


<h3>

${review.buyer.name}

</h3>



<p class="review-stars">

${"★".repeat(review.rating)}

${"☆".repeat(5-review.rating)}

</p>



<p>

${review.comment || ""}

</p>


</div>


`;


});




}

catch(error){

console.log(error);

}


}








function openProduct(id){


window.location.href =

`product.html?id=${id}`;


}





loadSeller();