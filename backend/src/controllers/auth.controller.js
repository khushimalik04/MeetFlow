import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {upsertStreamUser} from "../lib/stream.js";

export async function signup(req,res){
    const {email,password,fullName} = req.body;

    try{
        if(!email || !password || !fullName){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "invalid email format"});
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "Email already exists, please use a different one"});
        }

        const idx = Math.floor(Math.random() *100) + 1; //generate a number between 1 to 100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        })


        //CREATE THE USER IN STREAM AS WELL
        try{
        await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePic || "",
        });
        console.log(`stream user created for ${newUser.fullName}`);
    }catch(error){
        console.log("error in creating stream user", error);
    }


        //user generated now token
        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY,{
            expiresIn: "7d",
        })

        //now cookie 
        res.cookie("jwt", token,{
            maxAge: 7*24*60*60*1000, //7 days
            httpOnly: true,  //prevent XSS attacks
            sameSite: "strict",//prevent CSRF attacks
            secure: process.env.NODE_ENV ==="production", //only send cookie over HTTPS in production
        })

        res.status(201).json({success:true, message: "User registered successfully", user: newUser})

    }catch(error){
        console.log("error in signup controller",error);
        res.status(500).json({message: "Internal server error"});
    }
}



export async function login(req,res){
    const {email,password} = req.body;

    try{
        if(!email || !password){
            return res.status(400).json({message: "all fields are required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const isPasswordCorrect = await user.matchPassword(password); 
        if(!isPasswordCorrect){
            return res.status(401).json({message: "Invalid email or password"});
        }

           const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY,{
            expiresIn: "7d",
        })

        //now cookie 
        res.cookie("jwt", token,{
            maxAge: 7*24*60*60*1000, //7 days
            httpOnly: true,  //prevent XSS attacks
            sameSite: "strict",//prevent CSRF attacks
            secure: process.env.NODE_ENV ==="production", //only send cookie over HTTPS in production
        });

        res.status(200).json({success: true, message: "User logged in successfully", user});

    }catch(error){
        console.log("error in login controller",error);
        res.status(500).json({message: "Internal server error"} );
    }
}



export function logout(req,res){
    res.clearCookie("jwt");
    res.status(200).json({success: true, message: "User logged out successfully"});
}



export async function onboard(req,res){
    try{
        const userId = req.user._id;

        const {fullName, bio, nativeLanguage, LearningLanguage, Location} = req.body;

        if(!fullName || !bio || !nativeLanguage || !LearningLanguage || !Location){
            return res.status(400).json({
                message: "All fields are required for onboarding",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !LearningLanguage && "LearningLanguage",
                    !Location && "Location",
                ].filter(Boolean),
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true,
        }, {new:true});

        if(!updatedUser){
            return res.status(404).json({message: "User not found"});
        }


        // UPDATE USER IN STREAM AS WELL
        try{
        await upsertStreamUser({
            id: updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || "",
        })
        console.log(`stream user updated after onboarding for ${updatedUser.fullName}`);

    }catch(Streamerror){
        console.log("error in updating stream user during onboarding", Streamerror.message);
    }


    
        res.status(200).json({success:true,message: "user onboarded successfully", user:updatedUser});

    }catch (error){
        console.log("Onboarding error", error);
        res.status(500).json({message: "Internal server error"});
    }
}