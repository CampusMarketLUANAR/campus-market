const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const User = require("../models/User");


// CREATE REVIEW

router.post("/", async (req,res)=>{


    try{


        const {
            seller,
            buyer,
            rating,
            comment
        } = req.body;





        const review = new Review({

            seller,

            buyer,

            rating,

            comment

        });




        await review.save();







        // calculate average rating


        const reviews = await Review.find({

            seller:seller

        });






        let total = 0;



        reviews.forEach(review=>{


            total += review.rating;


        });





        const average = total / reviews.length;








        await User.findByIdAndUpdate(

            seller,

            {

                rating:average.toFixed(1),

                reviews:reviews.length

            }

        );







        res.json({

            message:"Review added successfully"

        });




    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }



});


// GET REVIEWS FOR A SELLER

router.get("/:sellerId", async (req, res) => {

    try {

        const reviews = await Review.find({

            seller: req.params.sellerId

        })
        .populate("buyer", "name")
        .sort({ createdAt: -1 });

        res.json(reviews);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

});

module.exports = router;