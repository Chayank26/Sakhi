import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { FiArrowRight, FiUserCheck, FiUserPlus, FiCompass } from 'react-icons/fi'
import { DepthCarousel } from '../../reactbits/DepthCarousel'
import { auth } from '../firebase/firebase'
import './LandingPage.css'

export function LandingPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/home', { replace: true })
            }
        })
        return () => unsubscribe()
    }, [navigate])

    const handleCardClick = () => {
        navigate('/login?mode=signup')
    }

    return (
        <div className="landing-page-shell">
            {/* Top Navigation Bar */}
            <header className="landing-topbar">
                <Link className="landing-brand" to="/">
                    sakhi
                </Link>
                <div className="landing-nav-actions">
                    <Link className="uiverse-nav-btn secondary" to="/login?mode=login">
                        <FiUserCheck /> Sign In
                    </Link>
                    <Link className="uiverse-nav-btn primary" to="/login?mode=signup">
                        <FiUserPlus /> Sign Up
                    </Link>
                </div>
            </header>

            {/* Main Hero Stage */}
            <main className="landing-hero-stage">
                <div className="landing-hero-header">
                    <div className="landing-eyebrow-pill">
                        <FiCompass /> <span>Empowering Women Across India</span>
                    </div>
                    <h1 className="landing-hero-headline">
                        Ready to start your journey with Sakhi?
                    </h1>
                    <p className="landing-hero-subtitle">
                        Sakhi is an all-in-one platform designed to empower women by connecting you directly to verified job opportunities, free certified learning courses, government welfare schemes, and 24/7 AI career guidance.
                    </p>
                </div>

                {/* 3D Depth Carousel of Sakhi Core Features */}
                <div className="landing-depth-carousel-wrapper">
                    <DepthCarousel autoPlay={true} interval={4500} onCardClick={handleCardClick} />
                </div>

                {/* Action CTAs */}
                <div className="landing-cta-row">
                    <Link className="uiverse-hero-btn primary" to="/login?mode=signup">
                        <span>Get Started — Sign Up</span>
                        <FiArrowRight className="btn-arrow-icon" />
                    </Link>
                    <Link className="uiverse-hero-btn secondary" to="/login?mode=login">
                        <span>Sign In to Account</span>
                    </Link>
                </div>
            </main>
        </div>
    )
}
