import './App.css'
import { Activity, ArrowRight, BrainCircuit, Database, Mic2, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const modules = [
  { id: 'C1', title: 'Baseline', description: 'Warm-up and personal calibration', detail: 'Capture a reference profile before the interview begins.', icon: Activity, path: '/baseline', tone: 'blue' },
  { id: 'C2', title: 'Interview', description: 'Questions, answers and evidence', detail: 'Run an adaptive interview with explainable scoring.', icon: Mic2, path: '/interview', tone: 'coral' },
  { id: 'C3', title: 'Coaching', description: 'Feedback and progress signals', detail: 'Turn multimodal observations into practical next steps.', icon: BrainCircuit, path: '/coaching', tone: 'green' },
  { id: 'C4', title: 'Synthesis', description: 'Research and model jobs', detail: 'Inspect datasets, calibration jobs and generated reports.', icon: Database, path: '/synthesis', tone: 'yellow' },
]

function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/"><span className="brand-mark"><Sparkles size={18} /></span><span>Interview Coach</span></Link>
        <span className="status"><span className="status-dot" /> research workspace</span>
      </header>
      <section className="hero">
        <div className="eyebrow"><SlidersHorizontal size={15} /> multimodal explainable ai</div>
        <h1>Calibrate the conversation.<br /><em>Understand the signal.</em></h1>
        <p className="intro">A modular workspace for emotion-aware interviews, personalized baselines, and grounded coaching feedback.</p>
      </section>
      <section className="module-grid" aria-label="Interview coach modules">
        {modules.map(({ id, title, description, detail, icon: Icon, path, tone }) => (
          <Link className={`module-card ${tone}`} to={path} key={id}>
            <div className="module-top"><span className="module-id">{id}</span><Icon size={21} strokeWidth={1.8} /></div>
            <div><h2>{title}</h2><p>{description}</p></div>
            <div className="module-footer"><span>{detail}</span><ArrowRight size={18} /></div>
          </Link>
        ))}
      </section>
      <footer className="footer"><span>01 / 04 modules ready</span><span>frontend / react + vite + typescript</span></footer>
    </main>
  )
}

export default App
