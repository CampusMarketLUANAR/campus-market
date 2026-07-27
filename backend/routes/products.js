const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const express = require("express");

const router = express.Router();

const Product = require("../models/Product");
const auth = require("../middleware/auth");



const upload = multer({
    storage: multer.memoryStorage()
});





// =========================
// CREATE PRODUCT
// =========================

router.post("/", auth, upload.single("image"), async (req,res)=>{


    try{


        let imageUrl = "";



        if(req.file){


            const result = await new Promise((resolve,reject)=>{


                cloudinary.uploader.upload_stream(

                    {
                        folder:"campus-market"
                    },


                    (error,result)=>{


                        if(error){

                            reject(error);

                        }
                        else{

                            resolve(result);

                        }


                    }


                ).end(req.file.buffer);


            });



            imageUrl = result.secure_url;


        }







        const product = new Product({


            name:req.body.name,


            price:req.body.price,


            category:req.body.category,


            description:req.body.description,


            phone:req.body.phone,


            image:imageUrl,


            seller:req.user.id,


            status:"available"


        });





        await product.save();





        res.status(201).json({

            message:"Product created successfully",

            product

        });



    }


    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


});









// =========================
// GET MY PRODUCTS
// =========================

router.get("/my", auth, async(req,res)=>{


    try{


        const products = await Product.find({

            seller:req.user.id

        })

        .populate(

            "seller",

            "name email phone"

        );




        res.json(products);



    }

    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


});
// =========================
// GET ALL PRODUCTS
// =========================

router.get("/", async(req,res)=>{


    try{


        const products = await Product.find()

        .populate(

            "seller",

            "name email phone rating reviews"

        );





        res.json(products);



    }


    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


});









// =========================
// GET SINGLE PRODUCT
// =========================

router.get("/:id", async(req,res)=>{


    try{


        const product = await Product.findById(

            req.params.id

        )

        .populate(

            "seller",

            "name email phone rating reviews"

        );






        if(!product){


            return res.status(404).json({

                message:"Product not found"

            });


        }







        res.json(product);



    }


    catch(error){


        res.status(500).json({

            message:error.message

        });


    }


});









// =========================
// MARK PRODUCT AS SOLD
// =========================

router.put("/sold/:id", auth, async(req,res)=>{


    try{


        const product = await Product.findById(

            req.params.id

        );





        if(!product){


            return res.status(404).json({

                success:false,

                message:"Product not found"

            });


        }







        // ONLY SELLER CAN MARK SOLD

        if(

            product.seller.toString()

            !==

            req.user.id.toString()

        ){


            return res.status(403).json({

                success:false,

                message:"Only seller can complete sale"

            });


        }








        if(product.status === "sold"){


            return res.status(400).json({

                success:false,

                message:"Product already sold"

            });


        }








        product.status = "sold";



        await product.save();





        res.json({

            success:true,

            message:"Product marked as sold",

            product

        });





    }


    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});
// =========================
// CHECK PRODUCT AVAILABILITY
// =========================

router.get("/check/:id", auth, async(req,res)=>{


    try{


        const product = await Product.findById(

            req.params.id

        );





        if(!product){


            return res.status(404).json({

                success:false,

                message:"Product not found"

            });


        }







        if(product.status === "sold"){


            return res.json({

                success:false,

                available:false,

                message:"This product has already been sold"

            });


        }






        if(product.status === "reserved"){


            return res.json({

                success:false,

                available:false,

                message:"This product is currently reserved"

            });


        }







        res.json({

            success:true,

            available:true,

            message:"Product available"

        });





    }


    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});









// =========================
// CANCEL RESERVATION
// =========================

router.put("/cancel-reservation/:id", auth, async(req,res)=>{


    try{


        const product = await Product.findById(

            req.params.id

        );





        if(!product){


            return res.status(404).json({

                success:false,

                message:"Product not found"

            });


        }







        // SELLER ONLY

        if(

            product.seller.toString()

            !==

            req.user.id.toString()

        ){


            return res.status(403).json({

                success:false,

                message:"Only seller can cancel reservation"

            });


        }







        product.status = "available";


        product.reservedBy = null;


        product.agreedPrice = null;





        await product.save();







        res.json({

            success:true,

            message:"Reservation cancelled",

            product

        });





    }


    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});





// =========================
// UPDATE PRODUCT
// =========================

router.put("/:id", auth, upload.single("image"), async(req,res)=>{

    try{


        const product = await Product.findById(
            req.params.id
        );



        if(!product){

            return res.status(404).json({

                success:false,

                message:"Product not found"

            });

        }




        // ONLY OWNER CAN EDIT

        if(

            product.seller.toString()

            !==

            req.user.id.toString()

        ){

            return res.status(403).json({

                success:false,

                message:"You can only edit your own products"

            });

        }





        // UPDATE TEXT FIELDS

        product.name =
        req.body.name || product.name;


        product.price =
        req.body.price || product.price;


        product.category =
        req.body.category || product.category;


        product.description =
        req.body.description || product.description;


        product.phone =
        req.body.phone || product.phone;







        // UPDATE IMAGE IF NEW ONE IS UPLOADED

        if(req.file){



            const result = await new Promise((resolve,reject)=>{


                cloudinary.uploader.upload_stream(

                    {
                        folder:"campus-market"
                    },


                    (error,result)=>{


                        if(error){

                            reject(error);

                        }
                        else{

                            resolve(result);

                        }


                    }


                ).end(req.file.buffer);



            });



            product.image =
            result.secure_url;


        }






        await product.save();





        res.json({

            success:true,

            message:"Product updated successfully",

            product

        });




    }


    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});



// =========================
// DELETE PRODUCT
// =========================

router.delete("/:id", auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Only the owner can delete
        if (product.seller.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own products"
            });
        }

        // Delete image from Cloudinary
        if (product.image) {
            try {
                const parts = product.image.split("/");
                const filename = parts[parts.length - 1];
                const publicId = "campus-market/" + filename.split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.log("Cloudinary delete failed:", err.message);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});









// =========================
// EXPORT
// =========================

module.exports = router;