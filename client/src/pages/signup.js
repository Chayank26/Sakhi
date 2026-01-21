import axios from 'axios'

function Signup(){
 const signup=async()=>{
  await axios.post('http://localhost:5000/api/auth/signup',{
   email:'test2@test.com',
   password:'123456'
  })
  alert('Signup successful')
 }

 return <button onClick={signup}>Signup</button>
}

export default Signup
