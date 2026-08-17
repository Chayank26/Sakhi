import { useState, useEffect } from 'react';
import { FiBriefcase, FiBookOpen, FiFileText, FiUsers, FiCpu, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './DepthCarousel.css';

const CARDS = [
  {
    id: 'ai',
    title: 'Sakhi AI Assistant',
    badge: 'Smart Guidance',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    description: 'Receive instant career guidance, personalized eligibility evaluations, and smart recommendations powered by Gemini AI.'
  },
  {
    id: 'careers',
    title: 'Career Opportunities',
    badge: 'Jobs Portal',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80',
    description: 'Discover verified software roles, flexible employment opportunities, and career matching designed specifically for women.'
  },
  {
    id: 'academy',
    title: 'Sakhi Academy',
    badge: 'Learning Hub',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80',
    description: 'Master in-demand tech skills through online courses, practical lessons, and recognized certifications.'
  },
  {
    id: 'schemes',
    title: 'Government Schemes',
    badge: 'Welfare & Grants',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&auto=format&fit=crop&q=80',
    description: 'Explore central and state government initiatives, financial assistance, micro-loans, and maternity benefits.'
  },
  {
    id: 'community',
    title: 'Community & Support',
    badge: 'Safe Space',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=80',
    description: 'Connect with supportive peer networks, share experiences, and access emergency helplines.'
  }
];

export function DepthCarousel({ autoPlay = true, interval = 4500 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % CARDS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
  };

  return (
    <div className="depth-carousel-wrapper">
      <div className="depth-carousel-stage">
        {CARDS.map((card, idx) => {
          let offset = idx - activeIndex;
          if (offset < -2) offset += CARDS.length;
          if (offset > 2) offset -= CARDS.length;

          const isCenter = offset === 0;

          let transformStyle = '';
          let opacity = 0;
          let zIndex = 0;

          if (isCenter) {
            transformStyle = 'translate3d(0, 0, 0) scale(1)';
            opacity = 1;
            zIndex = 10;
          } else if (offset === -1 || (offset === CARDS.length - 1 && idx === CARDS.length - 1)) {
            transformStyle = 'translate3d(-48%, 0, -140px) scale(0.85) rotateY(12deg)';
            opacity = 0.55;
            zIndex = 5;
          } else if (offset === 1 || (offset === -(CARDS.length - 1) && idx === 0)) {
            transformStyle = 'translate3d(48%, 0, -140px) scale(0.85) rotateY(-12deg)';
            opacity = 0.55;
            zIndex = 5;
          } else {
            transformStyle = 'translate3d(0, 0, -280px) scale(0.7)';
            opacity = 0;
            zIndex = 1;
          }

          return (
            <div
              key={card.id}
              className={`depth-card ${isCenter ? 'active' : ''}`}
              style={{
                transform: transformStyle,
                opacity,
                zIndex
              }}
              onClick={() => setActiveIndex(idx)}
            >
              {/* Full Photography Background */}
              <img src={card.image} alt={card.title} className="depth-card-bg-image" />
              <div className="depth-card-dark-overlay" />

              {/* Glassmorphism Content Panel */}
              <div className="depth-glass-panel">
                <div className="glass-header-row">
                  <span className="depth-card-badge">{card.badge}</span>
                </div>

                <div className="glass-body">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="depth-carousel-controls">
        <button type="button" onClick={handlePrev} className="depth-nav-btn" aria-label="Previous Feature">
          <FiChevronLeft />
        </button>

        <div className="depth-indicators">
          {CARDS.map((_, idx) => (
            <span
              key={idx}
              className={`indicator-dot ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>

        <button type="button" onClick={handleNext} className="depth-nav-btn" aria-label="Next Feature">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
