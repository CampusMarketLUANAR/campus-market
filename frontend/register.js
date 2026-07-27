async function register(){


    const name =
    document.getElementById("name").value.trim();


    const email =
    document.getElementById("email").value.trim();


    const phone =
    document.getElementById("phone").value.trim();


    const password =
    document.getElementById("password").value.trim();



    const button =
    document.querySelector(".auth-btn");


    const message =
    document.getElementById("register-message");




    if(!name || !email || !phone || !password){


        message.textContent =
        "⚠️ Please fill in all fields";


        return;

    }




    button.disabled = true;


    button.textContent =
    "Creating account...";




    try{


        const response =
        await fetch(

            "https://campus-market-92ie.onrender.com/auth/register",

            {

                method:"POST",


                headers:{


                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({

                    name,

                    email,

                    phone,

                    password

                })

            }

        );





        const data =
        await response.json();





        if(!response.ok){


            message.textContent =
            "❌ " + data.message;


            button.disabled = false;


            button.textContent =
            "Create Account";


            return;


        }






        message.textContent =
        "✅ Account created successfully!";






        setTimeout(()=>{


            window.location.href =
            "login.html";


        },1000);





    }


    catch(error){



        console.error(error);



        message.textContent =
        "⚠️ Server error. Try again.";



        button.disabled = false;


        button.textContent =
        "Create Account";


    }


}






// ================= PASSWORD TOGGLE =================



const togglePassword =
document.getElementById("togglePassword");



if(togglePassword){


    togglePassword.addEventListener(
        "click",
        ()=>{


            const password =
            document.getElementById("password");



            if(password.type === "password"){


                password.type =
                "text";


                togglePassword.textContent =
                "🙈";


            }

            else{


                password.type =
                "password";


                togglePassword.textContent =
                "👁";


            }


        }
    );


}