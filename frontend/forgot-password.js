const API_URL = "http://localhost:5000";


const emailInput = document.getElementById("email");
const resetBtn = document.getElementById("resetBtn");
const message = document.getElementById("message");



resetBtn.addEventListener("click", async()=>{


    const email = emailInput.value.trim();



    if(!email){

        message.innerText = "Please enter your email";

        return;

    }




    try{


        const response = await fetch(
            `${API_URL}/auth/forgot-password`,
            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    email

                })

            }
        );




        const data = await response.json();



        message.innerText = data.message;




    }catch(error){


        console.log(error);


        message.innerText =
        "Something went wrong";


    }



});