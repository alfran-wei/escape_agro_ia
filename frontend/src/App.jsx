
import { useState } from 'react';
import {
  Sprout, CloudRain, ShieldCheck, CheckCircle2, XCircle,
  Activity, ExternalLink, MessageCircle, ShoppingBasket,
  LayoutDashboard, Send, ArrowRight, Package, RefreshCw,
  Leaf, TrendingUp, Truck, CircleHelp
} from 'lucide-react';

const API = 'http://127.0.0.1:8000';

export default function App() {
  const [form, setForm] = useState({
    cooperative: 'Coopérative Démo',
    crop: 'manioc',
    zone: 'Estuaire',
    rainfall_mm: 110,
    soil_drainage: 'unknown'
  });

  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [activePage, setActivePage] = useState('dashboard');

  const [salesForm, setSalesForm] = useState({
    cooperative: 'Coopérative Démo',
    stock_kg: 500,
    harvest_age_days: 3,
    condition: 'bon',
    storage_conditions: 'ventilé',
    urgency: 'moyenne',
    target_sale_days: 7,
    constraints: 'Aucune précision'
  });

  const [salesResult, setSalesResult] = useState(null);
  const [salesBusy, setSalesBusy] = useState(false);
  const [salesMessage, setSalesMessage] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Bonjour ! Je suis votre assistant AgroPilot. Je peux vous orienter vers l’analyse agricole ou les recommandations commerciales. Que souhaitez-vous faire ?'
    }
  ]);
  const [chatStep, setChatStep] = useState(null);
  const [chatSalesDraft, setChatSalesDraft] = useState({});
  const [chatBusy, setChatBusy] = useState(false);

  const update = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const updateSales = (e) =>
    setSalesForm({
      ...salesForm,
      [e.target.name]: e.target.value
    });

  async function analyze(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          rainfall_mm: Number(form.rainfall_mm)
        })
      });

      if (!res.ok) throw new Error(await res.text());

      setResult(await res.json());
      setMessage('Analyse terminée. Consultez les résultats ci-dessous.');
    } catch (err) {
      setMessage(
        'API indisponible. Vérifiez que le backend fonctionne sur le port 8000.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function decide(decision) {
    if (!result?.advisory?.id) return;

    try {
      const res = await fetch(
        `${API}/api/advisories/${result.advisory.id}/decision`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision,
            reviewer: 'Conseiller de démonstration',
            note: 'Décision prise pendant la démonstration.'
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail || data)
        );
      }

      setResult({ ...result, advisory: data });
      setMessage(
        decision === 'approve'
          ? 'Avis approuvé par le conseiller.'
          : 'Avis rejeté par le conseiller.'
      );
    } catch (err) {
      setMessage(err.message || 'Impossible d’enregistrer la décision.');
    }
  }

  async function planSales(e) {
    e.preventDefault();
    setSalesBusy(true);
    setSalesMessage('');
    setSalesResult(null);

    try {
      const res = await fetch(`${API}/api/sales/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...salesForm,
          stock_kg: Number(salesForm.stock_kg),
          harvest_age_days: Number(salesForm.harvest_age_days),
          target_sale_days: Number(salesForm.target_sale_days)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail || data)
        );
      }

      setSalesResult(data);
      setSalesMessage('Évaluation du stock et plan commercial générés.');
    } catch (err) {
      setSalesMessage(
        err.message || 'Impossible de générer le plan commercial.'
      );
    } finally {
      setSalesBusy(false);
    }
  }

  function addChatMessage(role, text) {
  setChatMessages((previous) => [
    ...previous,
    { role, text }
  ]);
}

function startGuidedSale() {
  setChatStep('stock_kg');
  setChatSalesDraft({
    cooperative: salesForm.cooperative,
    constraints: salesForm.constraints
  });

  setChatMessages((previous) => [
    ...previous,
    {
      role: 'assistant',
      text: 'Préparons votre plan de vente. Quelle quantité de manioc avez-vous en stock, en kilogrammes ?'
    }
  ]);

  setActivePage('chat');
}

function handleChatShortcut(action) {
  if (action === 'sale') {
    startGuidedSale();
    return;
  }

  if (action === 'agriculture') {
    addChatMessage(
      'assistant',
      'Ouvrons l’analyse agricole pour examiner votre culture, la pluie et le drainage du sol.'
    );
    navigate('agriculture');
    return;
  }

  if (action === 'compare') {
    addChatMessage(
      'assistant',
      'La comparaison des marchés sera réalisée à partir du plan commercial retourné par le backend. Commençons par renseigner votre stock.'
    );
    startGuidedSale();
  }
}

async function handleGuidedSaleAnswer(answer) {
  const value = answer.trim();
  if (!value || !chatStep || chatBusy) return;

  addChatMessage('user', value);

  const steps = {
    stock_kg: {
      field: 'stock_kg',
      next: 'harvest_age_days',
      question: 'Depuis combien de jours le manioc a-t-il été récolté ?'
    },
    harvest_age_days: {
      field: 'harvest_age_days',
      next: 'condition',
      question: 'Comment décririez-vous son état ? Choisissez bon, douteux, dégradé ou inconnu.'
    },
    condition: {
      field: 'condition',
      next: 'storage_conditions',
      question: 'Comment le stock est-il conservé ? Par exemple : ventilé, à l’abri ou dans un espace humide.'
    },
    storage_conditions: {
      field: 'storage_conditions',
      next: 'urgency',
      question: 'Quel est le niveau d’urgence : faible, moyenne ou élevée ?'
    },
    urgency: {
      field: 'urgency',
      next: 'target_sale_days',
      question: 'Dans combien de jours souhaitez-vous vendre le stock ?'
    },
    target_sale_days: {
      field: 'target_sale_days',
      next: 'constraints',
      question: 'Avez-vous des contraintes particulières ? Par exemple : transport ou accès au marché. Sinon, répondez « aucune ».'
    },
    constraints: {
      field: 'constraints',
      next: 'review',
      question: ''
    }
  };

  const step = steps[chatStep];
  if (!step) return;

  let parsed = value;

  if (['stock_kg', 'harvest_age_days', 'target_sale_days'].includes(step.field)) {
    parsed = Number(value);

    if (!Number.isFinite(parsed) || !/^\d+$/.test(value)) {
      addChatMessage('assistant', 'Merci de saisir un nombre entier valide.');
      return;
    }

    if (
      (step.field === 'stock_kg' && (parsed < 1 || parsed > 1000000)) ||
      (step.field === 'harvest_age_days' && (parsed < 0 || parsed > 3650)) ||
      (step.field === 'target_sale_days' && (parsed < 0 || parsed > 365))
    ) {
      addChatMessage('assistant', 'Cette valeur est en dehors des limites autorisées. Vérifiez-la puis réessayez.');
      return;
    }
  }

  if (step.field === 'condition') {
    const normalized = value.toLowerCase();
    const allowed = ['bon', 'douteux', 'dégradé', 'degrade', 'inconnu'];

    if (!allowed.includes(normalized)) {
      addChatMessage('assistant', 'Choisissez parmi : bon, douteux, dégradé ou inconnu.');
      return;
    }

    parsed = normalized === 'dégradé' ? 'degrade' : normalized;
  }

  if (step.field === 'urgency') {
    const normalized = value.toLowerCase();
    const aliases = {
      faible: 'faible',
      moyenne: 'moyenne',
      moyen: 'moyenne',
      élevée: 'elevee',
      elevee: 'elevee',
      forte: 'elevee'
    };

    if (!aliases[normalized]) {
      addChatMessage('assistant', 'Choisissez une urgence faible, moyenne ou élevée.');
      return;
    }

    parsed = aliases[normalized];
  }

  if (step.field === 'constraints' && value.toLowerCase() === 'aucune') {
    parsed = 'Aucune précision';
  }

  const draft = {
    ...chatSalesDraft,
    [step.field]: parsed
  };

  setChatSalesDraft(draft);

  if (step.next === 'review') {
    setChatStep('review');

    addChatMessage(
      'assistant',
      `Voici le récapitulatif :\nStock : ${draft.stock_kg} kg\nÂge après récolte : ${draft.harvest_age_days} jour(s)\nÉtat : ${draft.condition}\nStockage : ${draft.storage_conditions}\nUrgence : ${draft.urgency}\nDélai de vente : ${draft.target_sale_days} jour(s)\nContraintes : ${draft.constraints}\n\nConfirmez-vous ces informations ? Répondez « confirmer » ou « annuler ».`
    );
    return;
  }

  setChatStep(step.next);
  addChatMessage('assistant', step.question);
}

async function submitGuidedSale() {
  if (chatBusy || chatStep !== 'review') return;

  setChatBusy(true);

  const payload = {
    cooperative: chatSalesDraft.cooperative || salesForm.cooperative,
    stock_kg: Number(chatSalesDraft.stock_kg),
    harvest_age_days: Number(chatSalesDraft.harvest_age_days),
    condition: chatSalesDraft.condition,
    storage_conditions: chatSalesDraft.storage_conditions,
    urgency: chatSalesDraft.urgency,
    target_sale_days: Number(chatSalesDraft.target_sale_days),
    constraints: chatSalesDraft.constraints || 'Aucune précision'
  };

  try {
    const res = await fetch(`${API}/api/sales/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        typeof data.detail === 'string'
          ? data.detail
          : JSON.stringify(data.detail || data)
      );
    }

    setSalesForm(payload);
    setSalesResult(data);
    setSalesMessage('Plan commercial généré depuis le chat.');
    setChatStep(null);

    addChatMessage(
      'assistant',
      'Le backend a retourné le plan commercial. Vous pouvez consulter les recettes estimées, le transport et les allocations proposées dans la section Recommandations commerciales.'
    );

    setActivePage('commerce');
  } catch (err) {
    addChatMessage(
      'assistant',
      `Je n’ai pas pu obtenir le plan commercial : ${err.message || 'erreur inconnue'}. Vérifiez le backend puis réessayez.`
    );
  } finally {
    setChatBusy(false);
  }
}

  function sendChat(e) {
    e.preventDefault();

    const text = chatInput.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    let reply =
      'Je peux vous orienter vers les fonctionnalités disponibles. Choisissez Analyse agricole pour examiner un scénario de culture, ou Recommandations commerciales pour évaluer un stock de manioc.';

    if (
      lower.includes('commercial') ||
      lower.includes('vente') ||
      lower.includes('vendre') ||
      lower.includes('stock') ||
      lower.includes('acheteur') ||
      lower.includes('prix')
    ) {
      reply =
        'Pour préparer une stratégie de vente, ouvrez Recommandations commerciales. Vous pourrez renseigner le stock, son état, l’urgence et le délai souhaité. Le système comparera ensuite les acheteurs fictifs disponibles.';
    } else if (
      lower.includes('pluie') ||
      lower.includes('risque') ||
      lower.includes('culture') ||
      lower.includes('manioc') ||
      lower.includes('agricole') ||
      lower.includes('sol')
    ) {
      reply =
        'Pour examiner une situation agricole, ouvrez Analyse agricole. Renseignez la culture, la zone, le scénario de pluie et le drainage du sol. Un avis sera préparé et devra être validé par un conseiller.';
    } else if (
      lower.includes('bonjour') ||
      lower.includes('salut') ||
      lower.includes('aide')
    ) {
      reply =
        'Bonjour ! Je peux vous aider à vous orienter. Souhaitez-vous analyser un risque agricole ou préparer la vente d’un stock ?';
    }

    setChatMessages((previous) => [
      ...previous,
      { role: 'user', text },
      { role: 'assistant', text: reply }
    ]);
    setChatInput('');
  }

  const riskLabel = {
    low: 'Faible',
    moderate: 'Modéré',
    high: 'Élevé'
  };

  const statusLabel = {
    pending_review: 'En attente de validation',
    approved: 'Approuvé',
    rejected: 'Rejeté'
  };

  const advisory = result?.advisory;
  const analysis = result?.analysis;
  const stockAssessment = salesResult?.stock_assessment;
  const salesPlan = salesResult?.sales_plan;

  const formatFCFA = (value) =>
    new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(Number(value || 0)) + ' FCFA';

  function navigate(page) {
    setActivePage(page);
    setMessage('');
    setSalesMessage('');
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon"><Sprout size={25} /></div>
          <div>
            <strong>AgroPilot <span>AI</span></strong>
            <small>Copilote agricole</small>
          </div>
        </div>

        <div className="sideLabel">ESPACE DE TRAVAIL</div>

        <nav className="sideNav">
          <button
            className={activePage === 'dashboard' ? 'navItem active' : 'navItem'}
            onClick={() => navigate('dashboard')}
          >
            <LayoutDashboard size={18} /> Vue d’ensemble
          </button>
          <button
            className={activePage === 'agriculture' ? 'navItem active' : 'navItem'}
            onClick={() => navigate('agriculture')}
          >
            <CloudRain size={18} /> Analyse agricole
          </button>
          <button
            className={activePage === 'commerce' ? 'navItem active' : 'navItem'}
            onClick={() => navigate('commerce')}
          >
            <ShoppingBasket size={18} /> Recommandations commerciales
          </button>
          <button
            className={activePage === 'chat' ? 'navItem active' : 'navItem'}
            onClick={() => navigate('chat')}
          >
            <MessageCircle size={18} /> Assistant AgroPilot
          </button>
        </nav>

        <div className="sidebarBottom">
          <div className="sidebarNote">
            <ShieldCheck size={19} />
            <strong>La décision reste humaine</strong>
            <p>Les avis générés doivent être examinés par un conseiller.</p>
          </div>
          <span className="demoLabel">MODE DÉMONSTRATION</span>
        </div>
      </aside>

      <div className="mainColumn">
        <header className="topbar">
          <div>
            <span className="topEyebrow">AGRICULTURE · GABON</span>
            <h2>
              {activePage === 'dashboard' && 'Vue d’ensemble'}
              {activePage === 'agriculture' && 'Analyse agricole'}
              {activePage === 'commerce' && 'Recommandations commerciales'}
              {activePage === 'chat' && 'Assistant AgroPilot'}
            </h2>
          </div>
          <div className="topStatus">
            <span className="statusDot" />
            Prototype actif
          </div>
        </header>

        <main className="workspace">
          {activePage === 'dashboard' && (
            <>
              <section className="welcomeBanner">
                <div className="welcomeContent">
                  <span className="welcomeTag"><Leaf size={14} /> VOTRE COPILOTE AGRICOLE</span>
                  <h1>Des décisions plus claires pour votre coopérative.</h1>
                  <p>
                    Analysez un scénario agricole, évaluez votre stock de manioc
                    et explorez des pistes commerciales au même endroit.
                  </p>
                  <button className="welcomeButton" onClick={() => navigate('agriculture')}>
                    Commencer une analyse <ArrowRight size={17} />
                  </button>
                </div>
                <div className="welcomeIllustration"><Sprout size={94} strokeWidth={1.2} /></div>
              </section>

              <div className="sectionHeading">
                <div>
                  <span className="sectionEyebrow">VOS OUTILS</span>
                  <h2>Que souhaitez-vous faire ?</h2>
                </div>
              </div>

              <div className="featureGrid">
                <button className="featureCard" onClick={() => navigate('agriculture')}>
                  <div className="featureIcon greenIcon"><CloudRain size={23} /></div>
                  <span className="featureNumber">01</span>
                  <h3>Analyser une situation agricole</h3>
                  <p>Étudiez un scénario de pluie et de drainage pour obtenir une estimation du risque.</p>
                  <span className="featureLink">Lancer l’analyse <ArrowRight size={15} /></span>
                </button>

                <button className="featureCard" onClick={() => navigate('commerce')}>
                  <div className="featureIcon yellowIcon"><TrendingUp size={23} /></div>
                  <span className="featureNumber">02</span>
                  <h3>Préparer une vente</h3>
                  <p>Évaluez le stock déclaré et comparez les recettes et frais de transport estimés.</p>
                  <span className="featureLink">Voir les options <ArrowRight size={15} /></span>
                </button>

                <button className="featureCard" onClick={() => navigate('chat')}>
                  <div className="featureIcon paleIcon"><MessageCircle size={23} /></div>
                  <span className="featureNumber">03</span>
                  <h3>Se faire guider</h3>
                  <p>Indiquez votre besoin et retrouvez rapidement le bon outil.</p>
                  <span className="featureLink">Ouvrir l’assistant <ArrowRight size={15} /></span>
                </button>
              </div>

              <div className="infoStrip">
                <ShieldCheck size={22} />
                <div>
                  <strong>Une aide à la décision, pas une décision automatique</strong>
                  <p>Les données commerciales sont fictives et les estimations agricoles ne sont pas validées agronomiquement.</p>
                </div>
              </div>
            </>
          )}

          {activePage === 'agriculture' && (
            <>
              <div className="pageIntro">
                <span className="sectionEyebrow">OUTIL 01 · CULTURES</span>
                <h1>Analyse agricole</h1>
                <p>
                  Décrivez votre situation pour obtenir un niveau de risque
                  indicatif et préparer un avis à examiner avec un conseiller.
                </p>
              </div>

              <div className="contentGrid">
                <section className="panel">
                  <div className="panelHead">
                    <div><span className="step">ÉTAPE 1</span><h2>Votre situation</h2></div>
                    <Sprout size={22} />
                  </div>

                  <form onSubmit={analyze}>
                    <label>Nom de la coopérative
                      <input name="cooperative" value={form.cooperative} onChange={update} required />
                    </label>
                    <div className="two">
                      <label>Culture
                        <select name="crop" value={form.crop} onChange={update}>
                          <option value="manioc">Manioc</option>
                          <option value="banane plantain">Banane plantain</option>
                        </select>
                      </label>
                      <label>Zone
                        <input name="zone" value={form.zone} onChange={update} required />
                      </label>
                    </div>
                    <label>Cumul de pluie du scénario (mm)
                      <input type="number" min="0" max="1000" name="rainfall_mm" value={form.rainfall_mm} onChange={update} required />
                      <small>Valeur de scénario, pas une mesure météo en direct.</small>
                    </label>
                    <label>Drainage du sol
                      <select name="soil_drainage" value={form.soil_drainage} onChange={update}>
                        <option value="unknown">Inconnu</option>
                        <option value="good">Bon</option>
                        <option value="poor">Faible</option>
                      </select>
                    </label>
                    <button className="primary" disabled={busy}>
                      {busy ? <><RefreshCw size={17} className="spin" /> Analyse en cours…</> : <>Lancer l’analyse <Activity size={17} /></>}
                    </button>
                  </form>
                  <p className="disclaimer">Prototype : les données météo sont simulées et l’analyse repose sur une heuristique non validée agronomiquement.</p>
                </section>

                <section className="panel">
                  <div className="panelHead">
                    <div><span className="step">ÉTAPE 2</span><h2>Résultat et avis</h2></div>
                    <Activity size={22} />
                  </div>

                  {!result ? (
                    <div className="empty">
                      <div className="emptyIcon"><CloudRain size={27} /></div>
                      <h3>Votre analyse apparaîtra ici</h3>
                      <p>Complétez le formulaire puis lancez l’analyse pour consulter le niveau de risque et les éléments pris en compte.</p>
                    </div>
                  ) : (
                    <div className="results">
                      <div className="riskCard">
                        <span>Niveau de risque du scénario</span>
                        <strong className={`risk ${analysis?.risk_level || ''}`}>
                          {riskLabel[analysis?.risk_level] || 'Non déterminé'}
                        </strong>
                        <small>{analysis?.method || 'Méthode de démonstration'}</small>
                      </div>

                      <h3>Éléments pris en compte</h3>
                      {Array.isArray(analysis?.reasons) && analysis.reasons.length > 0 ? (
                        <ul>{analysis.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      ) : <p>Aucun détail disponible.</p>}

                      <h3>Provenance des informations</h3>
                      {Array.isArray(advisory?.sources) && advisory.sources.length > 0 ? (
                        <ul>{advisory.sources.map((s, i) => <li key={i}>{s}</li>)}</ul>
                      ) : <p>Sources non renseignées.</p>}

                      <div className="approval">
                        <div className="approvalTop">
                          <ShieldCheck size={21} />
                          <div>
                            <strong>Validation humaine</strong>
                            <small>Statut : {statusLabel[advisory?.status] || advisory?.status || 'Inconnu'}</small>
                          </div>
                        </div>

                        {advisory?.status === 'pending_review' ? (
                          <div className="actions">
                            <button className="approve" onClick={() => decide('approve')}><CheckCircle2 size={16} /> Approuver</button>
                            <button className="reject" onClick={() => decide('reject')}><XCircle size={16} /> Rejeter</button>
                          </div>
                        ) : advisory ? (
                          <p className="decisionDone">Décision enregistrée par le conseiller.</p>
                        ) : (
                          <p className="decisionDone">L’avis n’est pas disponible dans la réponse.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {message && <div className="message">{message}</div>}
                </section>
              </div>
            </>
          )}

          {activePage === 'commerce' && (
            <>
              <div className="pageIntro">
                <span className="sectionEyebrow">OUTIL 02 · MARCHÉS</span>
                <h1>Préparez la vente de votre stock</h1>
                <p>
                  Décrivez le stock de manioc et les contraintes de la coopérative.
                  AgroPilot estimera une allocation indicative auprès d’acheteurs de démonstration.
                </p>
              </div>

              <div className="contentGrid">
                <section className="panel">
                  <div className="panelHead">
                    <div><span className="step">ÉTAPE 1</span><h2>Informations sur le stock</h2></div>
                    <Package size={22} />
                  </div>

                  <form onSubmit={planSales}>
                    <label>Nom de la coopérative
                      <input name="cooperative" value={salesForm.cooperative} onChange={updateSales} required />
                    </label>

                    <div className="two">
                      <label>Stock disponible (kg)
                        <input type="number" name="stock_kg" min="1" max="1000000" value={salesForm.stock_kg} onChange={updateSales} required />
                      </label>
                      <label>Âge depuis récolte (jours)
                        <input type="number" name="harvest_age_days" min="0" max="3650" value={salesForm.harvest_age_days} onChange={updateSales} required />
                      </label>
                    </div>

                    <label>État déclaré du stock
                      <select name="condition" value={salesForm.condition} onChange={updateSales}>
                        <option value="bon">Bon</option>
                        <option value="douteux">Douteux</option>
                        <option value="degrade">Dégradé</option>
                        <option value="inconnu">Inconnu</option>
                      </select>
                    </label>

                    <label>Conditions de stockage
                      <input name="storage_conditions" value={salesForm.storage_conditions} onChange={updateSales} placeholder="Ex. : ventilé, à l'abri" />
                    </label>

                    <div className="two">
                      <label>Urgence
                        <select name="urgency" value={salesForm.urgency} onChange={updateSales}>
                          <option value="faible">Faible</option>
                          <option value="moyenne">Moyenne</option>
                          <option value="elevee">Élevée</option>
                          <option value="inconnue">Inconnue</option>
                        </select>
                      </label>
                      <label>Délai de vente souhaité (jours)
                        <input type="number" name="target_sale_days" min="0" max="365" value={salesForm.target_sale_days} onChange={updateSales} required />
                      </label>
                    </div>

                    <label>Contraintes ou précisions
                      <input name="constraints" value={salesForm.constraints} onChange={updateSales} placeholder="Ex. : transport, accès au marché" />
                    </label>

                    <button className="primary" disabled={salesBusy}>
                      {salesBusy ? <><RefreshCw size={17} className="spin" /> Préparation du plan…</> : <>Générer les recommandations <ArrowRight size={17} /></>}
                    </button>
                  </form>
                  <p className="disclaimer">Acheteurs, prix et capacités fictifs. Vérifiez l’état réel du stock et les offres avant toute décision.</p>
                </section>

                <section className="panel">
                  <div className="panelHead">
                    <div><span className="step">ÉTAPE 2</span><h2>Recommandations commerciales</h2></div>
                    <TrendingUp size={22} />
                  </div>

                  {!salesResult ? (
                    <div className="empty">
                      <div className="emptyIcon"><ShoppingBasket size={27} /></div>
                      <h3>Votre plan de vente apparaîtra ici</h3>
                      <p>Renseignez le stock puis générez une évaluation et une proposition de répartition entre acheteurs fictifs.</p>
                    </div>
                  ) : (
                    <div className="results">
                      <div className="commercialSummary">
                        <span>Recette nette estimée</span>
                        <strong>{formatFCFA(salesPlan?.estimated_net_revenue_fcfa)}</strong>
                        <small>Après transport estimé, avant les autres charges.</small>
                      </div>

                      <div className="metricGrid">
                        <div className="metricCard">
                          <span>Stock initial</span>
                          <strong>{Number(salesPlan?.stock_initial_kg ?? salesForm.stock_kg).toLocaleString('fr-FR')} kg</strong>
                        </div>
                        <div className="metricCard">
                          <span>Stock alloué</span>
                          <strong>{Number(salesPlan?.allocated_kg || 0).toLocaleString('fr-FR')} kg</strong>
                        </div>
                        <div className="metricCard">
                          <span>Transport estimé</span>
                          <strong>{formatFCFA(salesPlan?.transport_cost_fcfa)}</strong>
                        </div>
                        <div className="metricCard">
                          <span>Stock restant</span>
                          <strong>{Number(salesPlan?.remaining_stock_kg || 0).toLocaleString('fr-FR')} kg</strong>
                        </div>
                      </div>

                      <h3>Évaluation du stock</h3>
                      <div className="priorityCard">
                        <strong>{stockAssessment?.operational_priority || 'Non déterminée'}</strong>
                        <p>{stockAssessment?.reason || 'Aucun détail fourni.'}</p>
                      </div>

                      <h3>Répartition indicative par acheteur</h3>
                      {Array.isArray(salesPlan?.allocations) && salesPlan.allocations.length > 0 ? (
                        <div className="offerList">
                          {salesPlan.allocations.map((offer, i) => (
                            <div className="offerCard" key={offer.buyer_id || i}>
                              <div className="offerTop">
                                <div className="offerIcon"><ShoppingBasket size={18} /></div>
                                <div className="offerName">
                                  <strong>{offer.buyer_name}</strong>
                                  <small>{Number(offer.quantity_kg || 0).toLocaleString('fr-FR')} kg proposés</small>
                                </div>
                                <span className="offerAmount">{formatFCFA(offer.estimated_net_fcfa)}</span>
                              </div>
                              <div className="offerDetails">
                                <span>Prix/kg : {formatFCFA(offer.net_per_kg_fcfa)}</span>
                                <span>Transport : {formatFCFA(offer.transport_cost_fcfa)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p>Aucune allocation proposée.</p>}

                      <div className="infoStrip compact">
                        <ShieldCheck size={20} />
                        <div>
                          <strong>À vérifier avant la vente</strong>
                          <p>Les capacités, prix et acheteurs sont fictifs. Aucune transaction n’est effectuée.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {salesMessage && <div className="message">{salesMessage}</div>}
                </section>
              </div>
            </>
          )}

          {activePage === 'chat' && (
            <>
              <div className="pageIntro">
                <span className="sectionEyebrow">ASSISTANT D’ORIENTATION</span>
                <h1>Comment puis-je vous aider ?</h1>
                <p>Décrivez votre besoin ou choisissez une suggestion pour accéder rapidement au bon outil.</p>
              </div>

              <section className="chatPanel">
                <div className="chatHeader">
                  <div className="chatAvatar"><Sprout size={22} /></div>
                  <div>
                    <strong>Assistant AgroPilot</strong>
                    <small>Guide des fonctionnalités disponibles</small>
                  </div>
                  <span className="chatDemoTag">GUIDE</span>
                </div>

                <div className="chatMessages">
                  {chatMessages.map((item, index) => (
                    <div className={`chatRow ${item.role}`} key={index}>
                      {item.role === 'assistant' && <div className="miniAvatar"><Sprout size={16} /></div>}
                      <div className="chatBubble">{item.text}</div>
                    </div>
                  ))}
                </div>

                <div className="suggestionArea">
                  <span>RACCOURCIS</span>
                  <div className="suggestionButtons">
                    <button onClick={() => navigate('agriculture')}><CloudRain size={16} /> Analyser une culture</button>
                    <button onClick={() => navigate('commerce')}><ShoppingBasket size={16} /> Préparer une vente</button>
                  </div>
                </div>

                <form className="chatComposer" onSubmit={sendChat}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ex. : je veux vendre mon stock de manioc…"
                    aria-label="Votre message"
                  />
                  <button className="sendButton" type="submit" aria-label="Envoyer le message">
                    <Send size={18} />
                  </button>
                </form>
                <p className="chatFootnote"><CircleHelp size={14} /> Assistant d’orientation local : il ne consulte pas un modèle IA conversationnel.</p>
              </section>
            </>
          )}

          <footer className="appFooter">
            <span>AgroPilot AI · Prototype hackathon</span>
            <span>Données de démonstration <ExternalLink size={13} /></span>
          </footer>
        </main>
      </div>
    </div>
  );
}
