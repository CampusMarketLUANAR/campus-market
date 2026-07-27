const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name:{

        type:String,

        required:true

    },



    email:{

        type:String,

        required:true,

        unique:true,

        lowercase:true,

        trim:true

    },



    password:{

        type:String,

        required:true

    },



    phone:{

        type:String,

        default:""

    },



    profileImage:{

        type:String,

        default:"https://via.placeholder.com/150"

    },



    campus:{

        type:String,

        default:"LUANAR Campus"

    },



    bio:{

        type:String,

        default:"Campus Market student"

    },



    accountType:{

        type:String,

        enum:[
            "buyer",
            "seller"
        ],

        default:"buyer"

    },



    rating:{

        type:Number,

        default:0

    },



    reviews:{

        type:Number,

        default:0

    },



    // ================= SELLER STATS =================

    totalSales:{

        type:Number,

        default:0

    },



    totalProducts:{

        type:Number,

        default:0

    },



    verified:{

        type:Boolean,

        default:false

    },



    // ================= PASSWORD RESET =================

    resetPasswordToken:{

        type:String,

        default:null

    },



    resetPasswordExpires:{

        type:Date,

        default:null

    }

},

{

    timestamps:true

});

module.exports = mongoose.model("User", userSchema);