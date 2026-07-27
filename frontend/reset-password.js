const API_URL = "http://localhost:5000";

const params = new URLSearchParams(window.location.search);

const token = params.get("token");

const passwordInput = document.getElementById("password");
const resetBtn = document.getElementById("resetBtn");
const message = document.getElementById("message");



resetBtn.addEventListener("click", async()=>{

    const password = passwordInput.value.trim();

    if(!password){

        message.innerText = "Please enter a new password";

        return;

    }

    try{

        const response = await fetch(

            `${API_URL}/auth/reset-password`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    token,

                    password

                })

            }

        );

        const data = await response.json();

        message.innerText = data.message;

        if(response.ok){

            setTimeout(()=>{

                window.location.href = "login.html";

            },2000);

        }

    }

    catch(error){

        console.log(error);

        message.innerText = "Something went wrong";

    }

});