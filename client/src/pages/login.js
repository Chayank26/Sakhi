import axios from 'axios'
import { useState } from 'react'

function Login(){
 const[email,setEmail]=useState('')
 const[password,setPassword]=useState('')

 const login=async()=>{
  const res=await axios.post('http://localhost:5000/api/auth/login',{
   email,password
  })
  localStorage.setItem('token',res.data.token)
  alert('Login successful')
 }

 return(
  <div>
   <h2>Login</h2>
   <input placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
   <br/>
   <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
   <br/>
   <button onClick={login}>Login</button>
  </div>
 )
}

export default Login
