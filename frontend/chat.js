const API_URL = "http://192.168.1.149:5000";


// ================= SOCKET =================

const socket = io(API_URL);


// ================= USER =================

const user = JSON.parse(
    localStorage.getItem("user")
);

const token =
localStorage.getItem("token");


// ================= URL PARAMETERS =================

const params =
new URLSearchParams(
    window.location.search
);


const receiver =
params.get("seller");


const product =
params.get("product");


const sellerName =
params.get("name");


// PRODUCT DATA

const productName =
params.get("productName");


const productPrice =
params.get("price");


const productImage =
params.get("image");


// ================= ELEMENTS =================

const messagesBox =
document.getElementById("chat-messages");


const title =
document.getElementById("seller-name");


const status =
document.getElementById("online-status");


const typingStatus =
document.getElementById("typing-status");


const messageInput =
document.getElementById("message");


const fileInput =
document.getElementById("file");


const previewContainer =
document.getElementById("preview-container");


const previewImage =
document.getElementById("preview-image");


const removePreview =
document.getElementById("remove-preview");


// ================= LOGIN CHECK =================

if(!user || !token){

    alert("Please login first");

    window.location.href="login.html";

}


// ================= JOIN SOCKET =================

socket.emit(
    "join",
    user.id
);


// ================= PRODUCT CARD =================

function showProductCard(){

    if(!productName){
        return;
    }

    const header =
    document.querySelector(".chat-header");

    if(!header){
        return;
    }

    const card =
    document.createElement("div");

    card.className =
    "chat-product-card";

    card.innerHTML = `

        <img
        src="${
            productImage ||
            'https://via.placeholder.com/80'
        }">

        <div>

            <h4>
            ${productName}
            </h4>

            <p>
            MK ${productPrice}
            </p>

            <button onclick="viewProduct()">
            View Product
            </button>

        </div>

    `;

    header.after(card);

}


function viewProduct(){

    if(product){

        window.location.href =
        `product.html?id=${product}`;

    }

}

showProductCard();


// ================= SHOW SELLER NAME =================

if(title && sellerName){

    title.innerHTML =
    `💬 ${sellerName}`;

}


// ================= EMOJI =================

const emojiBtn =
document.getElementById("emoji-btn");


const emojiPicker =
document.getElementById("emoji-picker");


if(emojiBtn && emojiPicker){

    emojiBtn.addEventListener(
        "click",
        (e)=>{

            e.stopPropagation();

            emojiPicker.style.display =
            emojiPicker.style.display === "block"
            ?
            "none"
            :
            "block";

        }
    );

    document.addEventListener(
        "click",
        (e)=>{

            if(
                !emojiPicker.contains(e.target)
                &&
                !emojiBtn.contains(e.target)
            ){

                emojiPicker.style.display="none";

            }

        }
    );

    document
    .querySelectorAll("#emoji-picker span")
    .forEach(emoji=>{

        emoji.addEventListener(
            "click",
            ()=>{

                messageInput.value +=
                emoji.textContent;

                messageInput.focus();

            }
        );

    });

}


// ================= IMAGE PREVIEW =================

if(fileInput){

    fileInput.addEventListener(
        "change",
        ()=>{

            if(fileInput.files.length===0){

                previewContainer.style.display="none";

                return;

            }

            const file =
            fileInput.files[0];

            if(file.type.startsWith("image/")){

                const reader =
                new FileReader();

                reader.onload=function(e){

                    previewImage.src=
                    e.target.result;

                    previewContainer.style.display="block";

                };

                reader.readAsDataURL(file);

            }

            else{

                previewContainer.style.display="none";

            }

        }
    );

}


// ================= REMOVE PREVIEW =================

if(removePreview){

    removePreview.addEventListener(
        "click",
        ()=>{

            fileInput.value="";

            previewImage.src="";

            previewContainer.style.display="none";

        }
    );

}


// ================= DISPLAY MESSAGE =================
function displayMessage(msg){

    if(!messagesBox) return;

    const senderId =
    msg.sender._id || msg.sender;

    const mine =
    senderId.toString() === user.id.toString();

    let ticks="";

    if(mine){

        if(msg.read){

            ticks =
            `<span class="read-ticks">✓✓</span>`;

        }
        else if(msg.delivered){

            ticks =
            `<span class="delivered-ticks">✓✓</span>`;

        }
        else{

            ticks =
            `<span class="sent-tick">✓</span>`;

        }

    }

    // ================= OFFER CARD =================

    let offerHTML="";

    if(msg.offer && msg.offer.amount){

        offerHTML=`

        <div class="offer-message">

            <h3>💰 Offer</h3>

            <p>
                Amount:
                <strong>MK ${msg.offer.amount}</strong>
            </p>

            <p>
                Status:
                <strong>${msg.offer.status}</strong>
            </p>

            ${
            !mine && msg.offer.status==="pending"
            ?
            `

            <div class="offer-actions">

                <button onclick="acceptOffer('${msg._id}')">
                    ✅ Accept
                </button>

                <button onclick="rejectOffer('${msg._id}')">
                    ❌ Reject
                </button>

                <button onclick="counterOffer('${msg._id}')">
                    🔄 Counter
                </button>

            </div>

            `
            :
            ""
            }

        </div>

        `;

    }

    messagesBox.innerHTML += `

    <div class="message-row ${mine ? "mine":"theirs"}">

        <div class="message-bubble">

            ${offerHTML}

            ${
            msg.message
            ?
            `<p>${msg.message}</p>`
            :
            ""
            }

            ${
            msg.image
            ?
            `
            <div class="attachment-image">
                <img
                src="${API_URL}${msg.image}"
                width="200">
            </div>
            `
            :
            ""
            }

            ${
            msg.file
            ?
            `
            <div class="attachment">
                <a
                href="${API_URL}${msg.file}"
                target="_blank">
                📎 ${msg.fileName}
                </a>
            </div>
            `
            :
            ""
            }

            <span class="message-time">

                ${
                new Date(
                    msg.createdAt
                ).toLocaleTimeString([],{
                    hour:"2-digit",
                    minute:"2-digit"
                })
                }

                ${ticks}

            </span>

        </div>

    </div>

    `;

}



// ================= SCROLL =================

function scrollToBottom(){

    if(messagesBox){

        messagesBox.scrollTop =
        messagesBox.scrollHeight;

    }

}



// ================= LOAD MESSAGES =================

async function loadMessages(){

    try{

        const response =
        await fetch(
            `${API_URL}/messages/${receiver}`,
            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

        const messages =
        await response.json();

        messagesBox.innerHTML="";

        messages.forEach(msg=>{

            displayMessage(msg);

        });

        scrollToBottom();

    }

    catch(error){

        console.log(error);

    }

}



// ================= UPLOAD FILE =================

async function uploadFile(){

    if(!fileInput || fileInput.files.length===0){

        return null;

    }

    const formData =
    new FormData();

    formData.append(
        "file",
        fileInput.files[0]
    );

    try{

        const response =
        await fetch(
            `${API_URL}/messages/upload`,
            {

                method:"POST",

                headers:{
                    Authorization:
                    `Bearer ${token}`
                },

                body:formData

            }
        );

        const data =
        await response.json();

        if(!response.ok){

            alert(data.message);

            return null;

        }

        return{

            image:data.image,

            file:data.file,

            fileName:data.fileName

        };

    }

    catch(error){

        console.log(error);

        return null;

    }

}



// ================= SEND MESSAGE =================
async function sendMessage(){

    const message =
    messageInput.value.trim();

    let uploadedFile = null;

    if(fileInput && fileInput.files.length > 0){

        uploadedFile =
        await uploadFile();

        fileInput.value = "";

        if(previewContainer){
            previewContainer.style.display = "none";
        }

    }

    if(message === "" && !uploadedFile){

        return;

    }

    try{

        const response =
        await fetch(

            `${API_URL}/messages`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:`Bearer ${token}`

                },

                body:JSON.stringify({

                    receiver,

                    product,

                    message: message,

                    image: uploadedFile ? uploadedFile.image : "",

                    file: uploadedFile ? uploadedFile.file : "",

                    fileName: uploadedFile ? uploadedFile.fileName : ""

                })

            }

        );

        const data =
        await response.json();

        if(!response.ok){

            alert(data.message);

            return;

        }

        messageInput.value = "";

        if(previewImage){
            previewImage.src = "";
        }

        loadMessages();

    }

    catch(error){

        console.log(error);

    }

}



// ================= OFFER SYSTEM =================

function openOffer(){

    const box =
    document.getElementById("offer-box");

    if(box){

        box.style.display="block";

    }

}



function closeOffer(){

    const box =
    document.getElementById("offer-box");

    if(box){

        box.style.display="none";

    }

}



async function sendOffer(){

    const amount =
    document.getElementById("offer-price").value;

    if(!amount){

        alert("Enter offer amount");

        return;

    }

    try{

        const response =
        await fetch(

            `${API_URL}/messages`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    Authorization:`Bearer ${token}`

                },

                body:JSON.stringify({

                    receiver,

                    product,

                    message:"💰 Offer sent",

                    offer:{

                        amount:Number(amount),

                        status:"pending"

                    }

                })

            }

        );

        const data =
        await response.json();

        if(!response.ok){

            alert(data.message);

            return;

        }

        document.getElementById("offer-price").value="";

        closeOffer();

        loadMessages();

    }

    catch(error){

        console.log(error);

    }

}



// ================= ACCEPT / REJECT / COUNTER =================

async function acceptOffer(id){

    await updateOffer(id,"accept");

}



async function rejectOffer(id){

    await updateOffer(id,"reject");

}



async function counterOffer(id){

    const amount =
    prompt("Enter counter amount");

    if(!amount){

        return;

    }

    const response =
    await fetch(

        `${API_URL}/messages/offer/counter/${id}`,

        {

            method:"PUT",

            headers:{

                "Content-Type":"application/json",

                Authorization:`Bearer ${token}`

            },

            body:JSON.stringify({

                amount:Number(amount)

            })

        }

    );

    const data =
    await response.json();

    if(!response.ok){

        alert(data.message);

        return;

    }

    loadMessages();

}



async function updateOffer(id,type){

    const response =
    await fetch(

        `${API_URL}/messages/offer/${type}/${id}`,

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

    loadMessages();

}



// ================= SOCKET EVENTS =================
// ================= SOCKET EVENTS =================

socket.on(
    "newMessage",
    () => {
        loadMessages();
    }
);

socket.on(
    "offerUpdated",
    () => {
        loadMessages();
    }
);

socket.on(
    "messageDelivered",
    () => {
        loadMessages();
    }
);

socket.on(
    "messagesRead",
    () => {
        loadMessages();
    }
);


// ================= ONLINE STATUS =================

socket.on(
    "onlineUsers",
    (users) => {

        if(!status){
            return;
        }

        if(users.includes(receiver)){

            status.innerHTML = "🟢 Online";

        }else{

            status.innerHTML = "⚪ Offline";

        }

    }
);


// ================= TYPING =================

if(messageInput){

    let typingTimer;

    messageInput.addEventListener(
        "input",
        () => {

            socket.emit(
                "typing",
                {
                    sender:user.id,
                    receiver
                }
            );

            clearTimeout(typingTimer);

            typingTimer = setTimeout(()=>{

                socket.emit(
                    "stopTyping",
                    {
                        receiver
                    }
                );

            },1000);

        }
    );

}


socket.on(
    "typing",
    () => {

        if(typingStatus){

            typingStatus.innerHTML = "Typing...";

        }

    }
);


socket.on(
    "stopTyping",
    () => {

        if(typingStatus){

            typingStatus.innerHTML = "";

        }

    }
);


// ================= MARK READ =================

async function markMessagesRead(){

    try{

        await fetch(

            `${API_URL}/messages/read/${receiver}`,

            {

                method:"PUT",

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );

    }

    catch(error){

        console.log(error);

    }

}


// ================= SEND ON ENTER =================

if(messageInput){

    messageInput.addEventListener("keypress",(e)=>{

        if(e.key==="Enter" && !e.shiftKey){

            e.preventDefault();

            sendMessage();

        }

    });

}


// ================= START CHAT =================

async function startChat(){

    await loadMessages();

    await markMessagesRead();

    scrollToBottom();

}

startChat();


// ================= AUTO REFRESH =================

setInterval(()=>{

    loadMessages();

},3000);