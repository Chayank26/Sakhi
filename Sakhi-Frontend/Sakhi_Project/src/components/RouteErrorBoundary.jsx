import { Component } from 'react';

export class RouteErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="route-loading" role="alert"><h1>This page couldn’t load.</h1><p>Check your connection and try again.</p><button type="button" onClick={() => window.location.reload()}>Reload page</button><a href="/home">Back to Sakhi</a></main>;
    return this.props.children;
  }
}
