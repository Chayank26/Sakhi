import { useEffect, useState } from 'react';
import './BlurText.css';

export function BlurText({
  text = '',
  delay = 150,
  className = '',
  animateBy = 'words', // 'words' or 'letters'
}) {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if (!text) return;
    const splitElements = animateBy === 'words' ? text.split(' ') : text.split('');
    setElements(splitElements);
  }, [text, animateBy]);

  return (
    <span className={`blur-text-container ${className}`}>
      {elements.map((word, index) => (
        <span
          key={index}
          className="blur-text-element"
          style={{
            animationDelay: `${index * delay}ms`,
          }}
        >
          {word}{animateBy === 'words' ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}
