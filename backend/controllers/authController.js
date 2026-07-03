import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import generateUniqueConnectCode from '../utils/generateUniqueConnectCode.js';

 class AuthController{
    static async register(req, res){
        try{
            const {fullName, username, email, password} = req.body;
            if(!fullName || !username || !email || !password){
                return res.status(400).json({message: 'All fields are required'});
            }
            if(password.length < 6){
                return res.status(400).json({message: 'Password must be at least 6 characters'});
            }
            const existingUser = await User.findOne({$or: [{email}, {username}]});
            if(existingUser){
                return res.status(400).json({message: 'Email or username already in use'});
            }
            // has password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new User({
                username,
                fullName,
                email,
                password: hashedPassword,
                connectCode: await generateUniqueConnectCode()
            })
            await user.save();
            console.log('User registered successfully', user);
            res.status(201).json({message: 'User registered successfully'});

        }
        catch(err){
            console.error('Error during registration', err);
            res.status(500).json({message: 'Server error during registration'});
        }
    }
    static async login(req, res){
        try{
            const {email, password} = req.body;
            if(!email || !password){
                return res.status(400).json({message: 'Email and password are required'});
            }
            const user = await User.findOne({email});
            if(!user){
                return res.status(400).json({message: 'Invalid email'});
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({message: 'Invalid password'});
            } 
            const token= jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
            res.cookie("jwt", token, {
                maxAge: 7*24*60*60*1000, // 7 days
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
         } );
         res.status(200).json({user:{
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
             connectCode: user.connectCode,
         },message: 'Login successful'});

        }
        catch(err){
            console.error("Login  error", err);
            res.status(500).json({message: 'Server error during registration'});
        }
    }
    static async me(req,res){
        console.log('Cookies received:', req.cookies);  // ← add this
    console.log('userId from middleware:', req.user); // ← and this
        try{
            const user= await User.findById(req.user).select('-password');
            if(!user){
                return res.status(400).json({message: 'User not found'});
            }
            res.status(200).json({user:{
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                 connectCode: user.connectCode,
            }});   

        }
        catch(err){
            console.error("Error fetching user data", err);
            res.status(500).json({message: 'Server error fetching user data'});
        }
    }

 }
 export default AuthController;