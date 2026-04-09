import axios from 'axios'
import { useState } from 'react'

function Signup(){
 const[email,setEmail]=useState('')
 const[password,setPassword]=useState('')

 const signup = async () => {
    try {
        if (!email || !password) {
        alert("Please enter email and password")
        return
        }

        const res = await axios.post(
        'http://localhost:5000/api/auth/signup',
        { email, password }
        )

        alert(res.data.message)

    } catch (err) {
        console.error(err)

        // ✅ THIS IS THE FIX
        if (err.response) {
        alert(err.response.data.message)
        } else {
        alert("Server error")
        }
    }
    }

 return(
  <div>
   <h2>Signup</h2>
   <input placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
   <br/>
   <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
   <br/>
   <button onClick={signup}>Signup</button>
  </div>
 )
}

export default Signup
