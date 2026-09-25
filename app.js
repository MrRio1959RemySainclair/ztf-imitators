/* ZTF Imitators — PWA (JS natif, sans dépendance) */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const LOGO = ic('<path d="M12 9c-1.5-1-3.3-1.5-5.5-1.5v8c2.2 0 4 .5 5.5 1.5 1.5-1 3.3-1.5 5.5-1.5v-8C15.3 7.5 13.5 8 12 9zM12 9v8M12 3.5v3M10.5 5h3"/>');

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

const DOMAINS = [
  { id:'jeune',     label:'Jeûne',                   icon:'<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.5"/><path d="M4 4l16 16"/>', fields:[] },
  { id:'priere',    label:'Prière',                  icon:'<path d="M12 4c-3 3-4 7-4 11l4 5 4-5c0-4-1-8-4-11zM12 4v16"/>', fields:[] },
  { id:'rdqd',      label:'RDQD / Méditation',       icon:'<path d="M3 18h18M6 18a6 6 0 0112 0M12 6V3M4.6 9.6L3 8M19.4 9.6L21 8"/>', fields:[] },
  { id:'finances',  label:'Finances',                icon:'<circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-1 1-2 3-2s3 1 3 2-1 1.6-3 2-3 1-3 2 1 2 3 2 3-1 3-2M12 6v1.5M12 16.5V18"/>', fields:[] },
  { id:'louange',   label:'Louange',                 icon:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>', fields:LOUANGE },
  { id:'bible',     label:'Lecture de la Bible',     icon:'<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14"/>', fields:[] },
  { id:'litterature', label:'Littérature chrétienne',icon:'<path d="M5 4h4v16H5zM11 4h4v16h-4zM17.5 5l3.5 1-3.5 14-3.5-1z"/>', fields:[] },
  { id:'evangelisation', label:'Évangélisation',     icon:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', fields:EVANGELISATION },
  { id:'service',   label:'Service',                 icon:'<path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.5C20 15.3 12 20 12 20z"/>', fields:[] },
  { id:'bertoua',   label:'Message de Bertoua',      icon:'<path d="M12 3v18M6 9h12"/>', fields:[] },
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

/* ---------- Données (localStorage pour l'instant) ----------
   Pour passer à un vrai backend, remplacer le contenu de `api` par des fetch(). */
const store = {
  get:(k,d) => { try { return JSON.parse(localStorage.getItem('ztf:'+k)) ?? d } catch { return d } },
  set:(k,v) => localStorage.setItem('ztf:'+k, JSON.stringify(v)),
};
/* crypto.randomUUID et crypto.subtle n'existent qu'en HTTPS ou sur localhost : on prévoit un repli pour les tests en HTTP */
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
const sha = async s => {
  if (!(crypto.subtle && crypto.subtle.digest)) { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return 'w' + h.toString(16); }
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(x => x.toString(16).padStart(2,'0')).join('');
};
const api = {
  me: () => store.get('users',[]).find(u => u.id === store.get('session')),
  async register({ password, ...p }) {
    const us = store.get('users',[]);
    if (us.some(u => u.email.toLowerCase() === p.email.toLowerCase())) throw Error('Un compte existe déjà avec cet email.');
    const u = { id:uid(), ...p, hash:await sha(password), created:new Date().toISOString() };
    store.set('users',[...us,u]); store.set('session',u.id); return u;
  },
  async login(email, pw) {
    const h = await sha(pw);
    const u = store.get('users',[]).find(u => u.email.toLowerCase() === email.toLowerCase() && u.hash === h);
    if (!u) throw Error('Email ou mot de passe incorrect.');
    store.set('session',u.id); return u;
  },
  logout: () => localStorage.removeItem('ztf:session'),
  async submit(domain, data) {
    store.set('submissions',[...store.get('submissions',[]), { id:uid(), userId:store.get('session'), domain, data, date:new Date().toISOString() }]);
  },
};

/* ---------- Composants ---------- */
const hero = (title, sub, extra='', cls='', img='') => `<header class="hero ${cls}">${img ? `<img class="bg" src="${img}" alt="" onerror="this.remove()">` : ''}<div class="bar">${LOGO}${extra}</div><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</header>`;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200); };

function field(f) {
  const id = 'f_'+f.name, req = f.required ? 'required' : '';
  if (f.type === 'radio' || f.type === 'checkbox')
    return `<fieldset><legend>${esc(f.label)}</legend>${f.options.map(o => `<label class="opt"><input type="${f.type}" name="${f.name}" value="${esc(o)}" ${f.type==='radio'?req:''}><span>${esc(o)}</span></label>`).join('')}</fieldset>`;
  if (f.type === 'checkcount')
    return `<fieldset><legend>${esc(f.label)}</legend>${f.options.map((o,i) => `<div class="opt"><input type="checkbox" id="${id}_${i}" name="${f.name}" value="${esc(o.label)}"><label for="${id}_${i}">${esc(o.label)}</label>${o.count ? `<input class="nb" type="number" min="1" inputmode="numeric" name="${f.name}_${o.key}" placeholder="Nombre" aria-label="Nombre — ${esc(o.label)}" disabled>` : ''}</div>`).join('')}</fieldset>`;
  let inp;
  if (f.type === 'textarea') inp = `<textarea id="${id}" name="${f.name}" ${req}></textarea>`;
  else if (f.type === 'select') inp = `<select id="${id}" name="${f.name}" ${req}><option value="">Choisir…</option>${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
  else inp = `<input id="${id}" name="${f.name}" type="${f.type||'text'}" ${f.min?`minlength="${f.min}"`:''} ${f.attrs ?? (f.type==='number' ? 'min="0" inputmode="numeric"' : '')} ${f.autocomplete?`autocomplete="${f.autocomplete}"`:''} ${req}>`;
  return `<div class="fld"><label for="${id}">${esc(f.label)}</label>${f.unit ? `<div class="wrap">${inp}<span class="unit">${esc(f.unit)}</span></div>` : inp}</div>`;
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
    try { const d = formData(e.target); reg ? await api.register(d) : await api.login(d.email, d.password); location.hash = '#/'; route(); }
    catch (x) { e.target.querySelector('.err').textContent = x.message; b.disabled = false; }
  };
}

function viewHome(u) {
  $('#app').innerHTML = `${hero('ZTF Imitators', 'Bienvenue, '+esc(u.nom.split(' ')[0]) + '<p class="hero-subtitle">Veuillez sélectionner un domaine pour rendre compte</p>', '<a class="pill" href="#/profil">Mon compte</a>')}
  <main>
    <h2>Domaines d'imitation</h2>
    <ul class="grid">${DOMAINS.map((d, i) => `<li style="--i:${i}"><a class="tile" href="#/d/${d.id}"><img class="bg" src="img/${d.id}.jpg" alt="" loading="lazy" onload="this.parentNode.classList.add('has-img')" onerror="this.remove()">${ic(d.icon)}<span>${d.label}</span></a></li>`).join('')}</ul>
  </main>`;
}

function viewForm(d) {
  const has = d.fields.length;
  $('#app').innerHTML = `${hero(d.label,'','<a class="back" href="#/">← Retour</a>','compact',`img/${d.id}.jpg`)}
  <main>${has ? `<form id="f">${d.fields.map(field).join('')}<button class="btn">Enregistrer</button></form>`
    : `<div class="empty">${ic(d.icon)}<p>Le questionnaire de ce domaine sera bientôt disponible.</p></div>`}</main>`;
  if (has) $('#f').onsubmit = async e => { e.preventDefault(); await api.submit(d.id, formData(e.target)); toast('Réponses enregistrées'); location.hash = '#/'; };
}

function viewProfile(u) {
  const rows = ACCOUNT_FIELDS.filter(f => f.name !== 'password').map(f => `<li><b>${esc(f.label)}</b>${esc(u[f.name]) || '—'}</li>`).join('');
  $('#app').innerHTML = `${hero('Mon compte','','<a class="back" href="#/">← Retour</a>','compact')}
  <main><ul class="info">${rows}</ul><button class="btn" id="out">Se déconnecter</button></main>`;
  $('#out').onclick = () => { api.logout(); location.hash = '#/connexion'; route(); };
}

/* ---------- Routeur ---------- */
function route() {
  const u = api.me(), h = location.hash.slice(2).split('/');
  if (!u) return viewAuth(h[0] === 'connexion' ? 'login' : 'register');
  if (h[0] === 'd') { const d = DOMAINS.find(x => x.id === h[1]); if (d) return viewForm(d); }
  if (h[0] === 'profil') return viewProfile(u);
  viewHome(u);
}
document.addEventListener('change', e => {
  if (!e.target.matches('.opt input[type=checkbox]')) return;
  const n = e.target.closest('.opt').querySelector('.nb');
  if (n) { n.disabled = !e.target.checked; n.required = e.target.checked; if (e.target.checked) n.focus(); }
});
addEventListener('hashchange', route);
route();
