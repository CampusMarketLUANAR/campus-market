const API_URL = "https://campus-market-92ie.onrender.com";

const form = document.getElementById("productForm");

const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");
const previewContainer = document.getElementById("preview-container");
const submitBtn = document.getElementById("submitBtn");
const uploadStatus = document.getElementById("upload-status");

const uploadBox =
document.querySelector(".upload-box");

const uploadText =
uploadBox.querySelector("p");


// ================= IMAGE PREVIEW =================

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if(!file){

        preview.src = "";

        previewContainer.style.display = "none";

        uploadBox.style.display = "block";

        uploadText.innerHTML =
        "📷 Drag & Drop an image here<br><br>or Click to Browse";

        return;

    }

    uploadText.innerHTML =
    `✅ ${file.name}`;

    const reader = new FileReader();

    reader.onload = function(e){

        preview.src = e.target.result;

        previewContainer.style.display = "block";

        previewContainer.style.opacity = "0";

        previewContainer.style.transition =
        "opacity .4s ease";

        uploadBox.style.display = "none";

        setTimeout(()=>{

            previewContainer.style.opacity = "1";

        },50);

    };

    reader.readAsDataURL(file);

});


// ================= SUBMIT =================

form.addEventListener("submit", async(e)=>{

    e.preventDefault();

    const token =
    localStorage.getItem("token");

    if(!token){

        alert("Please login first.");

        window.location.href =
        "login.html";

        return;

    }

    submitBtn.disabled = true;

    submitBtn.textContent =
    "Uploading...";

    uploadStatus.textContent =
    "📤 Uploading image...";

    const formData =
    new FormData();

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

    formData.append(
        "image",
        imageInput.files[0]
    );

    try{

        const response =
        await fetch(API_URL,{

            method:"POST",

            headers:{

                Authorization:
                "Bearer " + token

            },

            body:formData

        });

        uploadStatus.textContent =
        "💾 Saving product...";

        const data =
        await response.json();

        if(!response.ok){

            submitBtn.disabled = false;

            submitBtn.textContent =
            "🚀 Post Item";

            uploadStatus.textContent = "";

            alert(data.message);

            return;

        }

        uploadStatus.textContent =
        "✅ Product posted successfully!";

        submitBtn.textContent =
        "✅ Posted";

        setTimeout(()=>{

            form.reset();

            preview.src = "";

            previewContainer.style.display =
            "none";

            uploadBox.style.display =
            "block";

            uploadText.innerHTML =
            "📷 Drag & Drop an image here<br><br>or Click to Browse";

            submitBtn.disabled = false;

            submitBtn.textContent =
            "🚀 Post Item";

            window.location.href =
            "index.html";

        },1500);

    }

    catch(error){

        console.error(error);

        submitBtn.disabled = false;

        submitBtn.textContent =
        "🚀 Post Item";

        uploadStatus.textContent = "";

        alert("Something went wrong.");

    }

});