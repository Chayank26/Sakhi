import { Link } from 'react-router-dom'
import { FiBriefcase, FiBookOpen, FiFileText, FiUsers, FiCpu, FiArrowRight } from 'react-icons/fi'
import { HomeHeader } from './HomeHeader'
import { SpotlightCard } from '../../reactbits/SpotlightCard'
import { BlurText } from '../../reactbits/BlurText'
import { ShinyText } from '../../reactbits/ShinyText'
import './HomePage.css'

const featureCards = [
    {
        icon: <FiBriefcase />,
        title: 'Career Opportunities',
        description: 'Browse verified job openings, internships, and tech opportunities tailored for women.',
        to: '/jobs',
    },
    {
        icon: <FiBookOpen />,
        title: 'Sakhi Academy',
        description: 'Master in-demand skills through online courses, hands-on tutorials, and certifications.',
        to: '/academy',
    },
    {
        icon: <FiFileText />,
        title: 'Government Schemes',
        description: 'Discover central & state financial grants, scholarships, and maternity assistance.',
        to: '/schemes',
    },
    {
        icon: <FiUsers />,
        title: 'Community & Safety',
        description: 'Connect with supportive peer networks, share experiences, and access emergency helplines.',
        to: '/home/community',
    },
]

export function HomePage() {
    return (
        <div className="home-page-shell">
            <HomeHeader />

            <main className="home-hero">
                <section className="home-hero-content">
                    <h1>
                        <BlurText text="Empowering Women, Creating Opportunities." delay={120} />
                    </h1>
                    <p>
                        Sakhi is a dedicated platform where women can learn new skills, discover meaningful
                        careers, access government welfare initiatives, connect with a safe community, and
                        receive guidance through AI.
                    </p>

                    <div className="feature-grid">
                        {featureCards.map((card) => (
                            <Link key={card.title} to={card.to} className="feature-card-link">
                                <SpotlightCard className="feature-card" spotlightColor="rgba(124, 58, 237, 0.18)">
                                    <div className="card-top-row">
                                        <span className="feature-icon">{card.icon}</span>
                                        <FiArrowRight className="card-arrow-icon" />
                                    </div>
                                    <h3>{card.title}</h3>
                                    <p>{card.description}</p>
                                </SpotlightCard>
                            </Link>
                        ))}
                    </div>

                    <Link className="ai-cta" to="/ai">
                        <span className="ai-icon"><FiCpu /></span>
                        <div>
                            <strong>
                                <ShinyText text="Ask Sakhi AI Assistant" speed={3.5} />
                            </strong>
                            <p>Get instant career guidance, eligibility evaluations, and smart recommendations.</p>
                        </div>
                    </Link>
                </section>
            </main>
        </div>
    )
}
