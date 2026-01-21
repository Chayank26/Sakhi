const User=require('../models/User')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

const signup=async(req,res)=>{
 const {email,password}=req.body
 const hashedPassword=await bcrypt.hash(password,10)
 await User.create({email,password:hashedPassword})
 res.json({message:'User created'})
}

const login=async(req,res)=>{
 const {email,password}=req.body
 const user=await User.findOne({email})
 if(!user)return res.status(400).json({message:'Invalid credentials'})
 const match=await bcrypt.compare(password,user.password)
 if(!match)return res.status(400).json({message:'Invalid credentials'})
 const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
 res.json({token})
}

module.exports={signup,login}
