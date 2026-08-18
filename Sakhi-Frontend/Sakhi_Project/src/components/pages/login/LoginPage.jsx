import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiUser, FiCalendar } from 'react-icons/fi'
import { LiquidEther } from '../../reactbits/LiquidEther'
import { auth } from '../firebase/firebase'
import './LoginPage.css'

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine initial mode from URL search param e.g. /login?mode=signup
    const searchParams = new URLSearchParams(location.search)
    const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'

    const [mode, setMode] = useState(initialMode)
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [user, setUser] = useState(null)
    const [status, setStatus] = useState({ type: '', text: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const queryMode = new URLSearchParams(location.search).get('mode')
        if (queryMode === 'signup' || queryMode === 'login') {
            setMode(queryMode)
        }
    }, [location.search])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            if (currentUser) {
                navigate('/home', { replace: true })
            }
        })

        return () => unsubscribe()
    }, [navigate])

    const handleAuthSubmit = async (e) => {
        e.preventDefault()
        setStatus({ type: '', text: '' })

        if (!email.trim() || !password.trim()) {
            setStatus({ type: 'error', text: 'Please fill in both email and password.' })
            return
        }

        if (mode === 'signup' && (!name.trim() || !age.trim() || !phone.trim())) {
            setStatus({ type: 'error', text: 'Please fill in your name, age, phone number, email, and password.' })
            return
        }

        setIsSubmitting(true)

        try {
            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
                const createdUser = userCredential.user

                await updateProfile(createdUser, { displayName: name.trim() })

                localStorage.setItem('sakhi_user_profile', JSON.stringify({
                    name: name.trim(),
                    age: age.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                }))

                setStatus({
                    type: 'success',
                    text: `Account created! Welcome to Sakhi, ${name.trim()}!`,
                })
                navigate('/home', { replace: true })
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password)
                const loggedInUser = userCredential.user
                setStatus({
                    type: 'success',
                    text: `Welcome back, ${loggedInUser.displayName || loggedInUser.email}!`,
                })
                navigate('/home', { replace: true })
            }
        } catch (error) {
            console.error('Authentication error:', error)
            let friendlyError = 'Authentication failed. Please check your details and try again.'

            if (error.code === 'auth/email-already-in-use') {
                friendlyError = 'An account with this email address already exists. Please sign in instead.'
            } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                friendlyError = 'Invalid email address or password. Please try again.'
            } else if (error.code === 'auth/weak-password') {
                friendlyError = 'Password is too weak. Please use at least 6 characters.'
            } else if (error.code === 'auth/invalid-email') {
                friendlyError = 'Please enter a valid email address.'
            }

            setStatus({ type: 'error', text: friendlyError })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut(auth)
            localStorage.removeItem('sakhi_user_profile')
            setStatus({ type: 'success', text: 'You have been signed out safely.' })
        } catch (error) {
            setStatus({
                type: 'error',
                text: error.message || 'Unable to sign you out right now.',
            })
        }
    }

    return (
        <div className="login-split-shell">
            <LiquidEther />
            <div className="split-auth-container">
                {/* Left Side: Lighter Background with Evenly Spread Text */}
                <div className="auth-info-panel">
                    <div className="info-panel-content">
                        <div className="info-copy-block">
                            <h1>
                                {mode === 'login'
                                    ? 'Access Your Account & Support'
                                    : 'Start Your Journey Now'}
                            </h1>
                            <p>
                                {mode === 'login'
                                    ? 'Log in to access your personalized learning modules, job applications, government scheme updates, and peer community.'
                                    : 'Empower yourself with direct access to verified career opportunities, skill certification programs, financial grants, and 24/7 AI guidance.'}
                            </p>
                        </div>

                        <div className="info-pillars-list">
                            <div className="pillar-item">
                                <span className="pillar-dot" />
                                <span>Verified Women Job Opportunities</span>
                            </div>
                            <div className="pillar-item">
                                <span className="pillar-dot" />
                                <span>Skill Courses & Certifications</span>
                            </div>
                            <div className="pillar-item">
                                <span className="pillar-dot" />
                                <span>State & Central Welfare Schemes</span>
                            </div>
                            <div className="pillar-item">
                                <span className="pillar-dot" />
                                <span>24/7 Gemini AI Assistant</span>
                            </div>
                        </div>

                        <div className="info-panel-footer">
                            <Link to="/" className="back-landing-link">
                                Back to Landing Page
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Dark Background with Glassmorphism Auth Card */}
                <div className="auth-form-panel">
                    <div className="glass-auth-card">
                        <div className="auth-mode-pills">
                            <button
                                type="button"
                                className={`mode-pill ${mode === 'login' ? 'active' : ''}`}
                                onClick={() => setMode('login')}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                className={`mode-pill ${mode === 'signup' ? 'active' : ''}`}
                                onClick={() => setMode('signup')}
                            >
                                Create Account
                            </button>
                        </div>

                        {user ? (
                            <div className="signed-in-panel">
                                <p>Signed in as <strong>{user.email}</strong></p>
                                <button className="sakhi-auth-submit-btn" type="button" onClick={handleSignOut}>
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <form className="dark-auth-form" onSubmit={handleAuthSubmit}>
                                <div className="input-fields-stack">
                                    {mode === 'signup' ? (
                                        <>
                                            <div className="input-group">
                                                <label>Full Name</label>
                                                <div className="input-with-icon">
                                                    <FiUser className="field-icon" />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="Enter your full name"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="input-row-twin">
                                                <div className="input-group">
                                                    <label>Age</label>
                                                    <div className="input-with-icon">
                                                        <FiCalendar className="field-icon" />
                                                        <input
                                                            type="number"
                                                            value={age}
                                                            onChange={(e) => setAge(e.target.value)}
                                                            placeholder="Age"
                                                            min="14"
                                                            max="100"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="input-group">
                                                    <label>Phone Number</label>
                                                    <div className="input-with-icon">
                                                        <FiPhone className="field-icon" />
                                                        <input
                                                            type="tel"
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                            placeholder="Phone number"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : null}

                                    <div className="input-group">
                                        <label>Email ID</label>
                                        <div className="input-with-icon">
                                            <FiMail className="field-icon" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>Password</label>
                                        <div className="input-with-icon">
                                            <FiLock className="field-icon" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password-btn"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                aria-label="Toggle password visibility"
                                            >
                                                {showPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {status.text ? (
                                    <div className={`auth-status-alert ${status.type}`}>
                                        {status.text}
                                    </div>
                                ) : null}

                                <button className="sakhi-auth-submit-btn" type="submit" disabled={isSubmitting}>
                                    <span>{isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                                    <FiArrowRight className="submit-arrow" />
                                </button>

                                <div className="auth-footer-switch">
                                    <span>{mode === 'login' ? "Don't have an account yet?" : 'Already registered with Sakhi?'}</span>
                                    <button
                                        type="button"
                                        className="switch-mode-text-btn"
                                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                    >
                                        {mode === 'login' ? 'Create Account' : 'Sign In'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
