import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiStar, FiClock, FiArrowRight } from 'react-icons/fi';
import './CardSwap.css';

export function CardSwap({ items = [], onCardClick, autoPlay = false, interval = 5000 }) {
  const [cards, setCards] = useState(items);
  const [swapping, setSwapping] = useState(false);
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    setCards(items);
  }, [items]);

  useEffect(() => {
    if (!autoPlay || cards.length <= 1) return;
    const timer = setInterval(() => {
      handleSwapNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, cards]);

  const handleSwapNext = () => {
    if (swapping || cards.length <= 1) return;
    setDirection('next');
    setSwapping(true);

    setTimeout(() => {
      setCards((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setSwapping(false);
    }, 400);
  };

  const handleSwapPrev = () => {
    if (swapping || cards.length <= 1) return;
    setDirection('prev');
    setSwapping(true);

    setTimeout(() => {
      setCards((prev) => {
        const last = prev[prev.length - 1];
        const rest = prev.slice(0, prev.length - 1);
        return [last, ...rest];
      });
      setSwapping(false);
    }, 400);
  };

  if (!cards || cards.length === 0) return null;

  // Calculate dynamic 1-indexed count of top active card relative to items prop
  const topCard = cards[0];
  const topOriginalIndex = items.findIndex((item) => (item.id || item) === (topCard?.id || topCard));
  const activeDisplayNum = topOriginalIndex !== -1 ? topOriginalIndex + 1 : 1;

  // Vertical offset & scale per layer depth in the stack (straight aligned)
  const stackTransforms = [
    { translateY: 0, scale: 1 },
    { translateY: 14, scale: 0.96 },
    { translateY: 28, scale: 0.92 },
    { translateY: 42, scale: 0.88 }
  ];

  return (
    <div className="card-swap-wrapper">
      <div className="card-swap-container">
        <div className="card-swap-stack">
          {cards.slice(0, 4).map((card, index) => {
            const isTop = index === 0;
            const isAnimating = isTop && swapping;
            const transformConfig = stackTransforms[index] || stackTransforms[3];

            return (
              <div
                key={card.id || index}
                className={`swap-card level-${index} ${isAnimating ? `animating-${direction}` : ''}`}
                style={{
                  zIndex: 10 - index,
                  transform: `translateY(${transformConfig.translateY}px) scale(${transformConfig.scale})`,
                  opacity: index < 3 ? 1 - index * 0.15 : 0
                }}
                onClick={() => {
                  if (isTop) {
                    if (onCardClick) onCardClick(card);
                  } else {
                    handleSwapNext();
                  }
                }}
              >
                <div className="swap-card-image-box">
                  <img src={card.image} alt={card.title} />
                  <div className="swap-card-overlay" />
                  <span className="swap-badge">{card.badge || 'Featured'}</span>
                </div>

                <div className="swap-card-content">
                  <div className="swap-tags">
                    {card.category && <span className="swap-tag-cat">{card.category}</span>}
                    {card.difficulty && <span className="swap-tag-diff">{card.difficulty}</span>}
                  </div>

                  <h3 className="swap-title">{card.title}</h3>
                  {card.instructor && (
                    <p className="swap-instructor">Instructor: <strong>{card.instructor}</strong></p>
                  )}

                  <div className="swap-metrics">
                    <span className="swap-metric"><FiStar className="star-icon" /> {card.rating || 4.9}</span>
                    <span className="swap-metric"><FiClock /> {card.duration || 'Self-Paced'}</span>
                  </div>

                  <div className="swap-card-actions">
                    <button type="button" className="btn-swap-explore">
                      Explore Course <FiArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar */}
      <div className="card-swap-controls">
        <button type="button" onClick={handleSwapPrev} className="swap-nav-btn" aria-label="Previous Course">
          <FiChevronLeft />
        </button>

        <span className="swap-counter-text">
          Featured Course {activeDisplayNum} of {items.length}
        </span>

        <button type="button" onClick={handleSwapNext} className="swap-nav-btn" aria-label="Next Course">
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
