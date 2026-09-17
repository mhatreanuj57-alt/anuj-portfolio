import { Component } from 'react';

export function ExperienceFallback() {
    return (
        <main className="experience-fallback">
            <h1>Anuj Mhatre</h1>
            <p>The 3D experience could not load on this browser. You can still explore my work and get in touch.</p>
            <a href="/start">Open the lightweight portfolio</a>
            <a href="https://github.com/anu-mhatre-1812">Browse my projects on GitHub</a>
            <a href="mailto:anujmhatre125@gmail.com">Email Anuj</a>
            <button type="button" onClick={() => window.location.reload()}>Try the 3D experience again</button>
        </main>
    );
}

export default class ExperienceBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? <ExperienceFallback /> : this.props.children; }
}
