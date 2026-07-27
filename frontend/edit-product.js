const API_URL = "https://campus-market-92ie.onrender.com";


// ================= GET PRODUCT ID =================

const params = new URLSearchParams(
    window.location.search
);

const productId = params.get("id");


const token = localStorage.getItem("token");



// ================= LOAD PRODUCT =================

async function loadProduct(){

    if(!productId){

        alert("Product ID missing");
        return;

    }


    try{

        const response = await fetch(
            `${API_URL}/products/${productId}`
        );


        const product = await response.json();



        document.getElementById("name").value =
        product.name;


        document.getElementById("price").value =
        product.price;


        document.getElementById("category").value =
        product.category;


        document.getElementById("description").value =
        product.description;


        document.getElementById("phone").value =
        product.phone;



        if(product.image){

            document.getElementById("current-image").src =
            product.image;

        }


    }
    catch(error){

        console.log(error);

        alert(
            "Failed to load product"
        );

    }

}




// ================= UPDATE PRODUCT =================

document
.getElementById("edit-product-form")
.addEventListener(
"submit",
async function(e){


    e.preventDefault();



    const formData = new FormData();



    formData.append(
        "name",
        document.getElementById("name").value
    );


    formData.append(
        "price",
        document.getElementById("price").value
    );


    formData.append(
        "category",
        document.getElementById("category").value
    );


    formData.append(
        "description",
        document.getElementById("description").value
    );


    formData.append(
        "phone",
        document.getElementById("phone").value
    );



    const image =
    document.getElementById("image").files[0];


    if(image){

        formData.append(
            "image",
            image
        );

    }




    try{


        const response =
        await fetch(
            `${API_URL}/products/${productId}`,
            {

                method:"PUT",

                headers:{

                    Authorization:
                    `Bearer ${token}`

                },

                body:formData

            }
        );



        const data =
        await response.json();



        if(response.ok){


            document.getElementById("message")
            .innerHTML =
            "Product updated successfully ✅";



            setTimeout(()=>{

                window.location.href =
                "my-products.html";

            },1500);


        }
        else{


            document.getElementById("message")
            .innerHTML =
            data.message ||
            "Update failed";


        }



    }
    catch(error){

        console.log(error);

        document.getElementById("message")
        .innerHTML =
        "Server error";


    }



});





loadProduct();