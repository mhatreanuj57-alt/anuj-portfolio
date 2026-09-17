import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ExperienceBoundary from './components/ui/ExperienceBoundary.jsx'

// --- Console Signature ---
if (typeof window !== 'undefined') {
  console.log(
    '%c ANUJ %c PORTFOLIO %c',
    'background: #111; color: #fff; padding: 5px 10px; font-weight: bold; border-radius: 3px 0 0 3px;',
    'background: #dc143c; color: #fff; padding: 5px 10px; font-weight: bold; border-radius: 0 3px 3px 0;',
    'background: transparent'
  );
}


// The live accessible UI replaces the static no-JavaScript content.
document.getElementById('seo-content')?.setAttribute('inert', '');
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ExperienceBoundary><App /></ExperienceBoundary>
  </StrictMode>,
)
