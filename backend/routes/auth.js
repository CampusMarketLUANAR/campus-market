const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");

const router = express.Router();



const transporter = nodemailer.createTransport({

    service:"gmail",

    auth:{

        user:process.env.EMAIL_USER,

        pass:process.env.EMAIL_PASS

    }

});



// ================= REGISTER =================


router.post("/register", async(req,res)=>{


    try{


        const {

            name,
            email,
            password,
            phone,
            campus,
            bio,
            accountType,
            profileImage

        } = req.body;



        const existingUser = await User.findOne({

            email

        });



        if(existingUser){

            return res.status(400).json({

                message:"Email already exists"

            });

        }



        const hashedPassword = await bcrypt.hash(

            password,

            10

        );



        const user = new User({

            name,

            email,

            password:hashedPassword,

            phone,

            campus,

            bio,

            accountType,

            profileImage

        });



        await user.save();



        res.status(201).json({

            message:"Registration successful"

        });



    }catch(error){


        res.status(500).json({

            message:error.message

        });


    }


});





// ================= LOGIN =================


router.post("/login", async(req,res)=>{


    try{


        const {

            email,

            password

        } = req.body;



        const user = await User.findOne({

            email

        });



        if(!user){

            return res.status(400).json({

                message:"User not found"

            });

        }



        const isMatch = await bcrypt.compare(

            password,

            user.password

        );



        if(!isMatch){

            return res.status(400).json({

                message:"Wrong password"

            });

        }



        const token = jwt.sign(

            {

                id:user._id

            },

            process.env.JWT_SECRET,

            {

                expiresIn:"7d"

            }

        );



        res.json({

            message:"Login successful",

            token,


            user:{

                id:user._id,

                name:user.name,

                email:user.email,

                phone:user.phone,

                profileImage:user.profileImage,

                campus:user.campus,

                bio:user.bio,

                accountType:user.accountType,

                rating:user.rating,

                reviews:user.reviews

            }


        });



    }catch(error){


        res.status(500).json({

            message:error.message

        });


    }


});





// ================= FORGOT PASSWORD =================


router.post("/forgot-password", async(req,res)=>{


    console.log("FORGOT PASSWORD REQUEST RECEIVED");


    try{


        const { email } = req.body;



        const user = await User.findOne({

            email

        });



        console.log("USER FOUND:", user ? user.email : "NO USER");



        if(!user){

            return res.json({

                message:"If the email exists, a reset link has been sent"

            });

        }



        const resetToken = crypto.randomBytes(32)
        .toString("hex");



        user.resetPasswordToken = resetToken;



        user.resetPasswordExpires =
        Date.now() + 3600000;



        try{

            await user.save();

            console.log("TOKEN SAVED SUCCESSFULLY");


        }catch(saveError){


            console.log(
                "SAVE ERROR:",
                saveError
            );


        }



        const resetURL =
        `${process.env.APP_URL}/reset-password.html?token=${resetToken}`;
        try{


            console.log("ABOUT TO SEND EMAIL");


            const info = await transporter.sendMail({


                from:process.env.EMAIL_USER,


                to:user.email,


                subject:"Campus Market Password Reset",


                html:`

                <h2>Campus Market Password Reset</h2>

                <p>You requested to reset your password.</p>

                <p>Click the link below:</p>


                <a href="${resetURL}">
                    Reset Password
                </a>


                <p>This link expires in 1 hour.</p>

                `


            });



            console.log(

                "EMAIL SENT:",

                info.response

            );



        }catch(emailError){


            console.log(

                "EMAIL ERROR:",

                emailError.message

            );


        }






        res.json({

            message:"Password reset email sent"

        });






    }catch(error){


        console.log(

            "FORGOT PASSWORD ERROR:",

            error

        );


        res.status(500).json({

            message:"Server error"

        });


    }


});








// ================= RESET PASSWORD =================


router.post("/reset-password", async(req,res)=>{


    try{


        const {

            token,

            password

        } = req.body;





        const user = await User.findOne({


            resetPasswordToken:token,


            resetPasswordExpires:{

                $gt:Date.now()

            }


        });





        if(!user){


            return res.status(400).json({

                message:"Invalid or expired reset link"

            });


        }






        const hashedPassword = await bcrypt.hash(

            password,

            10

        );






        user.password = hashedPassword;



        user.resetPasswordToken = null;



        user.resetPasswordExpires = null;






        await user.save();






        res.json({

            message:"Password reset successful"

        });






    }catch(error){



        console.log(error);



        res.status(500).json({

            message:"Server error"

        });


    }



});








// ================= GET SELLER PROFILE =================


router.get("/seller/:id", async(req,res)=>{


    try{


        const seller = await User.findById(

            req.params.id

        )

        .select("-password");





        if(!seller){


            return res.status(404).json({

                message:"Seller not found"

            });


        }






        res.json(seller);






    }catch(error){



        res.status(500).json({

            message:error.message

        });


    }



});






module.exports = router;