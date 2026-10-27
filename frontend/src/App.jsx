import { useState } from 'react';
import { Sprout, CloudRain, ShieldCheck, CheckCircle2, XCircle, Activity, ExternalLink } from 'lucide-react';

const API = 'http://127.0.0.1:8000';

export default function App() {
  const [form, setForm] = useState({ cooperative: 'Coopérative Démo', crop: 'manioc', zone: 'Estuaire', rainfall_mm: 110, soil_drainage: 'unknown' });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const update = (e) => setForm({...form, [e.target.name]: e.target.value});
  async function analyze(e) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const res = await fetch(`${API}/api/analyze`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, rainfall_mm:Number(form.rainfall_mm)})});
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (err) { setMessage('API indisponible. Vérifie que le backend tourne sur le port 8000.'); }
    finally { setBusy(false); }
  }
  async function decide(decision) {
    if (!result?.advisory?.id) return;
    try {
      const res = await fetch(`${API}/api/advisories/${result.advisory.id}/decision`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({decision, reviewer:'Conseiller de démonstration', note:'Décision prise pendant la démonstration.'})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      setResult({...result, advisory:data});
      setMessage(decision === 'approve' ? 'Avis approuvé par le conseiller.' : 'Avis rejeté par le conseiller.');
    } catch(err) { setMessage(err.message); }
  }
  const riskLabel = {low:'Faible', moderate:'Modéré', high:'Élevé'};
  return <div className="shell">
    <header className="topbar">
      <div className="brand"><div className="brandIcon"><Sprout size={23}/></div><div><strong>AgroPilot <span>AI</span></strong><small>Copilote de décision agricole · Gabon</small></div></div>
      <div className="demoTag">MODE DÉMONSTRATION</div>
    </header>
    <main>
      <section className="hero">
        <div className="eyebrow">AGRICULTURE & SÉCURITÉ ALIMENTAIRE</div>
        <h1>Des données agricoles à une décision <em>mieux éclairée.</em></h1>
        <p>Un agent IA rassemble les informations, analyse un scénario et prépare un avis. Le conseiller agricole garde la décision finale.</p>
        <div className="heroNote"><ShieldCheck size={18}/> Validation humaine obligatoire</div>
      </section>
      <div className="layout">
        <section className="panel">
          <div className="panelHead"><div><span className="step">01 / DEMANDE</span><h2>Analyser une situation</h2></div><Sprout size={22}/></div>
          <form onSubmit={analyze}>
            <label>Coopérative<input name="cooperative" value={form.cooperative} onChange={update}/></label>
            <div className="two">
              <label>Culture<select name="crop" value={form.crop} onChange={update}><option value="manioc">Manioc</option><option value="banane plantain">Banane plantain</option></select></label>
              <label>Zone<input name="zone" value={form.zone} onChange={update}/></label>
            </div>
            <label>Cumul de pluie du scénario (mm)<input type="number" min="0" max="1000" name="rainfall_mm" value={form.rainfall_mm} onChange={update}/><small>Valeur de scénario, pas une mesure météo en direct.</small></label>
            <label>Drainage du sol<select name="soil_drainage" value={form.soil_drainage} onChange={update}><option value="unknown">Inconnu</option><option value="good">Bon</option><option value="poor">Faible</option></select></label>
            <button className="primary" disabled={busy}>{busy ? 'Analyse en cours…' : 'Lancer l’analyse'} <Activity size={17}/></button>
          </form>
          <p className="disclaimer">Prototype : les données météo sont simulées et l'analyse utilise une heuristique explicable non validée agronomiquement.</p>
        </section>
        <section className="panel resultPanel">
          <div className="panelHead"><div><span className="step">02 / RÉSULTAT</span><h2>Avis de l’agent</h2></div><CloudRain size={22}/></div>
          {!result ? <div className="empty"><div className="emptyIcon"><Activity size={27}/></div><h3>En attente d’une demande</h3><p>Lance une analyse pour voir les données utilisées, le niveau de risque et le projet d’avis.</p></div> :
          <div className="results">
            <div className="riskCard"><span>Niveau de risque du scénario</span><strong className={`risk ${result.analysis.risk_level}`}>{riskLabel[result.analysis.risk_level]}</strong><small>{result.analysis.method}</small></div>
            <h3>Éléments pris en compte</h3>
            <ul>{result.analysis.reasons.map((r,i)=><li key={i}>{r}</li>)}</ul>
            <h3>Provenance des informations</h3>
            <ul>{result.advisory.sources.map((s,i)=><li key={i}>{s}</li>)}</ul>
            <div className="approval">
              <div className="approvalTop"><ShieldCheck size={20}/><div><strong>Validation humaine</strong><small>Statut : {({pending_review:'En attente',approved:'Approuvé',rejected:'Rejeté'})[result.advisory.status]}</small></div></div>
              {result.advisory.status === 'pending_review' ? <div className="actions"><button className="approve" onClick={()=>decide('approve')}><CheckCircle2 size={16}/> Approuver</button><button className="reject" onClick={()=>decide('reject')}><XCircle size={16}/> Rejeter</button></div> : <p className="decisionDone">Décision enregistrée par le conseiller.</p>}
            </div>
          </div>}
          {message && <div className="message">{message}</div>}
        </section>
      </div>
      <footer><span>AgroPilot AI · Prototype hackathon</span><span>Données de démonstration <ExternalLink size={13}/></span></footer>
    </main>
  </div>
}
