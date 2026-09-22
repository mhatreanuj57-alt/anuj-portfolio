import { useMemo, useState } from 'react';
import './RoleScanner.css';

const PROOF_CATALOG = [
    { skill: 'React', terms: ['react', 'react.js', 'reactjs'], project: 'Anuj 3D Portfolio', proof: 'Interactive room system, Carousel Lab, and Live Projects launcher.', live: 'https://anujmhatre.me', repo: 'https://github.com/mhatreanuj57-alt/anuj-portfolio' },
    { skill: 'Three.js / 3D web', terms: ['three.js', 'threejs', 'react three fiber', 'r3f', 'webgl', '3d'], project: 'Anuj 3D Portfolio', proof: 'A production interactive portfolio built with React Three Fiber.', live: 'https://anujmhatre.me', repo: 'https://github.com/mhatreanuj57-alt/anuj-portfolio' },
    { skill: 'Next.js / TypeScript', terms: ['next.js', 'nextjs', 'typescript'], project: 'UrbanLens AI', proof: 'Civic-intelligence frontend for Navi Mumbai.', live: 'https://urban-lens-seven.vercel.app', repo: 'https://github.com/a18-n03/Urban-Lens' },
    { skill: 'FastAPI / APIs', terms: ['fastapi', 'rest api', 'restful', 'api development', 'backend api'], project: 'UrbanLens AI', proof: 'FastAPI and Pydantic API layer for civic reports.', live: 'https://urban-lens-seven.vercel.app', repo: 'https://github.com/a18-n03/Urban-Lens' },
    { skill: 'PostgreSQL / PostGIS', terms: ['postgresql', 'postgres', 'postgis', 'geospatial', 'gis'], project: 'UrbanLens AI', proof: 'Spatial reporting and incident data are designed around PostgreSQL 16 + PostGIS.', live: 'https://urban-lens-seven.vercel.app', repo: 'https://github.com/a18-n03/Urban-Lens' },
    { skill: 'Computer vision', terms: ['computer vision', 'yolo', 'opencv', 'pytorch', 'image detection', 'object detection'], project: 'UrbanLens AI', proof: 'Road-photo detection stack using YOLO, PyTorch, and OpenCV.', live: 'https://urban-lens-seven.vercel.app', repo: 'https://github.com/a18-n03/Urban-Lens' },
    { skill: 'Embeddings / multimodal AI', terms: ['clip', 'siglip', 'embeddings', 'multimodal', 'semantic search'], project: 'UrbanLens AI', proof: 'CLIP / SigLIP embeddings support duplicate and similarity workflows.', live: 'https://urban-lens-seven.vercel.app', repo: 'https://github.com/a18-n03/Urban-Lens' },
    { skill: 'Machine learning', terms: ['machine learning', 'ml', 'lightgbm', 'prediction', 'predictive model'], project: 'House Price Finder', proof: 'Locality-level price estimates with a client-side LightGBM model and validation diagnostics.', live: 'https://navi-mumbai-house-price-prediction-26wdhvjsm.vercel.app', repo: 'https://github.com/a18-n03/navi-mumbai-house-price-prediction' },
    { skill: 'Maps / location products', terms: ['maps', 'maplibre', 'openstreetmap', 'location', 'mapping'], project: 'UrbanLens AI', proof: 'Incident mapping with MapLibre GL and OpenStreetMap.', live: 'https://urban-lens-seven.vercel.app', repo: 'https://github.com/a18-n03/Urban-Lens' },
    { skill: 'Data visualisation', terms: ['data visualization', 'data visualisation', 'charts', 'dashboard', 'analytics'], project: 'House Price Finder', proof: 'Interactive price bands, predicted-vs-actual scatter plots, and error diagnostics.', live: 'https://navi-mumbai-house-price-prediction-26wdhvjsm.vercel.app', repo: 'https://github.com/a18-n03/navi-mumbai-house-price-prediction' },
];

const NOT_YET_PROVEN = ['aws', 'kubernetes', 'graphql', 'angular', 'vue', 'java', 'c#', '.net', 'php', 'ruby', 'golang', 'swift', 'flutter'];
const EXAMPLE = 'Frontend engineer: React, TypeScript, data visualisation, REST APIs, and experience building AI products.';

const containsTerm = (text, term) => text.includes(term);

const RoleScanner = ({ onClose }) => {
    const [jobDescription, setJobDescription] = useState('');
    const normalised = jobDescription.toLowerCase();
    const { matches, gaps } = useMemo(() => ({
        matches: PROOF_CATALOG.filter((item) => item.terms.some((term) => containsTerm(normalised, term))),
        gaps: NOT_YET_PROVEN.filter((term) => containsTerm(normalised, term)),
    }), [normalised]);
    const hasText = jobDescription.trim().length > 0;

    return <section className="role-scanner" aria-label="Evidence-based role scanner">
        <div className="role-scanner__shell">
            <header className="role-scanner__header">
                <div><span className="role-scanner__eyebrow">EVIDENCE-ONLY ROLE SCANNER</span><h1>Does the work prove the fit?</h1><p>Paste a real job description. This tool only matches against documented project evidence and live builds.</p></div>
                <button className="role-scanner__close" onClick={onClose} aria-label="Close role scanner">×</button>
            </header>

            <div className="role-scanner__input-wrap">
                <label htmlFor="role-description">JOB DESCRIPTION / REQUIREMENTS</label>
                <textarea id="role-description" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the role requirements here…" />
                <div className="role-scanner__input-actions"><button onClick={() => setJobDescription(EXAMPLE)}>Try a real example</button><span>Local keyword evidence match · no AI score claimed</span></div>
            </div>

            {!hasText ? <div className="role-scanner__empty"><strong>What this scanner checks</strong><p>It looks only for technologies and capabilities already documented in the projects below. Paste a job description to compare it.</p><div className="role-scanner__catalog">{PROOF_CATALOG.map((item) => <span key={item.skill}>{item.skill}</span>)}</div></div> : <div className="role-scanner__results">
                <div className="role-scanner__result-summary"><span>VERIFIED EVIDENCE FOUND</span><strong>{matches.length}</strong><p>{matches.length ? 'Each result links to a live product and its source repository.' : 'No documented evidence matched these recognised requirements yet.'}</p></div>
                <div className="role-scanner__proofs">
                    {matches.map((item) => <article className="role-scanner__proof" key={item.skill}><span>{item.skill}</span><h2>{item.project}</h2><p>{item.proof}</p><div><a href={item.live} target="_blank" rel="noreferrer">Live proof ↗</a><a href={item.repo} target="_blank" rel="noreferrer">Source ↗</a></div></article>)}
                    {!matches.length && <div className="role-scanner__no-match">No verified match. That does not mean the skill is absent—it means the current portfolio has no linked proof for it.</div>}
                </div>
                {gaps.length > 0 && <div className="role-scanner__gaps"><strong>Not yet proven in this portfolio:</strong>{gaps.map((gap) => <span key={gap}>{gap}</span>)}</div>}
            </div>}
        </div>
    </section>;
};

export default RoleScanner;
