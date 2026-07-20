import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth'
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

    async function handleSubmit(event) {
        event.preventDefault()
        setStatus({ type: '', text: '' })

        if (mode === 'signup' && (!name.trim() || !phone.trim())) {
            setStatus({ type: 'error', text: 'Please enter your name and phone number to create an account.' })
            return
        }

        if (!email.trim() || !password.trim()) {
            setStatus({ type: 'error', text: 'Please enter both your email and password.' })
            return
        }

        setIsSubmitting(true)

        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email.trim(), password)
                setStatus({ type: 'success', text: 'Welcome back! You are signed in.' })
            } else {
                await createUserWithEmailAndPassword(auth, email.trim(), password)
                setStatus({ type: 'success', text: 'Account created successfully. Welcome aboard!' })
            }

            setName('')
            setPhone('')
            setEmail('')
            setPassword('')
            navigate('/home')
        } catch (error) {
            setStatus({
                type: 'error',
                text: error.message || 'Authentication failed. Please try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleSignOut() {
        try {
            await signOut(auth)
            setStatus({ type: 'success', text: 'You have been signed out.' })
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
                    <div className="brand-badge">🌸 Sakhi</div>
                    <h2>{user ? 'You are signed in' : 'Empowering Women. Creating Opportunities.'}</h2>
                    <p>
                        {user
                            ? `Signed in as ${user.email || 'your account'}.`
                            : 'Join thousands of women who are learning new skills, discovering meaningful careers, accessing government support, and becoming part of a safe, supportive community.'}
                    </p>

                    <div className="feature-list">
                        <div className="feature-pill">
                            <span className="feature-icon">💼</span>
                            <span>Career Opportunities</span>
                        </div>
                        <div className="feature-pill">
                            <span className="feature-icon">🎓</span>
                            <span>Sakhi Academy</span>
                        </div>
                        <div className="feature-pill">
                            <span className="feature-icon">📜</span>
                            <span>Government Schemes</span>
                        </div>
                        <div className="feature-pill">
                            <span className="feature-icon">🤝</span>
                            <span>Community & Safety</span>
                        </div>
                    </div>

                    <div className="stats-grid" aria-label="Sakhi highlights">
                        <div className="stat-pill">
                            <strong>10,000+</strong>
                            <span>Women Empowered</span>
                        </div>
                        <div className="stat-pill">
                            <strong>500+</strong>
                            <span>Learning Resources</span>
                        </div>
                        <div className="stat-pill">
                            <strong>2,000+</strong>
                            <span>Career Opportunities</span>
                        </div>
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
