const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();


const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const reviewRoutes = require("./routes/reviews");
const messageRoutes = require("./routes/messages");
const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/users");


const app = express();


const server = http.createServer(app);



const io = new Server(server, {

    cors: {

        origin: "*",

        methods: [
            "GET",
            "POST"
        ]

    }

});



// MAKE SOCKET AVAILABLE TO ROUTES

app.set(
    "io",
    io
);



app.use(
    cors()
);


app.use(
    express.json()
);



// MAKE UPLOADED FILES ACCESSIBLE

app.use(
    "/uploads",
    express.static("uploads")
);



mongoose.connect(
    process.env.MONGO_URI
)

.then(()=>{

    console.log(
        "✅ MongoDB Connected"
    );

})

.catch((error)=>{

    console.log(
        "❌ MongoDB Connection Error:",
        error
    );

});






app.get(
    "/",
    (req,res)=>{

        res.send(
            "🚀 Campus Market Backend is running!"
        );

    }
);







app.use(
    "/products",
    productRoutes
);


app.use(
    "/auth",
    authRoutes
);


app.use(
    "/reviews",
    reviewRoutes
);


app.use(
    "/messages",
    messageRoutes
);


app.use(
    "/transactions",
    transactionRoutes
);


// SELLER PROFILE ROUTE

app.use(
    "/users",
    userRoutes
);





// ================= SOCKET.IO =================


let onlineUsers = {};





io.on(
    "connection",
    (socket)=>{


        console.log(
            "🟢 User Connected:",
            socket.id
        );



        // USER JOINS ROOM

        socket.on(
            "join",
            (userId)=>{


                socket.join(
                    userId
                );


                onlineUsers[userId] =
                socket.id;



                io.emit(
                    "onlineUsers",
                    Object.keys(
                        onlineUsers
                    )
                );



                console.log(

                    `User ${userId} is online`

                );


            }

        );




        // START TYPING

        socket.on(
            "typing",
            (data)=>{

                socket
                .to(data.receiver)
                .emit(
                    "typing",
                    {
                        user:data.sender
                    }
                );

            }

        );







        // STOP TYPING

        socket.on(
            "stopTyping",
            (data)=>{

                socket
                .to(data.receiver)
                .emit(
                    "stopTyping"
                );

            }

        );







        // DISCONNECT

        socket.on(
            "disconnect",
            ()=>{


                let offlineUser = null;



                for(
                    let userId in onlineUsers
                ){

                    if(
                        onlineUsers[userId]
                        ===
                        socket.id
                    ){

                        offlineUser =
                        userId;


                        delete onlineUsers[userId];

                    }

                }





                if(offlineUser){


                    io.emit(

                        "offlineUser",

                        offlineUser

                    );

                }





                io.emit(

                    "onlineUsers",

                    Object.keys(
                        onlineUsers
                    )

                );







                console.log(

                    "🔴 User Disconnected:",

                    socket.id

                );


            }

        );



    }

);





// =============================================



const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(`🚀 Server running on port ${PORT}`);

});