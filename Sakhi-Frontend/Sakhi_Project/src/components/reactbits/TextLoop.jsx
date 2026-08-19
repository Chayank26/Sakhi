import React from 'react';
import './TextLoop.css';

export function TextLoop({
  items = [],
  speed = 25,
  direction = 'left',
  className = ''
}) {
  // Triplicate array for seamless infinite marquee loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className={`text-loop-container ${className}`}>
      <div
        className="text-loop-track"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal'
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div key={index} className="text-loop-item">
            <span className="text-loop-text">{item}</span>
            <span className="text-loop-separator">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
