const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({


    name: {

        type:String,

        required:true

    },



    price: {

        type:Number,

        required:true

    },



    category: {

        type:String,

        required:true

    },



    description: {

        type:String,

        required:true

    },



    phone: {

        type:String,

        required:true

    },



    image: {

        type:String,

        default:""

    },



    seller: {

        type:mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true

    },




    // ================= MARKET STATUS =================



    status: {


        type:String,


        enum:[

            "available",

            "reserved",

            "sold"

        ],


        default:"available"


    },





    reservedBy:{


        type:mongoose.Schema.Types.ObjectId,


        ref:"User",


        default:null


    },





    agreedPrice:{


        type:Number,


        default:null


    },






    // ================= PRODUCT ANALYTICS =================



    views:{


        type:Number,


        default:0


    },





    favorites:{


        type:Number,


        default:0


    },





    soldAt:{


        type:Date,


        default:null


    }




}, {


    timestamps:true


});





module.exports =
mongoose.model(
    "Product",
    productSchema
);