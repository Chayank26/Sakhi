import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const login = async () => {
    try {
      // 🔴 Basic validation
      if (!email || !password) {
        alert("Please enter email and password")
        return
      }

      setLoading(true)

      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password }
      )

      // ✅ Store token
      localStorage.setItem('token', res.data.token)

      alert("Login successful")

      localStorage.setItem("token", res.data.token)
      window.location.href = "/dashboard"

    } catch (err) {
      console.error(err)

      // 🔴 Proper error handling
      if (err.response) {
        alert(err.response.data.message)
      } else {
        alert("Server error")
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={login} disabled={loading} className="auth-btn">
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  )
}

export default Login