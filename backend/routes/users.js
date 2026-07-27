const express = require("express");

const router = express.Router();

const User = require("../models/User");
const Product = require("../models/Product");


// ================= SELLER PROFILE =================

router.get("/:id/profile", async (req, res) => {

    try {

        const sellerId = req.params.id;


        // Find seller
        const user = await User.findById(sellerId)
            .select("-password");


        if (!user) {

            return res.status(404).json({

                message: "User not found"

            });

        }


        // Find seller products
        const products = await Product.find({

            seller: sellerId

        });



        // Send response

        res.json({

            user,


            products,


            stats: {

                totalProducts: products.length,


                totalSales: user.totalSales || 0,


                rating: user.rating || 0,


                reviews: user.reviews || 0,


                verified: user.verified || false

            }


        });



    } catch (error) {


        console.log("SELLER PROFILE ERROR:", error);


        res.status(500).json({

            message: "Server error"

        });


    }


});



module.exports = router;