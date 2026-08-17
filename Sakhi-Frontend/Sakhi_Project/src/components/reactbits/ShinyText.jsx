import './ShinyText.css';

export function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = '',
  children
}) {
  return (
    <span
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={{ animationDuration: `${speed}s` }}
    >
      {text || children}
    </span>
  );
}
