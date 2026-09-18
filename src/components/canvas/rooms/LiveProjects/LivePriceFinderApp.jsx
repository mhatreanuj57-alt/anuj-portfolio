import { useEffect, useMemo, useState } from 'react';
import './LivePriceFinderApp.css';

const PROJECT_URL = 'https://navi-mumbai-house-price-prediction-26wdhvjsm.vercel.app';
const LOCATION_GROUPS = {
    'Navi Mumbai / NMMC': ['Airoli', 'Vashi', 'Sanpada', 'Koparkhairane', 'Ghansoli', 'Nerul', 'Belapur'],
    'Panvel Municipal Corporation': ['Panvel City', 'New Panvel', 'Kamothe', 'Khandeshwar', 'Kharghar', 'Kalamboli', 'Taloja', 'Ulwe'],
    'Mumbai / BMC': ['Colaba', 'Dadar', 'Bandra', 'Andheri', 'Malad', 'Borivali', 'Kurla', 'Chembur', 'Ghatkopar', 'Mulund'],
    'Thane / TMC': ['Thane City', 'Panchpakhadi', 'Ghodbunder Road', 'Kalwa', 'Mumbra', 'Diva'],
    'KDMC': ['Kalyan East', 'Kalyan West', 'Dombivli', 'Thakurli', 'Titwala'],
    'MBMC': ['Mira Road', 'Bhayandar East', 'Bhayandar West'],
    'VVMC': ['Naigaon', 'Vasai Road', 'Nalasopara', 'Virar'],
    'UMC': ['Ulhasnagar', 'Vitthalwadi'],
    'Raigad / Rural Council': ['Shahapur', 'Vasind', 'Asangaon', 'Karjat', 'Khopoli', 'Badlapur', 'Ambernath'],
    'Uran Taluka, Raigad': ['Uran', 'Chirner', 'Dronagiri', 'Jasai', 'Bokadvira', 'Karal', 'Koproli', 'Navghar', 'Chikhal Dongari'],
};
const MODEL_GROUP = {
    'Navi Mumbai / NMMC': 'NMMC', 'Panvel Municipal Corporation': 'PMCP', 'Mumbai / BMC': 'BMC', 'Thane / TMC': 'TMC', KDMC: 'KDMC', MBMC: 'MBMC', VVMC: 'VVMC', UMC: 'UMC', 'Raigad / Rural Council': 'Raigad District', 'Uran Taluka, Raigad': 'Uran Taluka (Raigad)',
};
const modelLocality = (name) => ({ 'Panvel City': 'Panvel', 'Koparkhairane': 'Koper Khairane', 'Vasai Road': 'Vasai', 'Thane City': 'Thane' }[name] || name);
const money = (value) => value >= 10_000_000 ? `₹${(value / 10_000_000).toFixed(2)} Cr` : `₹${(value / 100_000).toFixed(1)} L`;

const estimate = (model, group, locality, sqft, bhk, isNew) => {
    if (!model || !Object.hasOwn(model.locality_priors, modelLocality(locality))) return null;
    const municipality = MODEL_GROUP[group];
    const mp = model.municipality_priors[municipality] ?? model.global_prior;
    const lp = model.locality_priors[modelLocality(locality)] ?? mp;
    const features = [Math.log1p(sqft), bhk, bhk, isNew ? 0 : 12, 10, lp, mp];
    let prediction = model.initial_prediction;
    model.trees.forEach((tree) => { let node = 0; while (tree[node][0] !== -1) { const [left, right, feature, threshold] = tree[node]; node = features[feature] <= threshold ? left : right; } prediction += model.learning_rate * tree[node][4]; });
    return Math.max(500000, Math.expm1(prediction));
};

const Metric = ({ value, label }) => <div className="lp-metric"><b>{value}</b><span>{label}</span></div>;
const findDiagnostics = (records, bhk, sqft, isNew) => {
    if (!records?.length) return [];
    const scored = records.map((record) => ({ record, score: Math.abs(record[2] - bhk) * 520 + Math.abs(record[3] - sqft) + (record[4] === Number(isNew) ? 0 : 380) }));
    return scored.sort((a, b) => a.score - b.score).slice(0, Math.min(60, scored.length)).map(({ record }) => record);
};

const quartile = (sorted, quantile) => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * quantile))];
const bandIndex = (value, thresholds) => value <= thresholds[0] ? 0 : value <= thresholds[1] ? 1 : value <= thresholds[2] ? 2 : 3;

const ConfusionMatrix = ({ records }) => {
    if (records.length < 4) return <div className="lp-chart-empty">No evaluated listings are available for this selection.</div>;
    const thresholds = [.25, .5, .75].map((q) => quartile(records.map(([actual]) => actual).sort((a, b) => a - b), q));
    const values = Array.from({ length: 4 }, () => Array(4).fill(0));
    records.forEach(([actual, predicted]) => { values[bandIndex(actual, thresholds)][bandIndex(predicted, thresholds)] += 1; });
    const max = Math.max(...values.flat());
    return <div className="lp-confusion" role="img" aria-label="Input-responsive price-band confusion matrix">
        <span /><span>Budget</span><span>Mid</span><span>Premium</span><span>Luxury</span>
        {values.flatMap((row, rowIndex) => [<span key={`row-${rowIndex}`} className="lp-confusion-label">{['Budget', 'Mid', 'Premium', 'Luxury'][rowIndex]}</span>, ...row.map((value, columnIndex) => <span key={`${rowIndex}-${columnIndex}`} className="lp-confusion-cell" style={{ backgroundColor: `rgba(8, 150, 108, ${.12 + value / max * .88})`, color: value / max > .55 ? '#fff' : '#075c45' }}>{value}</span>)])}
    </div>;
};

const ScatterPlot = ({ records }) => {
    if (!records.length) return <div className="lp-chart-empty">No evaluated listings are available for this selection.</div>;
    const chart = records.map(([actual, predicted]) => [actual / 100_000, predicted / 100_000]);
    const max = Math.max(...chart.flat()) * 1.06;
    return <svg className="lp-chart" viewBox="0 0 360 190" role="img" aria-label="Input-responsive predicted versus actual price scatter plot">
    <line x1="38" y1="159" x2="330" y2="18" className="lp-diagonal" /><line x1="38" y1="159" x2="330" y2="159" className="lp-axis" /><line x1="38" y1="159" x2="38" y2="18" className="lp-axis" />
    {chart.map(([actual, predicted], index) => <circle key={index} cx={38 + actual / max * 292} cy={159 - predicted / max * 141} r="3.1" className="lp-dot" />)}
    <text x="184" y="185" textAnchor="middle">Actual price (₹ lakh)</text><text x="13" y="90" textAnchor="middle" transform="rotate(-90 13 90)">Predicted price</text>
</svg>;
};

const ErrorHistogram = ({ records }) => {
    if (!records.length) return <div className="lp-chart-empty">No evaluated listings are available for this selection.</div>;
    const errors = records.map(([actual, predicted]) => (predicted - actual) / 100_000);
    const extent = Math.max(1, ...errors.map((value) => Math.abs(value))) * 1.08;
    const bins = Array(20).fill(0);
    errors.forEach((value) => { bins[Math.min(19, Math.max(0, Math.floor((value + extent) / (extent * 2) * 20)))] += 1; });
    const max = Math.max(...bins, 1);
    return <svg className="lp-chart" viewBox="0 0 360 190" role="img" aria-label="Input-responsive error distribution histogram">
    <line x1="38" y1="159" x2="330" y2="159" className="lp-axis" /><line x1="38" y1="159" x2="38" y2="18" className="lp-axis" /><line x1="177" y1="19" x2="177" y2="159" className="lp-zero" />
    {bins.map((count, index) => <rect key={index} x={40 + index * 14.4} y={159 - count / max * 132} width="11" height={count / max * 132} rx="2" className="lp-bar" />)}
    <text x="184" y="185" textAnchor="middle">Residual error (₹ lakh)</text><text x="183" y="30" textAnchor="middle" className="lp-zero-label">0</text>
</svg>;
};

export default function LivePriceFinderApp() {
    const [tab, setTab] = useState('finder');
    const [model, setModel] = useState(null);
    const [group, setGroup] = useState('Panvel Municipal Corporation');
    const [locality, setLocality] = useState('Kharghar');
    const [search, setSearch] = useState('');
    const [bhk, setBhk] = useState(2);
    const [sqft, setSqft] = useState(720);
    const [isNew, setIsNew] = useState(true);
    useEffect(() => { fetch('/data/mmr-price-model.json').then((r) => r.json()).then(setModel).catch(() => setModel(false)); }, []);
    const price = useMemo(() => estimate(model, group, locality, sqft, bhk, isNew), [model, group, locality, sqft, bhk, isNew]);
    const localities = LOCATION_GROUPS[group];
    const direct = Boolean(model?.locality_priors?.[modelLocality(locality)]);
    const matches = localities.filter((name) => name.toLowerCase().includes(search.toLowerCase()));
    const unavailable = model === false ? 'Model unavailable' : model ? 'Insufficient data' : 'Loading…';
    const ladder = [1, 2, 3, 4, 5].map((rooms) => estimate(model, group, locality, Math.round(sqft * (0.58 + rooms * .24)), rooms, isNew));
    const diagnostics = useMemo(() => findDiagnostics(model?.validation?.[modelLocality(locality)], bhk, sqft, isNew), [model, locality, bhk, sqft, isNew]);
    const changeGroup = (event) => { const next = event.target.value; setSearch(''); setGroup(next); setLocality(LOCATION_GROUPS[next][0]); };
    return <main className="live-price-app" onPointerDown={(event) => event.stopPropagation()}>
        <section className="lp-hero"><h1>🏠 Navi Mumbai / BMC House Price Finder</h1><p>Instant locality-level estimates, price comparisons, mapping and model transparency.</p></section>
        <nav className="lp-tabs"><button className={tab === 'finder' ? 'active' : ''} onClick={() => setTab('finder')}>🏠 Price Finder</button><button className={tab === 'insights' ? 'active' : ''} onClick={() => setTab('insights')}>🔎 Model Insights</button></nav>
        {tab === 'finder' ? <section>
            <div className="lp-grid">
                <div className="lp-card lp-controls">
                    <div className="lp-row"><label>Property region<select value={group} onChange={changeGroup}>{Object.keys(LOCATION_GROUPS).map((name) => <option key={name}>{name}</option>)}</select></label><label>Search locality<input placeholder="Search locality…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
                    <label>Locality<select value={locality} onChange={(event) => setLocality(event.target.value)}>{!matches.includes(locality) && <option value={locality}>{locality} (selected)</option>}{matches.map((name) => <option key={name}>{name}</option>)}</select></label>
                    <div className="lp-row"><label>Configuration<select value={bhk} onChange={(event) => setBhk(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} BHK</option>)}</select></label><label>Carpet area: {sqft} sq ft<input type="range" min="200" max="3000" step="10" value={sqft} onChange={(event) => setSqft(Number(event.target.value))} /></label></div>
                    <div className="lp-condition"><span>Property condition</span><label><input type="radio" checked={isNew} onChange={() => setIsNew(true)} /> New property</label><label><input type="radio" checked={!isNew} onChange={() => setIsNew(false)} /> Resale</label></div>
                </div>
                <div className="lp-card lp-price"><div className="lp-small">{bhk} BHK · {locality} · {isNew ? 'New' : 'Resale'}</div><h2>{price ? money(price) : unavailable}</h2><p>estimated market value</p><div className="lp-chips"><span>{price ? `₹${Math.round(price / sqft).toLocaleString('en-IN')}` : '—'} / sq ft</span><span>{sqft} sq ft carpet</span><span>± {model?.metrics ? money(model.metrics.holdout_mae_inr) : '—'} MAE</span></div>{!direct && <em>No verified training coverage for this locality. An estimate is unavailable.</em>}</div>
            </div>
            <div className="lp-lower">
                <div className="lp-card"><b>📍 Locality map</b><div className="lp-caption">Selected area within the MMR framework</div><iframe className="lp-map-frame" title={`Map of ${locality}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(`${locality}, ${group}, Maharashtra, India`)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
                <div className="lp-card"><b>📊 Price ladder</b><div className="lp-caption">Typical size and predicted value by configuration</div><div className="lp-bars">{ladder.map((value, index) => <div key={index}><i style={{ height: `${Math.max(8, Math.min(100, (value || 0) / Math.max(...ladder, 1) * 100))}%` }} /><span>{index + 1}BHK</span><small>{value ? money(value) : '—'}</small></div>)}</div></div>
            </div>
        </section> : <section className="lp-insights">
            <div className="lp-card"><b>Model insights</b><p>Client-side gradient-boosted model trained from public Mumbai property listings. The controls above update estimates in real time.</p><div className="lp-metrics"><Metric value={model?.rows?.toLocaleString() || '…'} label="cleaned training records" /><Metric value="10" label="MMR area frameworks" /><Metric value={model?.metrics ? money(model.metrics.holdout_mae_inr) : '…'} label="holdout MAE" /><Metric value={model?.metrics ? model.metrics.holdout_r2.toFixed(3) : '…'} label="holdout R²" /></div></div>
            <div className="lp-lower lp-diagnostics"><div className="lp-card"><b>Confusion matrix · price bands</b><div className="lp-caption">{diagnostics.length} real holdout listings closest to {locality}</div><ConfusionMatrix records={diagnostics} /></div><div className="lp-card"><b>Predicted vs actual</b><div className="lp-caption">{diagnostics.length} real holdout listings · {bhk} BHK · {sqft} sq ft</div><ScatterPlot records={diagnostics} /></div></div>
            <div className="lp-lower lp-diagnostics"><div className="lp-card"><b>Error distribution</b><div className="lp-caption">Actual prediction residuals for the current nearest listings</div><ErrorHistogram records={diagnostics} /></div><div className="lp-card"><b>Current estimate</b><p><strong>{locality}</strong> is currently selected. The diagnostics refresh using real holdout listings after each change to locality, BHK, carpet area, or property condition.</p><div className="lp-diagnostic-value">{price ? money(price) : unavailable}</div><button className="lp-open" onClick={() => window.open(PROJECT_URL, '_blank', 'noopener,noreferrer')}>Open original live project ↗</button></div></div>
        </section>}
    </main>;
}
