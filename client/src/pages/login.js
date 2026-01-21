import axios from 'axios'

function Login(){
 const login=async()=>{
  const res=await axios.post('http://localhost:5000/api/auth/login',{
   email:'test2@test.com',
   password:'123456'
  })
  localStorage.setItem('token',res.data.token)
  alert('Login successful')
 }

 return <button onClick={login}>Login</button>
}

export default Login
