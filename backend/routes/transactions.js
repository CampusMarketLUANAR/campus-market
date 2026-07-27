const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const Product = require("../models/Product");

const auth = require("../middleware/auth");



// ===============================
// GET MY TRANSACTIONS
// ===============================

router.get("/", auth, async (req, res) => {

    try {

        const transactions =
        await Transaction.find({

            $or: [

                {
                    buyer: req.user.id
                },

                {
                    seller: req.user.id
                }

            ]

        })

        .populate(

            "buyer",

            "name email phone"

        )

        .populate(

            "seller",

            "name email phone"

        )

        .populate({

            path: "product",

            populate: {

                path: "seller",

                select: "name"

            }

        })

        .sort({

            createdAt: -1

        });



        res.json({

            success: true,

            count: transactions.length,

            transactions

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});



// ===============================
// GET SINGLE TRANSACTION
// ===============================

router.get("/:id", auth, async (req, res) => {

    try {

        const transaction =
        await Transaction.findById(req.params.id)

        .populate(

            "buyer",

            "name email phone"

        )

        .populate(

            "seller",

            "name email phone"

        )

        .populate("product");



        if (!transaction) {

            return res.status(404).json({

                success: false,

                message: "Transaction not found"

            });

        }



        if (

            transaction.buyer._id.toString() !== req.user.id &&
            transaction.seller._id.toString() !== req.user.id

        ) {

            return res.status(403).json({

                success: false,

                message: "Access denied"

            });

        }



        res.json({

            success: true,

            transaction

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});
// ===============================
// BUYER MARKS AS PAID
// ===============================

router.put("/paid/:id", auth, async (req, res) => {

    try {

        const transaction =
        await Transaction.findById(req.params.id);

        if (!transaction) {

            return res.status(404).json({

                success:false,

                message:"Transaction not found"

            });

        }

        // Only buyer can mark as paid

        if (transaction.buyer.toString() !== req.user.id) {

            return res.status(403).json({

                success:false,

                message:"Only the buyer can perform this action"

            });

        }

        if (transaction.status !== "reserved") {

            return res.status(400).json({

                success:false,

                message:"Transaction is not in reserved state"

            });

        }

        transaction.status = "paid";

        await transaction.save();

        res.json({

            success:true,

            message:"Payment confirmed",

            transaction

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});



// ===============================
// SELLER MARKS AS COLLECTED
// ===============================

router.put("/collected/:id", auth, async (req, res) => {

    try {

        const transaction =
        await Transaction.findById(req.params.id);

        if (!transaction) {

            return res.status(404).json({

                success:false,

                message:"Transaction not found"

            });

        }

        // Only seller can mark as collected

        if (transaction.seller.toString() !== req.user.id) {

            return res.status(403).json({

                success:false,

                message:"Only the seller can perform this action"

            });

        }

        if (transaction.status !== "paid") {

            return res.status(400).json({

                success:false,

                message:"Buyer has not confirmed payment yet"

            });

        }

        transaction.status = "collected";

        await transaction.save();

        res.json({

            success:true,

            message:"Product collected successfully",

            transaction

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});
// ===============================
// COMPLETE TRANSACTION
// ===============================

router.put("/complete/:id", auth, async (req,res)=>{

    try{

        const transaction =
        await Transaction.findById(req.params.id);

        if(!transaction){

            return res.status(404).json({

                success:false,

                message:"Transaction not found"

            });

        }

        // Buyer or seller can complete

        if(

            transaction.buyer.toString() !== req.user.id &&

            transaction.seller.toString() !== req.user.id

        ){

            return res.status(403).json({

                success:false,

                message:"Not allowed"

            });

        }

        if(transaction.status !== "collected"){

            return res.status(400).json({

                success:false,

                message:"Product has not been collected yet"

            });

        }

        transaction.status = "completed";

        await transaction.save();



        // Mark product as sold

        await Product.findByIdAndUpdate(

            transaction.product,

            {

                status:"sold"

            }

        );



        res.json({

            success:true,

            message:"Transaction completed successfully",

            transaction

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});



// ===============================
// CANCEL TRANSACTION
// ===============================

router.put("/cancel/:id", auth, async(req,res)=>{

    try{

        const transaction =
        await Transaction.findById(req.params.id);

        if(!transaction){

            return res.status(404).json({

                success:false,

                message:"Transaction not found"

            });

        }

        if(

            transaction.buyer.toString() !== req.user.id &&

            transaction.seller.toString() !== req.user.id

        ){

            return res.status(403).json({

                success:false,

                message:"Not allowed"

            });

        }

        transaction.status = "cancelled";

        await transaction.save();



        // Make product available again

        await Product.findByIdAndUpdate(

            transaction.product,

            {

                status:"available",

                reservedBy:null,

                agreedPrice:null

            }

        );



        res.json({

            success:true,

            message:"Transaction cancelled",

            transaction

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});
// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;