import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
import { FiBriefcase, FiBookOpen, FiFileText, FiUsers } from 'react-icons/fi'
import { DepthCarousel } from '../../reactbits/DepthCarousel'
import { auth } from '../firebase/firebase'
import './LoginPage.css'

export function LoginPage() {
    const navigate = useNavigate()
    const [mode, setMode] = useState('login')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [user, setUser] = useState(null)
    const [status, setStatus] = useState({ type: '', text: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })

        return () => unsubscribe()
    }, [])

    const handleAuthSubmit = async (e) => {
        e.preventDefault()
        setStatus({ type: '', text: '' })

        if (!email.trim() || !password.trim()) {
            setStatus({ type: 'error', text: 'Please fill in both email and password.' })
            return
        }

        if (mode === 'signup' && !name.trim()) {
            setStatus({ type: 'error', text: 'Please enter your full name.' })
            return
        }

        setIsSubmitting(true)

        try {
            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                const createdUser = userCredential.user
                setStatus({
                    type: 'success',
                    text: `Account created! Welcome to Sakhi, ${name.trim() || createdUser.email}.`,
                })
                navigate('/home')
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password)
                const loggedInUser = userCredential.user
                setStatus({
                    type: 'success',
                    text: `Welcome back, ${loggedInUser.displayName || loggedInUser.email}!`,
                })
                navigate('/home')
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
            setStatus({ type: 'success', text: 'You have been signed out safely.' })
        } catch (error) {
            setStatus({
                type: 'error',
                text: error.message || 'Unable to sign you out right now.',
            })
        }
    }

    return (
        <section className="section login-section" id="login">
            <div className="auth-card">
                <div className="auth-copy">
                    <div className="brand-badge">Sakhi</div>
                    
                    <h2 className="landing-invitation-title">
                        Ready to start your journey with Sakhi?
                    </h2>

                    <div className="landing-carousel-container">
                        <DepthCarousel />
                    </div>

                    <div className="landing-mode-selector">
                        <button
                            type="button"
                            className={`landing-mode-btn ${mode === 'login' ? 'active' : ''}`}
                            onClick={() => setMode('login')}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            className={`landing-mode-btn ${mode === 'signup' ? 'active' : ''}`}
                            onClick={() => setMode('signup')}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                {user ? (
                    <div className="auth-panel">
                        {status.text ? (
                            <p className={`status-message ${status.type}`}>{status.text}</p>
                        ) : null}
                        <button className="btn primary auth-button" type="button" onClick={handleSignOut}>
                            Sign out
                        </button>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-toggle-row" role="tablist" aria-label="Authentication mode">
                            <button
                                className={`toggle-pill ${mode === 'login' ? 'active' : ''}`}
                                type="button"
                                onClick={() => setMode('login')}
                            >
                                Login
                            </button>
                            <button
                                className={`toggle-pill ${mode === 'signup' ? 'active' : ''}`}
                                type="button"
                                onClick={() => setMode('signup')}
                            >
                                Create account
                            </button>
                        </div>

                        <div className="auth-heading-block">
                            <h3>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h3>
                            <p>{mode === 'login' ? 'Continue your journey with Sakhi.' : 'Start your journey with Sakhi.'}</p>
                        </div>

                        <div className="field-group">
                            {mode === 'signup' ? (
                                <>
                                    <label className="field">
                                        <span>Name</span>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            placeholder="Enter your name"
                                        />
                                    </label>

                                    <label className="field">
                                        <span>Phone number</span>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(event) => setPhone(event.target.value)}
                                            placeholder="Enter your phone number"
                                        />
                                    </label>
                                </>
                            ) : null}

                            <label className="field">
                                <span>Email</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                />
                            </label>

                            <label className="field">
                                <span>Password</span>
                                <div className="password-field">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        className="password-toggle"
                                        type="button"
                                        onClick={() => setShowPassword((current) => !current)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </label>
                        </div>

                        <div className="form-meta">
                            <label className="checkbox-row">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a className="link-text" href="#">Forgot password?</a>
                        </div>

                        {status.text ? (
                            <p className={`status-message ${status.type}`}>{status.text}</p>
                        ) : null}

                        <button className="btn primary auth-button" type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? 'Please wait...'
                                : mode === 'login'
                                    ? 'Sign in'
                                    : 'Create account'}
                        </button>

                        <p className="mode-switch">
                            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                            <button type="button" className="switch-link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                                {mode === 'login' ? 'Create one' : 'Sign in'}
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </section>
    )
}
