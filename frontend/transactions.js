const API_URL = "http://localhost:5000";


// ================= SOCKET =================

const socket = io(API_URL);


// ================= USER =================

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user")
);


if(!token || !user){

    alert("Please login first");

    window.location.href = "login.html";

}


socket.emit(
    "join",
    user.id
);



// ================= ELEMENTS =================

const container =
document.getElementById("transactions-container");


const loading =
document.getElementById("loading");


const emptyState =
document.getElementById("empty-state");


const tabs =
document.querySelectorAll(".tab");



let currentTab = "all";

let transactions = [];




// ================= LOAD TRANSACTIONS =================

async function loadTransactions(){

    try{


        loading.style.display = "block";

        emptyState.style.display = "none";

        container.innerHTML = "";



        const response =
        await fetch(

            `${API_URL}/transactions`,

            {

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );



        const data =
        await response.json();



        console.log(
            "TRANSACTION RESPONSE:",
            JSON.stringify(data,null,2)
        );



        loading.style.display = "none";



        if(!response.ok){

            alert(data.message);

            return;

        }



        transactions =
        data.transactions;



        renderTransactions();



    }

    catch(error){


        loading.style.display = "none";

        console.log(error);


    }

}




// ================= RENDER =================

function renderTransactions(){


    container.innerHTML = "";


    let filtered =
    transactions;



    if(currentTab === "buying"){


        filtered =
        transactions.filter(t=>

            t.buyer &&
            t.buyer._id === user.id

        );


    }



    if(currentTab === "selling"){


        filtered =
        transactions.filter(t=>

            t.seller &&
            t.seller._id === user.id

        );


    }



    if(filtered.length === 0){


        emptyState.style.display = "block";


        return;


    }



    emptyState.style.display = "none";



    filtered.forEach(transaction=>{


        renderCard(transaction);


    });


}
// ================= RENDER CARD =================

function renderCard(transaction){


    const product =
    transaction.product || {};



    const isBuyer =
    transaction.buyer &&
    transaction.buyer._id === user.id;



    const otherUser =
    isBuyer
    ?
    transaction.seller
    :
    transaction.buyer;



    let actionButtons = "";



    // ================= RESERVED =================

    if(transaction.status === "reserved"){


        if(isBuyer){


            actionButtons += `

            <button
            class="complete-btn"
            onclick="markPaid('${transaction._id}')">

                💰 Mark Paid

            </button>

            `;


        }



        actionButtons += `

        <button
        class="cancel-btn"
        onclick="cancelTransaction('${transaction._id}')">

            ❌ Cancel

        </button>

        `;


    }





    // ================= PAID =================

    if(transaction.status === "paid"){


        if(!isBuyer){


            actionButtons += `

            <button
            class="complete-btn"
            onclick="markCollected('${transaction._id}')">

                📦 Mark Collected

            </button>

            `;


        }


    }





    // ================= COLLECTED =================

    if(transaction.status === "collected"){


        actionButtons += `

        <button
        class="complete-btn"
        onclick="completeTransaction('${transaction._id}')">

            ✅ Complete

        </button>

        `;


    }






    container.innerHTML += `


    <div class="transaction-card">


        <img

            src="${
                product.image ||
                "https://via.placeholder.com/500x300"
            }"

            alt="${product.name || "Product"}"

        >



        <div class="transaction-body">



            <h2>

                ${product.name || "Product"}

            </h2>



            <div class="price">

                MK ${transaction.price}

            </div>




            <p>

                <strong>

                ${isBuyer ? "Seller" : "Buyer"}:

                </strong>


                ${otherUser ? otherUser.name : "Unknown"}


            </p>





            <p>

                <strong>Status:</strong>


                <span class="badge ${transaction.status}">

                    ${transaction.status}

                </span>


            </p>





            <div class="card-actions">


                ${actionButtons}


            </div>



        </div>



    </div>



    `;


}





// ================= MARK PAID =================

async function markPaid(id){


    try{


        const response =
        await fetch(

            `${API_URL}/transactions/paid/${id}`,

            {

                method:"PUT",

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );



        const data =
        await response.json();



        if(!response.ok){


            alert(data.message);


            return;


        }



        alert(
            "Payment confirmed"
        );



        loadTransactions();


    }


    catch(error){


        console.log(error);


    }


}
// ================= MARK COLLECTED =================

async function markCollected(id){


    try{


        const response =
        await fetch(

            `${API_URL}/transactions/collected/${id}`,

            {

                method:"PUT",

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );



        const data =
        await response.json();



        if(!response.ok){


            alert(data.message);


            return;


        }



        alert(
            "Product collected successfully"
        );



        loadTransactions();



    }


    catch(error){


        console.log(error);


    }


}







// ================= COMPLETE TRANSACTION =================

async function completeTransaction(id){


    try{


        const response =
        await fetch(

            `${API_URL}/transactions/complete/${id}`,

            {

                method:"PUT",

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );



        const data =
        await response.json();



        if(!response.ok){


            alert(data.message);


            return;


        }



        alert(
            "Transaction completed successfully"
        );



        loadTransactions();



    }


    catch(error){


        console.log(error);


    }


}







// ================= CANCEL TRANSACTION =================

async function cancelTransaction(id){


    const confirmCancel =
    confirm(
        "Are you sure you want to cancel this transaction?"
    );



    if(!confirmCancel){

        return;

    }




    try{


        const response =
        await fetch(

            `${API_URL}/transactions/cancel/${id}`,

            {

                method:"PUT",

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );



        const data =
        await response.json();



        if(!response.ok){


            alert(data.message);


            return;


        }



        alert(
            "Transaction cancelled"
        );



        loadTransactions();



    }


    catch(error){


        console.log(error);


    }


}







// ================= SOCKET UPDATES =================


socket.on(

    "transactionUpdated",

    (updatedTransaction)=>{


        const index =
        transactions.findIndex(

            t=>t._id === updatedTransaction._id

        );



        if(index !== -1){


            transactions[index] =
            updatedTransaction;


        }



        renderTransactions();


    }

);







// ================= TAB EVENTS =================


tabs.forEach(tab=>{


    tab.addEventListener(

        "click",

        function(){



            currentTab =
            this.dataset.tab;



            tabs.forEach(btn=>{


                btn.classList.remove(
                    "active"
                );


            });



            this.classList.add(
                "active"
            );



            renderTransactions();



        }

    );


});






// ================= START =================

loadTransactions();