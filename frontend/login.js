async function login(){


    const email =
    document.getElementById("email").value.trim();


    const password =
    document.getElementById("password").value.trim();


    const button =
    document.querySelector(".auth-btn");


    const message =
    document.getElementById("login-message");



    if(!email || !password){

        message.textContent =
        "⚠️ Please fill in all fields";

        return;

    }



    button.disabled = true;

    button.textContent =
    "Logging in...";



    try{


        const response =
        await fetch(
            "http://192.168.1.149:5000/auth/login",
            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify({

                    email,

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
            "Login";


            return;

        }



        message.textContent =
        "✅ Login successful!";



        localStorage.setItem(
            "token",
            data.token
        );



        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );



        setTimeout(()=>{


            window.location.href =
            "index.html";


        },800);



    }


    catch(error){


        console.error(error);


        message.textContent =
        "⚠️ Server error. Try again.";


        button.disabled = false;


        button.textContent =
        "Login";


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