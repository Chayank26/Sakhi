import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiSearch, FiMic } from 'react-icons/fi'
import { HomeHeader } from './HomeHeader'
import { SpotlightCard } from '../../reactbits/SpotlightCard'
import { BlurText } from '../../reactbits/BlurText'
import './HomePage.css'

const featureCards = [
    {
        title: 'Career Opportunities',
        description: 'Browse verified job openings, flexible internships, and tech roles tailored for women.',
        to: '/jobs',
    },
    {
        title: 'Sakhi Academy',
        description: 'Master in-demand skills through structured online courses, hands-on tutorials, and certificates.',
        to: '/academy',
    },
    {
        title: 'Government Schemes',
        description: 'Discover central & state financial grants, entrepreneurship loans, and welfare benefits.',
        to: '/schemes',
    },
    {
        title: 'Community & Mentorship',
        description: 'Connect with supportive peer networks, share experiences, and access emergency helplines.',
        to: '/home/community',
    },
]

export function HomePage() {
    const navigate = useNavigate()
    const [prompt, setPrompt] = useState('')

    const handlePromptSubmit = (e) => {
        e.preventDefault()
        if (prompt.trim()) {
            navigate(`/ai?prompt=${encodeURIComponent(prompt.trim())}`, {
                state: { prompt: prompt.trim() }
            })
        }
    }

    return (
        <div className="home-page-shell dark-theme">
            <HomeHeader />

            <main className="home-hero">
                <section className="home-hero-content">
                    <h1 className="home-headline">
                        <BlurText text="Empowering Women. Creating Opportunities." delay={100} />
                    </h1>

                    {/* Hero Search / Prompt Input Bar */}
                    <form className="hero-ai-search-form" onSubmit={handlePromptSubmit}>
                        <div className="hero-ai-search-bar">
                            <FiSearch className="hero-search-icon" />
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ask Sakhi AI anything about careers, grants, or learning..."
                                className="hero-ai-input"
                            />
                            <button type="submit" className="hero-ai-mic-btn" aria-label="Send prompt to Sakhi AI">
                                <FiMic className="hero-mic-icon" />
                            </button>
                        </div>
                    </form>

                    <div className="feature-grid">
                        {featureCards.map((card) => (
                            <Link key={card.title} to={card.to} className="feature-card-link">
                                <SpotlightCard className="feature-card" spotlightColor="rgba(168, 85, 247, 0.22)">
                                    <div className="card-top-row">
                                        <h3>{card.title}</h3>
                                        <FiArrowRight className="card-arrow-icon" />
                                    </div>
                                    <p>{card.description}</p>
                                </SpotlightCard>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
