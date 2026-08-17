import { Link } from 'react-router-dom'
import { FiArrowRight, FiUserCheck, FiUserPlus } from 'react-icons/fi'
import { DepthCarousel } from '../../reactbits/DepthCarousel'
import { ShinyText } from '../../reactbits/ShinyText'
import './LandingPage.css'

export function LandingPage() {
    return (
        <div className="landing-page-shell dark-theme">
            {/* Top Navigation Bar */}
            <header className="landing-topbar">
                <Link className="landing-brand" to="/">
                    Sakhi
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
                    <h1 className="landing-hero-headline">
                        Ready to start your journey with Sakhi?
                    </h1>
                    <p className="landing-hero-subtitle">
                        Discover verified jobs, master new skills, explore government schemes, and connect with a supportive community.
                    </p>
                </div>

                {/* 3D Depth Carousel of Sakhi Core Features */}
                <div className="landing-depth-carousel-wrapper">
                    <DepthCarousel autoPlay={true} interval={4500} />
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

