const mongoose = require("mongoose");


const messageSchema = new mongoose.Schema({


    sender: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },


    receiver: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true

    },


    product: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Product"

    },



    // ================= TEXT MESSAGE =================


    message: {

        type: String,

        default: "",

        trim: true

    },



    // ================= OFFER =================


    offer: {


        amount: {

            type: Number,

            default: null

        },


        status: {

            type: String,

            enum: [

                "pending",

                "accepted",

                "rejected",

                "counter"

            ],


            default: "pending"

        }


    },




    // ================= IMAGE =================


    image: {

        type: String,

        default: ""

    },




    // ================= FILE =================


    file: {

        type: String,

        default: ""

    },


    fileName: {

        type: String,

        default: ""

    },




    // ================= STATUS =================


    delivered: {

        type: Boolean,

        default: false

    },


    read: {

        type: Boolean,

        default: false

    }



}, {


    timestamps: true


});



module.exports = mongoose.model(
    "Message",
    messageSchema
);