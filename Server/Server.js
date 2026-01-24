const jobRoutes = require("./routes/jobs");


const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')
require('dotenv').config()

const app=express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('MongoDB connected'))
.catch(err=>console.error('MongoDB connection error:',err))

app.use('/api/auth',require('./routes/auth'))
app.use("/api/jobs", jobRoutes);


app.listen(5000,()=>console.log('Server running on port 5000'))
