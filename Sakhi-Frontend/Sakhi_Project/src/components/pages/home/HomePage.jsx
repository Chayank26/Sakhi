import { Link } from 'react-router-dom'
import { HomeHeader } from './HomeHeader'
import './HomePage.css'

const featureCards = [
    {
        icon: '💼',
        title: 'Career Opportunities',
        description: 'Browse jobs, internships, and career opportunities designed to help women grow professionally.',
        to: '/jobs',
    },
    {
        icon: '🎓',
        title: 'Sakhi Academy',
        description: 'Learn through free courses, skill-building programs, and practical resources.',
        to: '/academy',
    },
    {
        icon: '📜',
        title: 'Government Schemes',
        description: 'Discover scholarships, financial assistance, and government initiatives tailored to your needs.',
        to: '/schemes',
    },
    {
        icon: '🤝',
        title: 'Community',
        description: 'Connect with other women, share experiences, ask questions, and grow together in a supportive environment.',
        to: '/home/community',
    },
]

export function HomePage() {
    return (
        <div className="home-page-shell">
            <HomeHeader />

            <main className="home-hero">
                <section className="home-hero-content">
                    <h1>Empowering Women, Creating Opportunities.</h1>
                    <p>
                        Sakhi is a platform where women can learn new skills, discover meaningful
                        careers, access government support, connect with a trusted community, and
                        receive guidance through AI.
                    </p>

                    <div className="feature-grid">
                        {featureCards.map((card) => (
                            <Link className="feature-card" key={card.title} to={card.to}>
                                <span className="feature-icon">{card.icon}</span>
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                            </Link>
                        ))}
                    </div>

                    <Link className="ai-cta" to="/home/ai">
                        <span className="ai-icon">🤖</span>
                        <div>
                            <strong>Ask Sakhi AI</strong>
                            <p>Get instant guidance, career advice, and answers to your questions.</p>
                        </div>
                    </Link>
                </section>
            </main>
        </div>
    )
}
