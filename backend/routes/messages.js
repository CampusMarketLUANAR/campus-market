const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");

const auth = require("../middleware/auth");

const multer = require("multer");
const path = require("path");



// ================= FILE UPLOAD CONFIG =================

const storage = multer.diskStorage({

    destination:function(req,file,cb){

        cb(null,"uploads/");

    },


    filename:function(req,file,cb){

        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );

    }

});



const upload = multer({

    storage:storage

});






// ================= UPLOAD FILE =================

router.post(
    "/upload",
    auth,
    upload.single("file"),
    async(req,res)=>{

        try{


            if(!req.file){

                return res.status(400).json({

                    success:false,

                    message:"No file uploaded"

                });

            }




            const isImage =
            req.file.mimetype.startsWith("image/");




            res.json({

                success:true,

                message:"File uploaded successfully",


                image:isImage
                ?
                `/uploads/${req.file.filename}`
                :
                "",




                file:!isImage
                ?
                `/uploads/${req.file.filename}`
                :
                "",




                fileName:req.file.originalname


            });


        }


        catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }


    }

);







// ================= SEND MESSAGE =================

router.post("/", auth, async(req,res)=>{

    try{


        const {

            receiver,

            product,

            message,

            image,

            file,

            fileName,

            offer


        } = req.body;





        const newMessage = new Message({


            sender:req.user.id,


            receiver,


            product,


            message,


            image,


            file,


            fileName,


            offer,


            delivered:false,


            read:false


        });






        await newMessage.save();






        const io = req.app.get("io");



        if(io){


            io.to(receiver).emit(

                "newMessage",

                newMessage

            );



            io.to(receiver).emit(

                "newNotification",

                {

                    title:"New Message",

                    message:
                    offer
                    ?
                    "💰 New offer received"
                    :
                    "You received a new message",


                    sender:req.user.id

                }

            );



            newMessage.delivered = true;


            await newMessage.save();



            io.to(req.user.id).emit(

                "messageDelivered",

                {

                    messageId:newMessage._id

                }

            );


        }






        res.status(201).json({

            success:true,

            message:"Message sent successfully",

            data:newMessage

        });



    }


    catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});
// ================= ACCEPT OFFER =================

router.put(
    "/offer/accept/:messageId",
    auth,
    async(req,res)=>{

        try{


            const offerMessage =
            await Message.findById(
                req.params.messageId
            );



            if(!offerMessage){

                return res.status(404).json({

                    success:false,

                    message:"Offer not found"

                });

            }





            // ONLY RECEIVER CAN ACCEPT

            if(

                offerMessage.receiver.toString()

                !==

                req.user.id.toString()

            ){

                return res.status(403).json({

                    success:false,

                    message:"Not allowed"

                });

            }





            offerMessage.offer.status =
            "accepted";



            await offerMessage.save();








            // ================= RESERVE PRODUCT =================


            let reservedProduct = null;



            if(offerMessage.product){



                reservedProduct =

                await Product.findByIdAndUpdate(


                    offerMessage.product,


                    {


                        status:"reserved",


                        reservedBy:
                        offerMessage.sender,


                        agreedPrice:
                        offerMessage.offer.amount


                    },


                    {

                        new:true

                    }


                );



            }








            // ================= CREATE TRANSACTION =================


            if(reservedProduct){



                const existingTransaction =

                await Transaction.findOne({

                    product:
                    reservedProduct._id,


                    buyer:
                    offerMessage.sender,


                    seller:
                    offerMessage.receiver

                });






                if(!existingTransaction){



                    const transaction =

                    new Transaction({



                        product:
                        reservedProduct._id,



                        buyer:
                        offerMessage.sender,



                        seller:
                        offerMessage.receiver,



                        price:
                        offerMessage.offer.amount,



                        status:
                        "reserved"



                    });





                    await transaction.save();



                }



            }









            const io =
            req.app.get("io");





            if(io){



                io.to(

                    offerMessage.sender.toString()

                )

                .emit(


                    "offerUpdated",


                    {


                        message:

                        "✅ Offer accepted. Product reserved",


                        status:"accepted"


                    }


                );





                io.to(

                    offerMessage.receiver.toString()

                )

                .emit(


                    "offerUpdated",


                    {


                        message:

                        "✅ Offer accepted. Product reserved",


                        status:"accepted"


                    }


                );



            }








            res.json({

                success:true,

                message:

                "Offer accepted and transaction created",

                data:offerMessage


            });





        }


        catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }


    }

);







// ================= REJECT OFFER =================


router.put(
    "/offer/reject/:messageId",
    auth,
    async(req,res)=>{


        try{


            const offerMessage =

            await Message.findById(

                req.params.messageId

            );




            if(!offerMessage){


                return res.status(404).json({

                    success:false,

                    message:"Offer not found"

                });


            }





            if(

                offerMessage.receiver.toString()

                !==

                req.user.id.toString()

            ){


                return res.status(403).json({

                    success:false,

                    message:"Not allowed"

                });


            }





            offerMessage.offer.status =

            "rejected";




            await offerMessage.save();





            const io =

            req.app.get("io");





            if(io){


                io.to(

                    offerMessage.sender.toString()

                )

                .emit(

                    "offerUpdated",

                    {

                        message:
                        "❌ Offer rejected",

                        status:"rejected"

                    }

                );


            }





            res.json({

                success:true,

                message:"Offer rejected",

                data:offerMessage


            });



        }


        catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }


    }

);
// ================= COUNTER OFFER =================

router.put(
    "/offer/counter/:messageId",
    auth,
    async(req,res)=>{

        try{


            const {

                amount

            } = req.body;




            if(!amount){


                return res.status(400).json({

                    success:false,

                    message:"Enter counter amount"

                });


            }





            const oldOffer =

            await Message.findById(

                req.params.messageId

            );





            if(!oldOffer){


                return res.status(404).json({

                    success:false,

                    message:"Offer not found"

                });


            }





            // ONLY RECEIVER CAN COUNTER


            if(

                oldOffer.receiver.toString()

                !==

                req.user.id.toString()

            ){


                return res.status(403).json({

                    success:false,

                    message:"Not allowed"

                });


            }







            oldOffer.offer.status =

            "counter";



            oldOffer.offer.amount =

            Number(amount);






            await oldOffer.save();








            const io =

            req.app.get("io");





            if(io){



                io.to(

                    oldOffer.sender.toString()

                )

                .emit(

                    "offerUpdated",

                    {

                        message:

                        "🔄 Counter offer received",


                        status:"counter",


                        amount:Number(amount)


                    }


                );


            }







            res.json({

                success:true,

                message:"Counter offer sent",

                data:oldOffer


            });





        }


        catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }


    }

);












// ================= INBOX =================

router.get(
"/inbox",
auth,
async(req,res)=>{


    try{


        const messages =

        await Message.find({


            $or:[


                {

                    sender:req.user.id

                },


                {

                    receiver:req.user.id

                }


            ]


        })


        .sort({

            createdAt:-1

        })


        .populate(

            "sender",

            "name email"

        )


        .populate(

            "receiver",

            "name email"

        );







        let conversations = {};

        let unreadCount = 0;







        messages.forEach(msg=>{


            if (!msg.sender || !msg.receiver) return;

            const senderIdStr = msg.sender._id ? msg.sender._id.toString() : msg.sender.toString();
            const receiverIdStr = msg.receiver._id ? msg.receiver._id.toString() : msg.receiver.toString();
            const currentUserIdStr = req.user.id.toString();


            if(

                receiverIdStr

                ===

                currentUserIdStr

                &&

                !msg.read

            ){


                unreadCount++;


            }








            // Determine the other user safely
            let otherUser = senderIdStr === currentUserIdStr
                ? msg.receiver
                : msg.sender;

            const otherUserIdStr = otherUser._id ? otherUser._id.toString() : otherUser.toString();

            // SAFETY CHECK: Skip self-chat messages
            if (otherUserIdStr === currentUserIdStr) {
                return;
            }







            if(!conversations[otherUserIdStr]){


                conversations[otherUserIdStr]={



                    user: otherUser,



                    lastMessage:



                    msg.offer &&

                    msg.offer.amount



                    ?



                    `💰 Offer MK ${msg.offer.amount}`



                    :



                    msg.message,




                    time:msg.createdAt,



                    unread:0



                };



            }








            if(

                receiverIdStr

                ===

                currentUserIdStr

                &&

                !msg.read

            ){



                conversations[otherUserIdStr].unread++;



            }





        });







        res.json({


            conversations:

            Object.values(conversations),



            unreadCount



        });





    }


    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


});
// ================= MARK READ =================

router.put(
    "/read/:userId",
    auth,
    async(req,res)=>{

        try{


            await Message.updateMany(

                {

                    sender:req.params.userId,

                    receiver:req.user.id,

                    read:false

                },


                {

                    read:true

                }

            );





            const io =
            req.app.get("io");



            if(io){


                io.to(req.params.userId)
                .emit(

                    "messagesRead",

                    {

                        by:req.user.id

                    }

                );


            }





            res.json({

                success:true,

                message:"Messages marked as read"

            });



        }


        catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }


    }

);









// ================= CHAT =================

router.get(
"/:userId",
auth,
async(req,res)=>{


    try{


        const messages =

        await Message.find({


            $or:[


                {


                    sender:req.user.id,

                    receiver:req.params.userId


                },


                {


                    sender:req.params.userId,

                    receiver:req.user.id


                }


            ]


        })


        .sort({

            createdAt:1

        })


        .populate(

            "sender",

            "name"

        )


        .populate(

            "receiver",

            "name"

        );







        res.json(messages);



    }


    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


});









// ================= EXPORT =================

module.exports = router;