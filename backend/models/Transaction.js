const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    product:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Product",

        required:true

    },


    buyer:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true

    },


    seller:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true

    },


    price:{

        type:Number,

        required:true

    },


    status:{

        type:String,

        enum:[

            "reserved",

            "paid",

            "collected",

            "completed",

            "cancelled"

        ],

        default:"reserved"

    }


},

{

    timestamps:true

});

module.exports =
mongoose.model(
    "Transaction",
    transactionSchema
);