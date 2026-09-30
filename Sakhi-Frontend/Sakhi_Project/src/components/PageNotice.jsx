export function PageNotice({ children, onRetry }) {
  return <div className="page-feedback" role="alert">
    <p>{children}</p>
    {onRetry && <button type="button" className="sakhi-btn sakhi-btn-secondary" onClick={onRetry}>Retry</button>}
  </div>;
}
