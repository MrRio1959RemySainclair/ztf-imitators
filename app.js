/* ZTF Imitators — PWA (JS natif, sans dépendance) */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const LOGO = ic('<path d="M12 9c-1.5-1-3.3-1.5-5.5-1.5v8c2.2 0 4 .5 5.5 1.5 1.5-1 3.3-1.5 5.5-1.5v-8C15.3 7.5 13.5 8 12 9zM12 9v8M12 3.5v3M10.5 5h3"/>');
const DL_ICON = ic('<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4.5 19h15"/>');

/* ---------- Installation de la PWA ---------- */
let deferredPrompt = null;
const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) && !window.MSStream;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; updateInstallUI(); });
addEventListener('appinstalled', () => { deferredPrompt = null; updateInstallUI(); });
function updateInstallUI() {
  document.querySelectorAll('#installBtn').forEach(b => {
    if (isStandalone) { b.hidden = true; return; }
    b.hidden = !(deferredPrompt || isIOS);
    b.dataset.mode = deferredPrompt ? 'prompt' : 'ios';
  });
}
document.addEventListener('click', async e => {
  const b = e.target.closest('#installBtn'); if (!b) return;
  if (b.dataset.mode === 'prompt' && deferredPrompt) {
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; updateInstallUI();
  } else {
    toast("Sur iPhone : appuyez sur Partager, puis « Sur l'écran d'accueil »");
  }
});

/* ---------- Domaines ----------
   Pour ajouter un questionnaire : remplir `fields` avec des objets
   { name, label, type: text|number|date|textarea|select|radio|checkbox, options:[...], required:true } */
const N = (name, label, unit) => ({ name, label, type:'number', required:true, unit });
const LOUANGE = [
  { name:'mois', label:'Mois concerné', type:'month', required:true },
  N('jc_prevues', 'Nombre de proclamations « Jésus-Christ est le Seigneur » prévues'),
  N('jc_realisees', 'Nombre de proclamations « Jésus-Christ est le Seigneur » effectivement réalisées'),
  N('autres_prevues', "Nombre d'autres proclamations prévues"),
  N('autres_realisees', "Nombre d'autres proclamations effectivement réalisées"),
  N('prophetie', 'Nombre de proclamations intégrales de la prophétie du renversement du prince satanique du Cameroun réalisées'),
  { name:'participation', label:'Participation', type:'checkcount', options:[
    { label:'Seul' }, { label:'Famille', key:'famille', count:true }, { label:'Église de maison', key:'eglise_maison', count:true },
    { label:'Église locale', key:'eglise_locale', count:true }, { label:'Autre', key:'autre', count:true } ] },
  { name:'difficultes', label:'Difficultés rencontrées', type:'textarea' },
  { name:'temoignages', label:'Témoignages / observations', type:'textarea' },
  { name:'engagement', label:'Engagement maintenu pour le mois suivant', type:'radio', options:['Oui','Non'], required:true },
];

const EVANGELISATION = [
  { name:'mois', label:'Mois concerné', type:'month', required:true },
  N('evangelises', 'Combien de personnes as-tu évangélisées ce mois-ci ?', 'personnes'),
  N('sorties', "Combien de sorties d'évangélisation as-tu eues ?", 'fois'),
  N('engages', 'Combien de personnes se sont engagées à suivre Jésus-Christ ?', 'personnes'),
  N('suivis', 'Combien de personnes es-tu en train de suivre ?', 'personnes'),
  { name:'temoignage', label:'Partage avec nous le témoignage de ce que Dieu a fait.', type:'textarea' },
  { name:'objectifs', label:'Quels sont tes objectifs pour le mois prochain ?', type:'textarea' },
];

const SERVICE = [
  { name:'prevu', label: "Qu'as-tu prévu de faire pour servir tes autorités ?", type:'textarea', required:true, hint:'Exemples : parents, faiseurs de disciples, dirigeants, responsables d\'église, etc.' },
  { name:'fait', label: "Qu'as-tu effectivement fait pour servir tes autorités ?", type:'textarea', required:true },
  N('actes', 'Combien de fois as-tu posé un acte concret de service ?'),
  { name:'autorites', label:'Auprès de quelles autorités as-tu servi ?', type:'checkbox', options:['Parents','Faiseur(s) de disciple','Dirigeant(s)','Responsable(s) d\'église','Autre(s)'] },
  { name:'realisation', label:'Ton engagement a-t-il été réalisé ?', type:'radio', required:true, options:['Entièrement','En grande partie','Partiellement','Pas encore'] },
  { name:'non_realise', label:"Si nécessaire, explique ce qui n'a pas été réalisé.", type:'textarea' },
  { name:'temoignage', label:'Quel témoignage peux-tu partager concernant ton service ?', type:'textarea' },
  { name:'engagement', label:'Quel est ton engagement de service pour le mois prochain ?', type:'textarea', required:true },
  N('encourages', 'Combien de personnes comptes-tu encourager à faire de même le mois prochain ?', 'personnes'),
];

const LITTERATURE = [
  { name:'mois', label:'Mois concerné par ce compte rendu', type:'month', required:true },
  N('ztf_engages', 'Combien de livres ZTF vous étiez-vous engagé(e) à lire ?'),
  N('ztf_acheves', 'Combien de livres ZTF avez-vous effectivement achevés ce mois-ci ?'),
  { name:'ztf_titres', label:'Quels livres ZTF avez-vous lus durant cette période ?', type:'textarea' },
  { name:'resume', label:'Avez-vous préparé un résumé des livres lus ?', type:'radio', required:true, options:['Oui','En partie','Non'] },
  N('chemin_engages', 'Combien de livres de la série « Le Chemin » vous étiez-vous engagé(e) à lire ?'),
  { name:'chemin_titres', label:'Quels livres de la série « Le Chemin » avez-vous lus ?', type:'textarea' },
  { name:'enseignement', label:'Quel enseignement principal avez-vous retenu de vos lectures ?', type:'textarea', required:true },
  { name:'temoignage', label:'Quel témoignage souhaitez-vous partager ?', type:'textarea' },
  N('encourages', 'Combien de personnes avez-vous effectivement encouragées ?', 'personnes'),
  N('ont_commence', 'Combien de ces personnes ont commencé à lire ?', 'personnes'),
  { name:'accompagnement', label:'Comment les avez-vous encouragées ou accompagnées ?', type:'textarea' },
  { name:'engagement_prochain', label:'Quels livres vous engagez-vous à lire durant le prochain mois ?', type:'textarea', required:true },
  N('a_achever', 'Combien de livres comptez-vous achever le mois prochain ?'),
];

const BERTOUA = [
  { name:'mois', label:'Mois concerné', type:'month', required:true },
  { name:'engagement_pris', label:"Combien de fois t'étais-tu engagé(e) à faire chaque unité d'enseignement ?", type:'radio', required:true, options:['7 fois','12 fois'] },
  N('etudiees', "Combien d'unités d'enseignement du message de Bertoua as-tu étudiées durant ce mois ?"),
  N('enseignees', "Combien d'unités d'enseignement du message de Bertoua as-tu enseignées durant ce mois ?"),
  { name:'realisation', label:'Quel a été ton niveau de réalisation de cet engagement ?', type:'radio', required:true, options:['Entièrement réalisé','Réalisé en grande partie','Partiellement réalisé','Pas encore réalisé'] },
  N('personnes_enseignees', 'À combien de personnes as-tu enseigné le message de Bertoua ?', 'personnes'),
];

const BIBLE = [
  { name:'mois', label:'Mois concerné', type:'month', required:true },
  { name:'engagement_pris', label:"Combien de fois vous étiez-vous engagé(e) à achever la lecture de la Bible ?", type:'radio', required:true, options:['1 fois','2 fois','3 fois'] },
  { name:'quotidienne', label:'Avez-vous lu votre Bible chaque jour durant cette période ?', type:'radio', required:true, options:['Oui, tous les jours','Presque tous les jours','Certains jours seulement'] },
  { name:'portion', label:'Quelle portion de la Bible avez-vous lue ce mois-ci ?' },
  { name:'raisons', label:"Si vous n'avez pas entièrement réalisé votre engagement, quelles en sont les raisons ?", type:'textarea' },
  { name:'fidelite', label:'Qu\'est-ce qui vous a aidé à rester fidèle dans la lecture de la Bible ?', type:'textarea' },
  { name:'enseignement', label:'Avez-vous tiré un enseignement particulier de votre lecture durant cette période ?', type:'textarea' },
  { name:'temoignage', label:'Quel témoignage souhaitez-vous partager concernant votre lecture de la Bible ?', type:'textarea' },
  N('encourages', 'Combien de personnes allez-vous encourager à faire de même ?', 'personnes'),
];

const FINANCES = [
  { name:'mois', label:'Mois concerné par ce compte rendu', type:'month', required:true },
  { name:'budget_etabli', label:'Avez-vous établi un budget pour ce mois ?', type:'radio', required:true, options:['Oui','Non'] },
  { name:'budget_utilise', label:'Avez-vous effectivement utilisé votre budget pour gérer vos dépenses ?', type:'radio', required:true, options:['Oui, régulièrement','En partie','Non'] },
  { name:'budget_raisons', label:"Si vous n'avez pas pu respecter votre budget, quelles en sont les raisons ?", type:'textarea' },
  { name:'dime_fidelite', label:'Avez-vous été fidèle à donner votre dîme durant ce mois-ci ?', type:'radio', required:true, options:['Oui','Partiellement','Non'] },
  { name:'offrande_engagement', label:'Vous étiez-vous engagé(e) à ajouter une offrande ?', type:'radio', options:['Oui','Non'] },
  { name:'offrande_donnee', label:'Avez-vous donné une offrande durant cette période ?', type:'radio', options:['Oui','Non'] },
  { name:'pct_dime', label:'Quel est votre pourcentage de don à Dieu — Dîme (%)', type:'number', attrs:'min="0" max="100" inputmode="numeric"' },
  { name:'pct_offrande', label:'Quel est votre pourcentage de don à Dieu — Offrandes (%)', type:'number', attrs:'min="0" max="100" inputmode="numeric"' },
  { name:'epargne_engagement', label:'Vous étiez-vous engagé(e) à épargner chaque mois ?', type:'radio', options:['Oui','Non'] },
  { name:'epargne_faite', label:'Avez-vous épargné durant ce mois ?', type:'radio', options:['Oui','Non'] },
  { name:'epargne_maintenue', label:"Avez-vous pu maintenir votre engagement d'épargne malgré vos autres dépenses ?", type:'radio', options:['Oui','Partiellement','Non'] },
  { name:'endette', label:'Êtes-vous actuellement endetté(e) ?', type:'radio', required:true, options:['Oui','Non'] },
  { name:'dettes_liste', label:'Avez-vous établi la liste de vos dettes et des personnes envers lesquelles vous êtes engagé(e) ?', type:'radio', options:['Oui','Non'], showIf:{ name:'endette', equals:'Oui' } },
  { name:'dettes_plan', label:'Avez-vous établi un plan de remboursement de vos dettes ?', type:'radio', options:['Oui','En cours','Non'], showIf:{ name:'endette', equals:'Oui' } },
  { name:'dettes_remboursement', label:'Avez-vous effectué au moins un remboursement durant cette période ?', type:'radio', options:['Oui','Non'], showIf:{ name:'endette', equals:'Oui' } },
  { name:'dettes_pct', label:'Quel pourcentage de votre dette avez-vous payé ?', type:'number', attrs:'min="0" max="100" inputmode="numeric"', showIf:{ name:'endette', equals:'Oui' } },
  { name:'dettes_difficultes', label:'Quelles difficultés rencontrez-vous dans le remboursement de vos dettes ?', type:'textarea', showIf:{ name:'endette', equals:'Oui' } },
  { name:'amelioration', label:'Quel aspect de votre gestion financière avez-vous le mieux amélioré ?', type:'textarea' },
  { name:'temoignage', label:'Quel témoignage souhaitez-vous partager concernant votre gestion financière ?', type:'textarea' },
];

const DOMAINS = [
  { id:'jeune',     label:'Jeûne',                   icon:'<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.5"/><path d="M4 4l16 16"/>', fields:[] },
  { id:'priere',    label:'Prière',                  icon:'<path d="M12 4c-3 3-4 7-4 11l4 5 4-5c0-4-1-8-4-11zM12 4v16"/>', fields:[] },
  { id:'rdqd',      label:'RDQD / Méditation',       icon:'<path d="M3 18h18M6 18a6 6 0 0112 0M12 6V3M4.6 9.6L3 8M19.4 9.6L21 8"/>', fields:[] },
  { id:'finances',  label:'Finances',                icon:'<circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-1 1-2 3-2s3 1 3 2-1 1.6-3 2-3 1-3 2 1 2 3 2 3-1 3-2M12 6v1.5M12 16.5V18"/>', fields:FINANCES },
  { id:'louange',   label:'Louange',                 icon:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>', fields:LOUANGE },
  { id:'bible',     label:'Lecture de la Bible',     icon:'<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14"/>', fields:BIBLE },
  { id:'litterature', label:'Littérature chrétienne',icon:'<path d="M4 5.5C4 4.7 4.7 4 5.5 4H10a2 2 0 012 2 2 2 0 012-2h4.5c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5H14a2 2 0 00-2 2 2 2 0 00-2-2H5.5A1.5 1.5 0 014 18.5v-13zM12 6v14"/>', fields:LITTERATURE },
  { id:'evangelisation', label:'Évangélisation',     icon:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', fields:EVANGELISATION },
  { id:'service',   label:'Service',                 icon:'<path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.5C20 15.3 12 20 12 20z"/>', fields:SERVICE },
  { id:'bertoua',   label:'Message de Bertoua',      icon:'<path d="M12 3v18M6 9h12"/>', fields:BERTOUA },
];

const ACCOUNT_FIELDS = [
  { name:'nom', label:'Nom', required:true, autocomplete:'name' },
  { name:'telephone', label:'Téléphone', type:'tel', required:true, autocomplete:'tel' },
  { name:'email', label:'Email', type:'email', required:true, autocomplete:'email' },
  { name:'province', label:'Province spirituelle ou nation', required:true },
  { name:'faiseur', label:'Faiseur de disciple', required:true },
  { name:'faiseur_tel', label:'Son téléphone', type:'tel' },
  { name:'faiseur_email', label:'Son email', type:'email' },
  { name:'camp_niveau', label:'Dernière participation aux camps bibliques internationaux à Koumé-Bertoua', type:'radio', options:['Fondation','Leadeur'], required:true },
  { name:'camp_annee', label:'Année', type:'number', required:true, attrs:'min="1970" max="2100" inputmode="numeric"' },
  { name:'password', label:'Mot de passe', type:'password', required:true, min:6, autocomplete:'new-password' },
];

/* ---------- Backend Supabase (comptes + réponses centralisés) ---------- */
const SUPABASE_URL = 'https://nmhgtwfupjnzpiiwavjh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taGd0d2Z1cGpuenBpaXdhdmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNzE2MzMsImV4cCI6MjEwNTk0NzYzM30.4uLSfrNM3V57tnmUi6LrUQX0c7wGSicbhHsmXiQ7CPA';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null; // profil (table "profiles") de la personne connectée, mis en cache le temps de la session

const authErrorFr = err => {
  const m = (err && err.message || '').toLowerCase();
  if (m.includes('already registered') || m.includes('already exists') || m.includes('already been registered')) return 'Un compte existe déjà avec cet email.';
  if (m.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (m.includes('password')) return 'Le mot de passe doit contenir au moins 6 caractères.';
  return (err && err.message) || 'Une erreur est survenue, réessayez.';
};

const api = {
  async me() {
    if (currentUser) return currentUser;
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return null;
    const { data, error } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
    if (error) return null;
    return currentUser = data;
  },
  async register({ password, email, ...meta }) {
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: meta } });
    if (error) throw Error(authErrorFr(error));
    if (!data.session) throw Error("Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.");
    const { data: profile, error: e2 } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
    if (e2) throw Error("Compte créé, mais le profil n'a pas pu être chargé. Réessayez de vous connecter.");
    return currentUser = profile;
  },
  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw Error(authErrorFr(error));
    const { data: profile, error: e2 } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
    if (e2) throw Error('Impossible de récupérer votre profil.');
    return currentUser = profile;
  },
  async logout() { await sb.auth.signOut(); currentUser = null; },
  async submit(domain, data) {
    const user = await api.me();
    const { error } = await sb.from('submissions').insert({ user_id: user.id, domain, data });
    if (error) throw Error("L'enregistrement a échoué : " + error.message);
  },
};

/* ---------- Composants ---------- */
const hero = (title, sub, extra='', cls='', img='') => `<header class="hero ${cls}">${img ? `<img class="bg" src="${img}" alt="" onerror="this.remove()">` : ''}<div class="bar">${LOGO}<div class="bar-right">${extra}<button id="installBtn" class="pill icon-only" hidden aria-label="Installer l'application">${DL_ICON}</button></div></div><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</header>`;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200); };

function field(f) {
  const id = 'f_'+f.name, req = f.required ? 'required' : '';
  const wrapAttrs = f.showIf ? ` class="cond" data-show-if="${f.showIf.name}" data-show-val="${esc(f.showIf.equals)}" hidden` : '';
  if (f.type === 'radio' || f.type === 'checkbox')
    return `<fieldset${wrapAttrs}><legend>${esc(f.label)}</legend>${f.options.map(o => `<label class="opt"><input type="${f.type}" name="${f.name}" value="${esc(o)}" ${f.type==='radio'?req:''}><span>${esc(o)}</span></label>`).join('')}</fieldset>`;
  if (f.type === 'checkcount')
    return `<fieldset><legend>${esc(f.label)}</legend>${f.options.map((o,i) => `<div class="opt"><input type="checkbox" id="${id}_${i}" name="${f.name}" value="${esc(o.label)}"><label for="${id}_${i}">${esc(o.label)}</label>${o.count ? `<input class="nb" type="number" min="1" inputmode="numeric" name="${f.name}_${o.key}" placeholder="Nombre" aria-label="Nombre — ${esc(o.label)}" disabled>` : ''}</div>`).join('')}</fieldset>`;
  let inp;
  if (f.type === 'textarea') inp = `<textarea id="${id}" name="${f.name}" ${req}></textarea>`;
  else if (f.type === 'select') inp = `<select id="${id}" name="${f.name}" ${req}><option value="">Choisir…</option>${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
  else inp = `<input id="${id}" name="${f.name}" type="${f.type||'text'}" ${f.min?`minlength="${f.min}"`:''} ${f.attrs ?? (f.type==='number' ? 'min="0" inputmode="numeric"' : '')} ${f.autocomplete?`autocomplete="${f.autocomplete}"`:''} ${req}>`;
  return `<div class="fld"${wrapAttrs}><label for="${id}">${esc(f.label)}</label>${f.hint ? `<small>${esc(f.hint)}</small>` : ''}${f.unit ? `<div class="wrap">${inp}<span class="unit">${esc(f.unit)}</span></div>` : inp}</div>`;
}
const formData = form => { const fd = new FormData(form), o = {}; for (const k of new Set(fd.keys())) { const a = fd.getAll(k); o[k] = a.length > 1 ? a : a[0]; } return o; };

/* ---------- Vues ---------- */
function viewAuth(mode) {
  const reg = mode === 'register';
  const fields = reg ? ACCOUNT_FIELDS : [ACCOUNT_FIELDS[2], { ...ACCOUNT_FIELDS.find(f => f.name === 'password'), autocomplete:'current-password' }];
  $('#app').innerHTML = `${hero('ZTF Imitators','Les domaines de la vie chrétienne, un formulaire à la fois','','')}
  <main><nav class="tabs"><a href="#/inscription" class="${reg?'on':''}">Créer un compte</a><a href="#/connexion" class="${reg?'':'on'}">Se connecter</a></nav>
  ${reg?'<p class="hint">Un compte est nécessaire pour accéder aux formulaires.</p>':''}
  <form id="auth"><p class="err" role="alert"></p>${fields.map(field).join('')}<button class="btn">${reg?'Créer mon compte':'Se connecter'}</button></form></main>`;
  $('#auth').onsubmit = async e => {
    e.preventDefault(); const b = e.target.querySelector('.btn'); b.disabled = true;
    try { const d = formData(e.target); reg ? await api.register(d) : await api.login(d.email, d.password); location.hash = '#/'; await route(); }
    catch (x) { e.target.querySelector('.err').textContent = x.message; b.disabled = false; }
  };
}

function viewHome(u) {
  $('#app').innerHTML = `${hero('ZTF Imitators', 'Bienvenue, '+esc(u.nom.split(' ')[0]), '<a class="pill" href="#/profil">Mon compte</a>')}
  <main><h2>Domaines d'imitation</h2><ul class="grid">${DOMAINS.map((d, i) => `<li style="--i:${i}"><a class="tile" href="#/d/${d.id}"><img class="bg" src="img/${d.id}.jpg" alt="" loading="lazy" onload="this.parentNode.classList.add('has-img')" onerror="this.remove()">${ic(d.icon)}<span>${d.label}</span></a></li>`).join('')}</ul></main>`;
}

const ZACH_QUESTION = { name:'question_zach', label:"Avez-vous une question par rapport à l'imitation du frère Zach dans ce domaine ?", type:'textarea' };

function viewForm(d) {
  const fields = d.fields.length ? [...d.fields, ZACH_QUESTION] : [];
  const has = fields.length;
  $('#app').innerHTML = `${hero(d.label,'','<a class="back" href="#/">← Retour</a>','compact',`img/${d.id}.jpg`)}
  <main>${has ? `<form id="f">${fields.map(field).join('')}<button class="btn">Enregistrer</button></form>`
    : `<div class="empty">${ic(d.icon)}<p>Le questionnaire de ce domaine sera bientôt disponible.</p></div>`}</main>`;
  if (has) $('#f').onsubmit = async e => {
    e.preventDefault(); const btn = e.target.querySelector('.btn'); btn.disabled = true;
    try { await api.submit(d.id, formData(e.target)); toast('Réponses enregistrées'); location.hash = '#/'; await route(); }
    catch (x) { toast(x.message); btn.disabled = false; }
  };
}

function viewProfile(u) {
  const rows = ACCOUNT_FIELDS.filter(f => f.name !== 'password').map(f => `<li><b>${esc(f.label)}</b>${esc(u[f.name]) || '—'}</li>`).join('');
  $('#app').innerHTML = `${hero('Mon compte','','<a class="back" href="#/">← Retour</a>','compact')}
  <main><ul class="info">${rows}</ul><button class="btn" id="out">Se déconnecter</button></main>`;
  $('#out').onclick = async () => { await api.logout(); location.hash = '#/connexion'; await route(); };
}

/* ---------- Routeur ---------- */
async function route() {
  const u = await api.me(), h = location.hash.slice(2).split('/');
  const d = h[0] === 'd' ? DOMAINS.find(x => x.id === h[1]) : null;
  if (!u) viewAuth(h[0] === 'connexion' ? 'login' : 'register');
  else if (d) viewForm(d);
  else if (h[0] === 'profil') viewProfile(u);
  else viewHome(u);
  updateInstallUI();
}
document.addEventListener('change', e => {
  if (e.target.matches('.opt input[type=checkbox]')) {
    const n = e.target.closest('.opt').querySelector('.nb');
    if (n) { n.disabled = !e.target.checked; n.required = e.target.checked; if (e.target.checked) n.focus(); }
  }
  if (e.target.matches('form [name]')) {
    const form = e.target.form; if (!form) return;
    form.querySelectorAll('.cond[data-show-if]').forEach(box => {
      const show = box.dataset.showIf === e.target.name && e.target.value === box.dataset.showVal && e.target.checked !== false;
      if (box.dataset.showIf === e.target.name) {
        const on = [...form.querySelectorAll(`[name="${box.dataset.showIf}"]`)].find(i => i.checked)?.value === box.dataset.showVal;
        box.hidden = !on;
        box.querySelectorAll('input,textarea,select').forEach(i => { if (i.dataset.wasRequired === undefined) i.dataset.wasRequired = i.required ? '1' : '0'; i.required = on && i.dataset.wasRequired === '1'; if (!on) i.value = i.type === 'radio' || i.type === 'checkbox' ? (i.checked = false) : ''; });
      }
    });
  }
});
addEventListener('hashchange', route);
$('#app').innerHTML = hero('ZTF Imitators', 'Chargement…');
route();
