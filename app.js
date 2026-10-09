/* ZTF Imitators — PWA (JS natif, sans dépendance de build) */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const LOGO = '<img class="badge" src="icons/badge-128.png" alt="ZTF Imitators" width="44" height="44">';
const DL_ICON = ic('<path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4.5 19h15"/>');
const SUN_ICON = ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>');
const MOON_ICON = ic('<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>');
const ADMIN_ICON = ic('<path d="M4 18h16"/><path d="M7 18V9M12 18V5M17 18v-7"/>');
const USER_ICON = ic('<circle cx="12" cy="8.3" r="3.5"/><path d="M5 19c1.4-2.8 4-4.2 7-4.2s5.6 1.4 7 4.2"/>');

/* ---------- Langue & thème (choix de la personne, gardés sur cet appareil) ---------- */
let LANG = localStorage.getItem('ztf:lang') || 'fr';
let THEME = localStorage.getItem('ztf:theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const T = v => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[LANG] ?? v.fr ?? v.en ?? '') : (v ?? '');
const O = (value, fr, en) => ({ value, fr, en });
function applyTheme() { document.documentElement.dataset.theme = THEME; }
function setLang(l) { LANG = l; localStorage.setItem('ztf:lang', l); document.documentElement.lang = l; route(); }
function setTheme(t) { THEME = t; localStorage.setItem('ztf:theme', t); applyTheme(); route(); }
applyTheme(); document.documentElement.lang = LANG;

/* ---------- Ensembles de choix réutilisables (le code stocké ne change jamais selon la langue) ---------- */
const YN = [O('oui','Oui','Yes'), O('non','Non','No')];
const REALISATION3 = [O('oui','Oui','Yes'), O('partiellement','Partiellement','Partially'), O('non','Non','No')];
const REALISATION4 = [O('entierement','Entièrement','Fully'), O('grande_partie','En grande partie','Mostly'), O('partiellement','Partiellement','Partially'), O('pas_encore','Pas encore','Not yet')];
const QUOTIDIEN3 = [O('tous_les_jours','Oui, tous les jours','Yes, every day'), O('presque_tous','Presque tous les jours','Almost every day'), O('certains_jours','Certains jours seulement','Only some days')];

/* ---------- Installation de la PWA ---------- */
let deferredPrompt = null;
let installed = localStorage.getItem('ztf:installed') === '1';
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) && !window.MSStream;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; updateInstallUI(); });
addEventListener('appinstalled', () => { installed = true; localStorage.setItem('ztf:installed','1'); deferredPrompt = null; updateInstallUI(); });
matchMedia('(display-mode: standalone)').addEventListener('change', updateInstallUI);
function updateInstallUI() {
  document.querySelectorAll('#installBtn').forEach(b => {
    if (isStandalone() || installed) { b.hidden = true; return; }
    if (deferredPrompt) { b.hidden = false; b.dataset.mode = 'prompt'; return; }
    if (isIOS) { b.hidden = false; b.dataset.mode = 'ios'; return; }
    b.hidden = true;
  });
}
document.addEventListener('click', async e => {
  const b = e.target.closest('#installBtn'); if (!b) return;
  if (b.dataset.mode === 'prompt' && deferredPrompt) {
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; updateInstallUI();
  } else {
    toast(T({ fr:"Sur iPhone : appuyez sur Partager, puis « Sur l'écran d'accueil »", en:'On iPhone: tap Share, then "Add to Home Screen"' }));
  }
});

/* ---------- Domaines ----------
   Pour ajouter un questionnaire : remplir `fields` avec des objets
   { name, label:{fr,en}, type: text|number|month|date|textarea|select|radio|checkbox|checkcount, options:[O(...)], required:true } */
const N = (name, fr, en, unit) => ({ name, label:{fr,en}, type:'number', required:true, unit });

const JEUNE = [
  { name:'mois', label:{fr:'Mois concerné',en:'Month concerned'}, type:'month', required:true },
  N('engagement_jours', 'Combien de jours de jeûne vous étiez-vous engagé(e) à faire ce mois-ci ?', 'How many days of fasting did you commit to this month?', {fr:'jours',en:'days'}),
  N('jours_realises', 'Combien de jours avez-vous effectivement jeûnés ?', 'How many days did you actually fast?', {fr:'jours',en:'days'}),
  { name:'regularite', label:{fr:'Avez-vous jeûné aussi régulièrement que vous vous étiez engagé(e) à le faire ?',en:'Did you fast as regularly as you had committed to?'}, type:'radio', required:true, options:REALISATION4 },
  N('wednesday_fasts', 'Combien de jeûnes le mercredi avez-vous effectués pour votre nation ?', 'How many wednesday fasts did you carry out for your nation?', {fr:'jeûnes',en:'fasts'}),
  { name:'difficultes', label:{fr:'Quelles difficultés avez-vous rencontrées dans votre jeûne ?',en:'What difficulties did you encounter in your fasting?'}, type:'textarea' },
  { name:'enseignement', label:{fr:'Quel enseignement ou quelle bénédiction avez-vous tirés de ce jeûne ?',en:'What lesson or blessing did you draw from this fasting?'}, type:'textarea' },
  { name:'temoignage', label:{fr:'Quel témoignage souhaitez-vous partager concernant votre jeûne ?',en:'What testimony would you like to share about your fasting?'}, type:'textarea' },
  N('encourages', 'Combien de personnes comptez-vous encourager à jeûner le mois prochain ?', 'How many people do you plan to encourage to fast next month?', {fr:'personnes',en:'people'}),
  { name:'engagement_prochain', label:{fr:'Maintenez-vous votre engagement de jeûne pour le mois prochain ?',en:'Are you keeping your fasting commitment for next month?'}, type:'radio', required:true, options:YN },
];

const PRIERE = [
  { name:'mois', label:{fr:'Mois concerné',en:'Month concerned'}, type:'month', required:true },
  { name:'temps_engage', label:{fr:'Combien de temps par jour vous étiez-vous engagé(e) à consacrer à la prière ?',en:'How much time per day did you commit to devote to prayer?'}, type:'split-time', required:true, hourName:'temps_engage', minuteName:'temps_engage_minutes', hoursLabel:{fr:'Heures',en:'Hours'}, minutesLabel:{fr:'Minutes',en:'Minutes'} },
  { name:'retreat', label:{fr:'Combien de retraites de 15 minutes avez-vous effectuées ?',en:'How many 15-minute retreats did you carry out?'}, type:'number', required:true, unit:{fr:'retraites',en:'retreats'} }, 
  { name:'prayer_topics', label:{fr:'Combien de sujets de prière avez-vous ecrit dans votre cahier de prière ?',en:'How many prayer topics did you write in your prayer book?'}, type:'number', required:true, unit:{fr:'sujets',en:'topics'} }, 
  { name:'thanksgiving_topics', label:{fr:"Combien de sujets d'actions de grâces avez-vous ecrit dans votre cahier d'action de grâces ?",en:'How many thanksgiving topics did you write in your thanksgiving book?'}, type:'number', required:true, unit:{fr:'sujets',en:'topics'} }, 
  { name:'types_priere', label:{fr:'Comment avez-vous pratiqué la prière ce mois ?',en:'How did you pray this month ?'}, type:'checkbox', options:[
    O('personnelle','Prière personnelle','Personal prayer'), O('famille','Prière en famille','Family prayer'), O('intercession',"Prière d'intercession",'Intercessory prayer'),
    O('eglise_maison',"Prière avec l'église de maison",'Prayer with the house church'), O('jeune_priere','Jeûne et prière','Fasting and prayer'), O('autre','Autre','Other') ] },
  { name:'difficultes', label:{fr:'Quelles difficultés avez-vous rencontrées dans votre vie de prière ?',en:'What difficulties did you encounter in your prayer life?'}, type:'textarea' },
  { name:'exaucement', label:{fr:'Quel exaucement ou quelle réponse à la prière souhaitez-vous partager ?',en:'What answered prayer would you like to share?'}, type:'textarea' },
  { name:'temoignage', label:{fr:'Quel témoignage souhaitez-vous partager concernant votre vie de prière ?',en:'What testimony would you like to share about your prayer life?'}, type:'textarea' },
  N('encourages', 'Combien de personnes comptez-vous encourager à prier davantage le mois prochain ?', 'How many people do you plan to encourage to pray more next month?', {fr:'personnes',en:'people'}),
  { name:'engagement_prochain', label:{fr:'Maintenez-vous votre engagement de prière pour le mois prochain ?',en:'Are you keeping your prayer commitment for next month?'}, type:'radio', required:true, options:YN },
];

const RDQD = [
  { name:'mois', label:{fr:'Mois concerné',en:'Month concerned'}, type:'month', required:true },
  N('engagement_rdqd', 'Combien de RDQD vous étiez-vous engagé(e) à faire ce mois-ci ?', 'How many DDEWG did you commit to do this month?'),
  N('realisees', 'Combien de RDQD avez-vous effectivement eu ?', 'How many DDEWG did you have actually ?'),
  { name:'difficultes', label:{fr:'Quelles difficultés avez-vous rencontrées ?',en:'What difficulties did you encounter?'}, type:'textarea' },
  { name:'temoignage', label:{fr:'Quel témoignage souhaitez-vous partager par rapport à vos RDQD ?',en:'What testimony would you like to share from your DDEWG?'}, type:'textarea' },
  N('encourages', 'Combien de personnes comptez-vous encourager à pratiquer les RDQD le mois prochain ?', 'How many people do you plan to encourage to practice DDEWG next month?', {fr:'personnes',en:'people'}),
  { name:'engagement_prochain', label:{fr:'Maintenez-vous votre engagement de RDQD pour le mois prochain ?',en:'Are you keeping your DDEWG commitment for next month?'}, type:'radio', required:true, options:YN },
];

const FINANCES = [
  { name:'mois', label:{fr:'Mois concerné par ce compte rendu',en:'Month concerned by this report'}, type:'month', required:true },
  { name:'budget_etabli', label:{fr:'Avez-vous établi un budget pour ce mois ?',en:'Did you set a budget for this month?'}, type:'radio', required:true, options:YN },
  { name:'budget_utilise', label:{fr:'Avez-vous effectivement utilisé votre budget pour gérer vos dépenses ?',en:'Did you actually use your budget to manage your spending?'}, type:'radio', required:true, options:[
    O('regulierement','Oui, régulièrement','Yes, regularly'), O('en_partie','En partie','Partly'), O('non','Non','No') ] },
  { name:'budget_raisons', label:{fr:"Si vous n'avez pas pu respecter votre budget, quelles en sont les raisons ?",en:'If you were unable to stick to your budget, what were the reasons?'}, type:'textarea' },
  { name:'dime_fidelite', label:{fr:'Avez-vous été fidèle à donner votre dîme durant ce mois-ci ?',en:'Were you faithful in giving your tithe this month?'}, type:'radio', required:true, options:REALISATION3 },
  { name:'offrande_engagement', label:{fr:'Vous étiez-vous engagé(e) à ajouter une offrande ?',en:'Had you committed to adding an offering?'}, type:'radio', options:YN },
  { name:'offrande_donnee', label:{fr:'Avez-vous donné une offrande durant cette période ?',en:'Did you give an offering during this period?'}, type:'radio', options:YN },
  { name:'pct_dime', label:{fr:'Quel est votre pourcentage de don à Dieu — Dîme (%)',en:'What is your percentage given to God — Tithe (%)'}, type:'number', attrs:'min="0" max="100" inputmode="numeric"' },
  { name:'pct_offrande', label:{fr:'Quel est votre pourcentage de don à Dieu — Offrandes (%)',en:'What is your percentage given to God — Offerings (%)'}, type:'number', attrs:'min="0" max="100" inputmode="numeric"' },
  { name:'epargne_engagement', label:{fr:'Vous étiez-vous engagé(e) à épargner chaque mois ?',en:'Had you committed to saving every month?'}, type:'radio', options:YN },
  { name:'epargne_faite', label:{fr:'Avez-vous épargné durant ce mois ?',en:'Did you save during this month?'}, type:'radio', options:YN },
  { name:'epargne_maintenue', label:{fr:"Avez-vous pu maintenir votre engagement d'épargne malgré vos autres dépenses ?",en:'Were you able to keep your savings commitment despite your other expenses?'}, type:'radio', options:REALISATION3 },
  { name:'endette', label:{fr:'Êtes-vous actuellement endetté(e) ?',en:'Are you currently in debt?'}, type:'radio', required:true, options:YN },
  { name:'dettes_liste', label:{fr:'Avez-vous établi la liste de vos dettes et des personnes envers lesquelles vous êtes engagé(e) ?',en:'Have you listed your debts and the people you owe?'}, type:'radio', options:YN, showIf:{ name:'endette', equals:'oui' } },
  { name:'dettes_plan', label:{fr:'Avez-vous établi un plan de remboursement de vos dettes ?',en:'Have you set up a debt repayment plan?'}, type:'radio', options:[O('oui','Oui','Yes'),O('en_cours','En cours','In progress'),O('non','Non','No')], showIf:{ name:'endette', equals:'oui' } },
  { name:'dettes_remboursement', label:{fr:'Avez-vous effectué au moins un remboursement durant cette période ?',en:'Did you make at least one repayment during this period?'}, type:'radio', options:YN, showIf:{ name:'endette', equals:'oui' } },
  { name:'dettes_pct', label:{fr:'Quel pourcentage de votre dette avez-vous payé ?',en:'What percentage of your debt have you paid off?'}, type:'number', attrs:'min="0" max="100" inputmode="numeric"', showIf:{ name:'endette', equals:'oui' } },
  { name:'dettes_difficultes', label:{fr:'Quelles difficultés rencontrez-vous dans le remboursement de vos dettes ?',en:'What difficulties are you facing in repaying your debts?'}, type:'textarea', showIf:{ name:'endette', equals:'oui' } },
  { name:'amelioration', label:{fr:'Quel aspect de votre gestion financière avez-vous le mieux amélioré ?',en:'Which aspect of your financial management have you improved the most?'}, type:'textarea' },
  { name:'temoignage', label:{fr:'Quel témoignage souhaitez-vous partager concernant votre gestion financière ?',en:'What testimony would you like to share about your financial management?'}, type:'textarea' },
];

const LOUANGE = [
  { name:'mois', label:{fr:'Mois concerné',en:'Month concerned'}, type:'month', required:true },
  N('jc_prevues', 'Nombre de proclamations « Jésus-Christ est le Seigneur » prévues', 'Number of "Jesus Christ is Lord" proclamations planned'),
  N('jc_realisees', 'Nombre de proclamations « Jésus-Christ est le Seigneur » effectivement réalisées', 'Number of "Jesus Christ is Lord" proclamations actually made'),
  N('autres_prevues', "Nombre d'autres proclamations prévues", 'Number of other proclamations planned'),
  N('autres_realisees', "Nombre d'autres proclamations effectivement réalisées", 'Number of other proclamations actually made'),
  N('prophetie', 'Nombre de proclamations intégrales de la prophétie du renversement du prince satanique du Cameroun réalisées', 'Number of full proclamations of the prophecy of the overthrow of the satanic prince of Cameroon'),
  { name:'participation', label:{fr:'Participation',en:'Participation'}, type:'checkcount', options:[
    O('seul','Seul','Alone'), { value:'famille', fr:'Famille', en:'Family', count:true }, { value:'eglise_maison', fr:'Église de maison', en:'House church', count:true },
    { value:'eglise_locale', fr:'Église locale', en:'Local church', count:true }, { value:'autre', fr:'Autre', en:'Other', count:true } ] },
  { name:'difficultes', label:{fr:'Difficultés rencontrées',en:'Difficulties encountered'}, type:'textarea' },
  { name:'temoignages', label:{fr:'Témoignages / observations',en:'Testimonies / observations'}, type:'textarea' },
  { name:'engagement', label:{fr:'Engagement maintenu pour le mois suivant',en:'Commitment kept for the following month'}, type:'radio', required:true, options:YN },
];

const EVANGELISATION = [
  { name:'mois', label:{fr:'Mois concerné',en:'Month concerned'}, type:'month', required:true },
  N('evangelises', 'Combien de personnes as-tu évangélisées ce mois-ci ?', 'How many people did you evangelize this month?', {fr:'personnes',en:'people'}),
  N('sorties', "Combien de sorties d'évangélisation as-tu eues ?", 'How many evangelism outings did you have?', {fr:'fois',en:'times'}),
  N('engages', 'Combien de personnes se sont engagées à suivre Jésus-Christ ?', 'How many people committed to follow Jesus Christ?', {fr:'personnes',en:'people'}),
  N('suivis', 'Combien de personnes es-tu en train de suivre ?', 'How many people are you currently following up with?', {fr:'personnes',en:'people'}),
  { name:'temoignage', label:{fr:'Partage avec nous le témoignage de ce que Dieu a fait.',en:'Share with us the testimony of what God has done.'}, type:'textarea' },
  { name:'objectifs', label:{fr:'Quels sont tes objectifs pour le mois prochain ?',en:'What are your goals for next month?'}, type:'textarea' },
];

const SERVICE = [
  { name:'prevu', label:{fr:"Qu'as-tu prévu de faire pour servir tes autorités ?",en:'What did you plan to do to serve your authorities?'}, type:'textarea', required:true, hint:{fr:"Exemples : parents, faiseurs de disciples, dirigeants, responsables d'église, etc.",en:'Examples: parents, discipleship makers, leaders, church officials, etc.'} },
  { name:'fait', label:{fr:"Qu'as-tu effectivement fait pour servir tes autorités ?",en:'What did you actually do to serve your authorities?'}, type:'textarea', required:true },
  N('actes', 'Combien de fois as-tu posé un acte concret de service ?', 'How many times did you take a concrete act of service?'),
  { name:'autorites', label:{fr:'Auprès de quelles autorités as-tu servi ?',en:'Which authorities did you serve?'}, type:'checkbox', options:[
    O('parents','Parents','Parents'), O('faiseurs','Faiseur(s) de disciple','Discipleship maker(s)'), O('dirigeants','Dirigeant(s)','Leader(s)'),
    O('responsables_eglise',"Responsable(s) d'église",'Church official(s)'), O('autres','Autre(s)','Other(s)') ] },
  { name:'realisation', label:{fr:'Ton engagement a-t-il été réalisé ?',en:'Was your commitment fulfilled?'}, type:'radio', required:true, options:REALISATION4 },
  { name:'non_realise', label:{fr:"Si nécessaire, explique ce qui n'a pas été réalisé.",en:'If necessary, explain what was not fulfilled.'}, type:'textarea' },
  { name:'temoignage', label:{fr:'Quel témoignage peux-tu partager concernant ton service ?',en:'What testimony can you share about your service?'}, type:'textarea' },
  { name:'engagement', label:{fr:'Quel est ton engagement de service pour le mois prochain ?',en:'What is your service commitment for next month?'}, type:'textarea', required:true },
  N('encourages', 'Combien de personnes comptes-tu encourager à faire de même le mois prochain ?', 'How many people do you plan to encourage to do the same next month?', {fr:'personnes',en:'people'}),
];

const LITTERATURE = [
  { name:'mois', label:{fr:'Mois concerné par ce compte rendu',en:'Month concerned by this report'}, type:'month', required:true },
  N('ztf_engages', 'Combien de livres ZTF vous étiez-vous engagé(e) à lire ?', 'How many ZTF books did you commit to read?'),
  N('ztf_acheves', 'Combien de livres ZTF avez-vous effectivement achevés ce mois-ci ?', 'How many ZTF books did you actually finish this month?'),
  { name:'ztf_titres', label:{fr:'Quels livres ZTF avez-vous lus durant cette période ?',en:'Which ZTF books did you read during this period?'}, type:'textarea' },
  { name:'resume', label:{fr:'Avez-vous préparé un résumé des livres lus ?',en:'Did you prepare a summary of the books you read?'}, type:'radio', required:true, options:[O('oui','Oui','Yes'),O('en_partie','En partie','Partly'),O('non','Non','No')] },
  N('chemin_engages', 'Combien de livres de la série « Le Chemin » vous étiez-vous engagé(e) à lire ?', 'How many books from the "Le Chemin" series did you commit to read?'),
  { name:'chemin_titres', label:{fr:'Quels livres de la série « Le Chemin » avez-vous lus ?',en:'Which books from the "Le Chemin" series did you read?'}, type:'textarea' },
  { name:'enseignement', label:{fr:'Quel enseignement principal avez-vous retenu de vos lectures ?',en:'What main lesson did you take from your reading?'}, type:'textarea', required:true },
  { name:'temoignage', label:{fr:'Quel témoignage souhaitez-vous partager ?',en:'What testimony would you like to share?'}, type:'textarea' },
  N('encourages', 'Combien de personnes avez-vous effectivement encouragées ?', 'How many people did you actually encourage?', {fr:'personnes',en:'people'}),
  N('ont_commence', 'Combien de ces personnes ont commencé à lire ?', 'How many of these people started reading?', {fr:'personnes',en:'people'}),
  { name:'accompagnement', label:{fr:'Comment les avez-vous encouragées ou accompagnées ?',en:'How did you encourage or support them?'}, type:'textarea' },
  { name:'engagement_prochain', label:{fr:'Quels livres vous engagez-vous à lire durant le prochain mois ?',en:'Which books do you commit to reading next month?'}, type:'textarea', required:true },
  N('a_achever', 'Combien de livres comptez-vous achever le mois prochain ?', 'How many books do you plan to finish next month?'),
];

const BIBLE = [
  { name:'mois', label:{fr:'Mois concerné',en:'Month concerned'}, type:'month', required:true },
  { name:'engagement_pris', label:{fr:'Combien de fois vous étiez-vous engagé(e) à achever la lecture de la Bible ?',en:'How many times had you committed to finishing reading the Bible?'}, type:'radio', required:true, options:[O('1fois','1 fois','1 time'),O('2fois','2 fois','2 times'),O('3fois','3 fois','3 times')] },
  { name:'quotidienne', label:{fr:'Avez-vous lu votre Bible chaque jour durant cette période ?',en:'Did you read your Bible every day during this period?'}, type:'radio', required:true, options:QUOTIDIEN3 },
  { name:'portion', label:{fr:'Quelle portion de la Bible avez-vous lue ce mois-ci ?',en:'What portion of the Bible did you read this month?'} },
  { name:'raisons', label:{fr:"Si vous n'avez pas entièrement réalisé votre engagement, quelles en sont les raisons ?",en:'If you did not fully fulfill your commitment, what were the reasons?'}, type:'textarea' },
  { name:'fidelite', label:{fr:"Qu'est-ce qui vous a aidé à rester fidèle dans la lecture de la Bible ?",en:'What helped you stay faithful in reading the Bible?'}, type:'textarea' },
  { name:'enseignement', label:{fr:'Avez-vous tiré un enseignement particulier de votre lecture durant cette période ?',en:'Did you draw any particular lesson from your reading during this period?'}, type:'textarea' },
  { name:'temoignage', label:{fr:'Quel témoignage souhaitez-vous partager concernant votre lecture de la Bible ?',en:'What testimony would you like to share about your Bible reading?'}, type:'textarea' },
  N('encourages', 'Combien de personnes allez-vous encourager à faire de même ?', 'How many people will you encourage to do the same?', {fr:'personnes',en:'people'}),
];

const BERTOUA = [
  { name:'mois', label:{fr:'Mois concerné',en:'Month concerned'}, type:'month', required:true },
  { name:'engagement_pris', label:{fr:"Combien de fois t'étais-tu engagé(e) à faire chaque unité d'enseignement ?",en:'How many times had you committed to doing each teaching unit?'}, type:'radio', required:true, options:[O('7fois','7 fois','7 times'),O('12fois','12 fois','12 times')] },
  N('etudiees', "Combien d'unités d'enseignement du message de Bertoua as-tu étudiées durant ce mois ?", 'How many teaching units of the Bertoua Message did you study this month?'),
  N('enseignees', "Combien d'unités d'enseignement du message de Bertoua as-tu enseignées durant ce mois ?", 'How many teaching units of the Bertoua Message did you teach this month?'),
  { name:'realisation', label:{fr:'Quel a été ton niveau de réalisation de cet engagement ?',en:'What was your level of fulfillment of this commitment?'}, type:'radio', required:true, options:REALISATION4 },
  N('personnes_enseignees', 'À combien de personnes as-tu enseigné le message de Bertoua ?', 'How many people did you teach the Bertoua Message to?', {fr:'personnes',en:'people'}),
];

const ZACH_QUESTION = { name:'question_zach', label:{fr:"Avez-vous une question par rapport à l'imitation du frère Zach dans ce domaine ?",en:'Do you have a question about imitating Brother Zach in this area?'}, type:'textarea' };

const DOMAINS = [
  { id:'jeune',     label:{fr:'Jeûne',en:'Fasting'},                   icon:'<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.5"/><path d="M4 4l16 16"/>', fields:JEUNE },
  { id:'priere',    label:{fr:'Prière',en:'Prayer'},                   icon:'<path d="M12 4c-3 3-4 7-4 11l4 5 4-5c0-4-1-8-4-11zM12 4v16"/>', fields:PRIERE },
  { id:'rdqd',      label:{fr:'RDQD (Rencontre Dynamique Quotidienne avec Dieu)',en:'DDEWG (Dynamic Daily Encounter with God)'}, icon:'<path d="M3 18h18M6 18a6 6 0 0112 0M12 6V3M4.6 9.6L3 8M19.4 9.6L21 8"/>', fields:RDQD },
  { id:'finances',  label:{fr:'Finances',en:'Finances'},               icon:'<circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-1 1-2 3-2s3 1 3 2-1 1.6-3 2-3 1-3 2 1 2 3 2 3-1 3-2M12 6v1.5M12 16.5V18"/>', fields:FINANCES },
  { id:'louange',   label:{fr:'Louange',en:'Praise'},                  icon:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>', fields:LOUANGE },
  { id:'bible',     label:{fr:'Lecture de la Bible',en:'Bible reading'}, icon:'<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14"/>', fields:BIBLE },
  { id:'litterature', label:{fr:'Littérature chrétienne',en:'Christian literature'}, icon:'<path d="M4 5.5C4 4.7 4.7 4 5.5 4H10a2 2 0 012 2 2 2 0 012-2h4.5c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5H14a2 2 0 00-2 2 2 2 0 00-2-2H5.5A1.5 1.5 0 014 18.5v-13zM12 6v14"/>', fields:LITTERATURE },
  { id:'evangelisation', label:{fr:'Évangélisation',en:'Evangelism'},  icon:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>', fields:EVANGELISATION },
  { id:'service',   label:{fr:'Service',en:'Service'},                 icon:'<path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.5C20 15.3 12 20 12 20z"/>', fields:SERVICE },
  { id:'bertoua',   label:{fr:'Message de Bertoua',en:'Bertoua Message'}, icon:'<path d="M12 3v18M6 9h12"/>', fields:BERTOUA },
];

const ACCOUNT_FIELDS = [
  { name:'nom', label:{fr:'Nom',en:'Name'}, required:true, autocomplete:'name' },
  { name:'telephone', label:{fr:'Téléphone',en:'Phone number'}, type:'tel', required:true, autocomplete:'tel' },
  { name:'email', label:{fr:'Email',en:'Email'}, type:'email', required:true, autocomplete:'email' },
  { name:'province', label:{fr:'Province spirituelle ou nation',en:'Spiritual province or nation'}, required:true },
  { name:'faiseur', label:{fr:'Faiseur de disciple',en:'Discipleship maker'}, required:true },
  { name:'faiseur_tel', label:{fr:'Son téléphone',en:'Their phone number'}, type:'tel' },
  { name:'faiseur_email', label:{fr:'Son email',en:'Their email'}, type:'email' },
  { name:'camp_niveau', label:{fr:'Dernière participation aux camps bibliques internationaux à Koumé-Bertoua',en:'Last attendance at the Koumé-Bertoua international Bible camps'}, type:'radio', required:true, options:[O('fondation','Fondation','Foundation'),O('leadeur','Leadeur','Leader')] },
  { name:'camp_annee', label:{fr:'Année',en:'Year'}, type:'number', required:true, attrs:'min="1970" max="2100" inputmode="numeric"' },
  { name:'password', label:{fr:'Mot de passe',en:'Password'}, type:'password', required:true, min:6, autocomplete:'new-password' },
];

/* ---------- Backend Supabase (comptes + réponses centralisés) ---------- */
const SUPABASE_URL = 'https://nmhgtwfupjnzpiiwavjh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taGd0d2Z1cGpuenBpaXdhdmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNzE2MzMsImV4cCI6MjEwNTk0NzYzM30.4uLSfrNM3V57tnmUi6LrUQX0c7wGSicbhHsmXiQ7CPA';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;

const authErrorFr = err => {
  const m = (err && err.message || '').toLowerCase();
  if (m.includes('already registered') || m.includes('already exists') || m.includes('already been registered')) return { fr:'Un compte existe déjà avec cet email.', en:'An account already exists with this email.' };
  if (m.includes('invalid login credentials')) return { fr:'Email ou mot de passe incorrect.', en:'Incorrect email or password.' };
  if (m.includes('password')) return { fr:'Le mot de passe doit contenir au moins 6 caractères.', en:'The password must be at least 6 characters long.' };
  return { fr:(err && err.message) || 'Une erreur est survenue, réessayez.', en:(err && err.message) || 'An error occurred, please try again.' };
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
    if (error) throw Error(T(authErrorFr(error)));
    if (!data.session) throw Error(T({ fr:'Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous.', en:'Account created. Check your email to confirm your address, then log in.' }));
    const { data: profile, error: e2 } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
    if (e2) throw Error(T({ fr:"Compte créé, mais le profil n'a pas pu être chargé. Réessayez de vous connecter.", en:'Account created, but the profile could not be loaded. Try logging in again.' }));
    return currentUser = profile;
  },
  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw Error(T(authErrorFr(error)));
    const { data: profile, error: e2 } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
    if (e2) throw Error(T({ fr:'Impossible de récupérer votre profil.', en:'Unable to retrieve your profile.' }));
    return currentUser = profile;
  },
  async logout() { await sb.auth.signOut(); currentUser = null; },
  async submit(domain, data) {
    const user = await api.me();
    const { error } = await sb.from('submissions').insert({ user_id: user.id, domain, data });
    if (error) throw Error(T({ fr:"L'enregistrement a échoué : ", en:'Saving failed: ' }) + error.message);
  },
};

/* ---------- Composants ---------- */
const hero = (title, sub, extra='', cls='', img='') => `<header class="hero ${cls}">${img ? `<img class="bg" src="${img}" alt="" onerror="this.remove()">` : ''}<div class="bar">${LOGO}<div class="bar-right">${extra}<button class="pill lang-btn" onclick="setLang('${LANG==='fr'?'en':'fr'}')" aria-label="${LANG==='fr'?'Switch to English':'Passer en français'}">${LANG==='fr'?'EN':'FR'}</button><button class="pill icon-only" onclick="setTheme('${THEME==='dark'?'light':'dark'}')" aria-label="${T({fr:'Changer de thème',en:'Switch theme'})}">${THEME==='dark'?SUN_ICON:MOON_ICON}</button><button id="installBtn" class="pill icon-only" hidden aria-label="${T({fr:"Installer l'application",en:'Install the app'})}">${DL_ICON}</button></div></div><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</header>`;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200); };

function fieldValueDisplay(f, u) {
  const v = u[f.name];
  if (f.options) { const o = f.options.find(o => o.value === v); return o ? T(o) : (v ?? '—'); }
  return (v ?? '') === '' ? '—' : v;
}

function field(f) {
  const id = 'f_'+f.name, req = f.required ? 'required' : '';
  const wrapAttrs = f.showIf ? ` class="cond" data-show-if="${f.showIf.name}" data-show-val="${esc(f.showIf.equals)}" hidden` : '';
  if (f.type === 'split-time') {
    const hoursName = f.hourName || f.name;
    const minutesName = f.minuteName || `${f.name}_minutes`;
    const hoursLabel = T(f.hoursLabel || {fr:'Heures',en:'Hours'});
    const minutesLabel = T(f.minutesLabel || {fr:'Minutes',en:'Minutes'});
    return `<div class="fld"${wrapAttrs}><label>${esc(T(f.label))}</label><div class="time-split"><label class="time-box"><span>${hoursLabel}</span><input id="${id}_h" name="${hoursName}" type="number" min="0" max="24" inputmode="numeric" ${req}></label><label class="time-box"><span>${minutesLabel}</span><input id="${id}_m" name="${minutesName}" type="number" min="0" max="59" inputmode="numeric" ${req}></label></div></div>`;
  }
  if (f.type === 'radio' || f.type === 'checkbox') {
    const seg = f.type === 'radio' && f.options.length <= 2;
    const attrs = seg ? (f.showIf ? wrapAttrs.replace('class="cond"', 'class="cond seg"') : ' class="seg"') : wrapAttrs;
    return `<fieldset${attrs}><legend>${esc(T(f.label))}</legend><div class="opt-row">${f.options.map(o => `<label class="opt"><input type="${f.type}" name="${f.name}" value="${esc(o.value)}" ${f.type==='radio'?req:''}><span>${esc(T(o))}</span></label>`).join('')}</div></fieldset>`;
  }
  if (f.type === 'checkcount')
    return `<fieldset${wrapAttrs}><legend>${esc(T(f.label))}</legend>${f.options.map((o,i) => `<div class="opt"><input type="checkbox" id="${id}_${i}" name="${f.name}" value="${esc(o.value)}"><label for="${id}_${i}">${esc(T(o))}</label>${o.count ? `<input class="nb" type="number" min="1" inputmode="numeric" name="${f.name}_${o.value}" placeholder="${esc(T({fr:'Nombre',en:'Number'}))}" aria-label="${esc(T({fr:'Nombre — ',en:'Number — '}) + T(o))}" disabled>` : ''}</div>`).join('')}</fieldset>`;
  let inp;
  if (f.type === 'textarea') inp = `<textarea id="${id}" name="${f.name}" ${req}></textarea>`;
  else if (f.type === 'select') inp = `<select id="${id}" name="${f.name}" ${req}><option value="">${esc(T({fr:'Choisir…',en:'Choose…'}))}</option>${f.options.map(o => `<option value="${esc(o.value)}">${esc(T(o))}</option>`).join('')}</select>`;
  else inp = `<input id="${id}" name="${f.name}" type="${f.type||'text'}" ${f.min?`minlength="${f.min}"`:''} ${f.attrs ?? (f.type==='number' ? 'min="0" inputmode="numeric"' : '')} ${f.autocomplete?`autocomplete="${f.autocomplete}"`:''} ${req}>`;
  return `<div class="fld"${wrapAttrs}><label for="${id}">${esc(T(f.label))}</label>${f.hint ? `<small>${esc(T(f.hint))}</small>` : ''}${f.unit ? `<div class="wrap">${inp}<span class="unit">${esc(T(f.unit))}</span></div>` : inp}</div>`;
}
const formData = form => { const fd = new FormData(form), o = {}; for (const k of new Set(fd.keys())) { const a = fd.getAll(k); o[k] = a.length > 1 ? a : a[0]; } return o; };

/* ---------- Vues ---------- */
function viewAuth(mode) {
  const reg = mode === 'register';
  const fields = reg ? ACCOUNT_FIELDS : [ACCOUNT_FIELDS[2], { ...ACCOUNT_FIELDS.find(f => f.name === 'password'), autocomplete:'current-password' }];
  $('#app').innerHTML = `${hero('<img class="brand" src="icons/logo.webp" alt="ZTF Imitators" width="320" height="158">', T({fr:'Les domaines de la vie chrétienne, un formulaire à la fois',en:'The areas of Christian life, one form at a time'}))}
  <main><nav class="tabs"><a href="#/inscription" class="${reg?'on':''}">${T({fr:'Créer un compte',en:'Create an account'})}</a><a href="#/connexion" class="${reg?'':'on'}">${T({fr:'Se connecter',en:'Log in'})}</a></nav>
  ${reg?`<p class="hint">${T({fr:'Un compte est nécessaire pour accéder aux formulaires.',en:'An account is required to access the forms.'})}</p>`:''}
  <form id="auth"><p class="err" role="alert"></p>${fields.map(field).join('')}<button class="btn">${reg?T({fr:'Créer mon compte',en:'Create my account'}):T({fr:'Se connecter',en:'Log in'})}</button></form></main>`;
  $('#auth').onsubmit = async e => {
    e.preventDefault(); const b = e.target.querySelector('.btn'); b.disabled = true;
    try { const d = formData(e.target); reg ? await api.register(d) : await api.login(d.email, d.password); location.hash = '#/'; await route(); }
    catch (x) { e.target.querySelector('.err').textContent = x.message; b.disabled = false; }
  };
}

async function fetchMonthProgress(userId) {
  const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
  const { data, error } = await sb.from('submissions').select('domain').eq('user_id', userId).gte('created_at', start.toISOString());
  if (error) return new Set();
  return new Set((data || []).map(r => r.domain));
}
async function viewHome(u) {
  const adminLink = u.is_admin ? `<a class="pill icon-only" href="#/admin" aria-label="${T({fr:'Dashboard admin',en:'Admin dashboard'})}" title="${T({fr:'Dashboard admin',en:'Admin dashboard'})}">${ADMIN_ICON}</a>` : '';
  $('#app').innerHTML = `${hero('ZTF Imitators', T({fr:'Bienvenue, ',en:'Welcome, '})+esc(u.nom.split(' ')[0]), adminLink + `<a class="pill icon-only" href="#/profil" aria-label="${T({fr:'Mon compte',en:'My account'})}" title="${T({fr:'Mon compte',en:'My account'})}">${USER_ICON}</a>`)}
  <main><div id="homeBody"><p class="hint">${T({fr:'Chargement…',en:'Loading…'})}</p></div></main>`;
  const body = $('#homeBody');
  const done = await fetchMonthProgress(u.id);
  const n = done.size, total = DOMAINS.length;
  body.innerHTML = `
    <div class="progress-card">
      <div class="progress-label">${T({fr:`${n} domaine(s)${n>1?'s':''} sur ${total} renseigné(s)${n>1?'s':''} ce mois-ci`,en:`${n} of ${total} domains submitted this month`})}</div>
      <div class="prog"><i style="width:${total ? Math.round(n/total*100) : 0}%"></i></div>
    </div>
    <ul class="ledger">${DOMAINS.map((d,i) => `<li><a class="row" href="#/d/${d.id}"><span class="idx">${String(i+1).padStart(2,'0')}</span>${ic(d.icon)}<span class="row-name">${T(d.label)}</span><span class="mark ${done.has(d.id)?'done':'pending'}"></span></a></li>`).join('')}</ul>`;
}

function viewForm(d) {
  const fields = d.fields.length ? [...d.fields, ZACH_QUESTION] : [];
  const has = fields.length;
  $('#app').innerHTML = `${hero(T(d.label),'','<a class="back" href="#/">'+T({fr:'← Retour',en:'← Back'})+'</a>','compact',`img/${d.id}.jpg`)}
  <main>${has ? `<form id="f">${fields.map(field).join('')}<button class="btn">${T({fr:'Enregistrer',en:'Save'})}</button></form>`
    : `<div class="empty">${ic(d.icon)}<p>${T({fr:'Le questionnaire de ce domaine sera bientôt disponible.',en:"This domain's form will be available soon."})}</p></div>`}</main>`;
  if (has) $('#f').onsubmit = async e => {
    e.preventDefault(); const btn = e.target.querySelector('.btn'); btn.disabled = true;
    try { await api.submit(d.id, formData(e.target)); toast(T({fr:'Réponses enregistrées',en:'Responses saved'})); location.hash = '#/'; await route(); }
    catch (x) { toast(x.message); btn.disabled = false; }
  };
}

/* ---------- Dashboard admin ---------- */
let charts = [];
const clearCharts = () => { charts.forEach(c => c.destroy()); charts = []; };
function statBar(canvasId, labels, values, label) {
  const ctx = document.getElementById(canvasId); if (!ctx) return;
  charts.push(new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{ label, data:values, backgroundColor:'#1868C4', borderRadius:6 }] },
    options:{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, ticks:{ precision:0 } } } },
  }));
}
const monthKey = iso => String(iso).slice(0,7);
const monthLabel = key => { const [y,m] = key.split('-').map(Number); return new Date(y, m-1, 1).toLocaleDateString(LANG==='fr'?'fr-FR':'en-US', { month:'short', year:'2-digit' }); };
function lastMonths(n) { const out=[], d=new Date(); d.setDate(1); for (let i=n-1;i>=0;i--) { const x=new Date(d.getFullYear(), d.getMonth()-i, 1); out.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`); } return out; }

async function fetchOverview() {
  const [{ count:totalUsers }, { data:subs, error:e1 }, { data:profs, error:e2 }] = await Promise.all([
    sb.from('profiles').select('id', { count:'exact', head:true }),
    sb.from('submissions').select('domain,user_id,created_at'),
    sb.from('profiles').select('province,camp_niveau'),
  ]);
  if (e1) throw Error(e1.message); if (e2) throw Error(e2.message);
  const counts = Object.fromEntries(DOMAINS.map(d => [d.id, 0]));
  (subs || []).forEach(r => { if (counts[r.domain] !== undefined) counts[r.domain]++; });
  const months = lastMonths(6);
  const trend = Object.fromEntries(months.map(m => [m,0]));
  (subs || []).forEach(r => { const k = monthKey(r.created_at); if (trend[k] !== undefined) trend[k]++; });
  const thisMonth = monthKey(new Date().toISOString());
  const activeThisMonth = new Set((subs || []).filter(r => monthKey(r.created_at) === thisMonth).map(r => r.user_id)).size;
  const provinceCounts = {};
  (profs || []).forEach(p => { const k = (p.province || '').trim() || '—'; provinceCounts[k] = (provinceCounts[k] || 0) + 1; });
  const campCounts = { fondation:0, leadeur:0 };
  (profs || []).forEach(p => { if (p.camp_niveau === 'fondation') campCounts.fondation++; else if (p.camp_niveau === 'leadeur') campCounts.leadeur++; });
  return { totalUsers:totalUsers || 0, totalSubs:(subs || []).length, counts, months, trend, activeThisMonth, provinceCounts, campCounts };
}
async function fetchDomainSubs(domainId) {
  const { data, error } = await sb.from('submissions').select('data,created_at,profiles(nom)').eq('domain', domainId).order('created_at', { ascending:false });
  if (error) throw Error(error.message);
  return data || [];
}

const USER_GEO = {
  cameroon:[6.37,12.35], cameroun:[6.37,12.35], france:[46.22,2.21], canada:[56.13,-106.35], usa:[37.09,-95.71], uk:[55.38,-3.44],
  belgium:[50.5,4.47], switzerland:[46.82,8.23], germany:[51.17,10.45], italy:[41.87,12.57], spain:[40.46,-3.75], portugal:[39.4,-8.22],
  senegal:[14.5,-14.45], ivory_coast:[7.54,-5.55], "cote_divoire":[7.54,-5.55], nigeria:[9.08,8.68], ghana:[7.95,-1.02],
  gabon:[-0.8,11.61], congo:[-0.19,15.27], "democratic_republic_of_the_congo":[-2.88,23.66], rwanda:[-1.94,29.87], kenya:[-0.02,37.91],
  benin:[9.31,2.31], togo:[8.62,0.82], burkina_faso:[12.24,-1.56], mali:[17.57,-3.99], mauritania:[21.01,-10.94],
  morocco:[31.79,-7.09], algeria:[28.03,1.66], tunisia:[33.89,9.54], egypt:[26.82,30.8], south_africa:[-30.56,22.94],
  australia:[-25.27,133.78], india:[20.59,78.96], china:[35.86,104.2], japan:[36.2,138.25], korea:[35.9,127.77], turkey:[38.96,35.24],
  brazil:[-14.24,-51.93], argentina:[-38.42,-63.62], mexico:[23.63,-102.55], peru:[-9.19,-75.02], colombia:[4.57,-74.3],
  cameroon:[6.37,12.35], "united_arab_emirates":[23.42,53.85], qatar:[25.35,51.18], saudi_arabia:[23.89,45.08], jordan:[31.24,36.51],
  azerbaijan:[40.14,47.58], israel:[31.05,34.85], "united_states":[37.09,-95.71], "united_kingdom":[55.38,-3.44], "cote_d_ivoire":[7.54,-5.55]
};

function normalizeGeoKey(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  return raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

async function fetchUsersMapData() {
  const [{ data: profiles, error: e1 }, { data: subs, error: e2 }] = await Promise.all([
    sb.from('profiles').select('id,nom,province'),
    sb.from('submissions').select('user_id')
  ]);
  if (e1) throw Error(e1.message);
  if (e2) throw Error(e2.message);

  const activeSet = new Set((subs || []).map(r => r.user_id).filter(Boolean));
  const spread = {};
  const mappedUsers = (profiles || []).map(p => {
    const key = normalizeGeoKey(p.province);
    const base = USER_GEO[key] || [0,0];
    const slot = `${base[0].toFixed(2)}:${base[1].toFixed(2)}`;
    const n = spread[slot] || 0;
    spread[slot] = n + 1;
    return {
      id: p.id,
      nom: p.nom || 'Utilisateur',
      province: p.province || '—',
      active: activeSet.has(p.id),
      lat: base[0] + (n % 6) * 0.8,
      lng: base[1] + (Math.floor(n / 6) % 6) * 0.8
    };
  });

  return { users: mappedUsers, activeUsers: mappedUsers.filter(u => u.active), registeredCount: mappedUsers.length, activeCount: mappedUsers.filter(u => u.active).length };
}

function makeMapGLMarker(color) {
  const el = document.createElement('div');
  el.className = 'mapgl-marker';
  el.style.setProperty('--marker-color', color);
  el.innerHTML = '<span class="mapgl-marker-dot"></span>';
  return el;
}

function renderAdminUsersMap(data) {
  const mapRoot = document.getElementById('adminUsersMap');
  if (!mapRoot || !window.maplibregl) return;

  if (window.__ztfAdminMap) {
    window.__ztfAdminMap.remove();
    window.__ztfAdminMap = null;
  }

  const map = new window.maplibregl.Map({
    container: mapRoot,
    style: {
      version: 8,
      sources: {
        esriImagery: {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Imagery © Esri · OpenStreetMap contributors'
        }
      },
      layers: [{ id: 'esri-imagery-layer', type: 'raster', source: 'esriImagery' }],
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
    },
    center: [10, 15],
    zoom: 2,
    attributionControl: true,
    preserveDrawingBuffer: true
  });

  window.__ztfAdminMap = map;

  map.addControl(new window.maplibregl.NavigationControl({ showCompass: true }), 'top-right');
  map.on('load', () => {
    const points = data.users.filter(u => Number.isFinite(u.lat) && Number.isFinite(u.lng));
    if (!points.length) return;

    points.forEach(u => {
      const color = u.active ? '#1aa260' : '#1868C4';
      const marker = new window.maplibregl.Marker({
        element: makeMapGLMarker(color),
        anchor: 'center'
      }).setLngLat([u.lng, u.lat]);

      const popup = new window.maplibregl.Popup({ offset: 18 }).setHTML(
        `<div class="mapgl-popup"><strong>${u.nom}</strong><br>${u.province}<br>${u.active ? 'Actif' : 'Inscrit'}</div>`
      );
      marker.setPopup(popup).addTo(map);
    });

    const bounds = points.reduce((acc, u) => {
      acc[0] = Math.min(acc[0], u.lng);
      acc[1] = Math.min(acc[1], u.lat);
      acc[2] = Math.max(acc[2], u.lng);
      acc[3] = Math.max(acc[3], u.lat);
      return acc;
    }, [Infinity, Infinity, -Infinity, -Infinity]);

    if (Number.isFinite(bounds[0])) {
      map.fitBounds([[bounds[1], bounds[0]], [bounds[3], bounds[2]]], { padding: 40, duration: 0 });
    }
  });
}

async function viewAdmin(u) {
  const h = location.hash.slice(2).split('/');
  const domain = h[1] ? DOMAINS.find(x => x.id === h[1]) : null;
  $('#app').innerHTML = `${hero(T({fr:'Dashboard admin',en:'Admin dashboard'}),'','<a class="back" href="#/">'+T({fr:'← Retour',en:'← Back'})+'</a>','compact')}
  <main>
    <p class="print-only print-header"></p>
    <div class="admin-toolbar print-hide">
      <a href="#/admin" class="admin-overview-link ${!domain?'on':''}">${T({fr:"Vue d'ensemble",en:'Overview'})}</a>
      <button class="export-btn" id="exportPdf" type="button">${T({fr:'⤓ Exporter en PDF',en:'⤓ Export as PDF'})}</button>
    </div>
    <ul class="admin-domains print-hide">${DOMAINS.map(d => `<li><a class="tile small ${domain?.id===d.id?'sel':''}" href="#/admin/${d.id}">${ic(d.icon)}<span>${T(d.label)}</span></a></li>`).join('')}</ul>
    <div id="adminBody"><p class="hint">${T({fr:'Chargement…',en:'Loading…'})}</p></div>
  </main>`;
  $('#exportPdf').onclick = () => print();
  const body = $('#adminBody');
  const printHeader = $('.print-header');
  clearCharts();
  try {
    if (!domain) {
      const ov = await fetchOverview();
      printHeader.textContent = T({fr:`ZTF Imitators — Vue d'ensemble — généré le ${new Date().toLocaleDateString('fr-FR')}`,en:`ZTF Imitators — Overview — generated on ${new Date().toLocaleDateString('en-US')}`});
      const pct = ov.totalUsers ? Math.round(ov.activeThisMonth/ov.totalUsers*100) : 0;
      const topProvinces = Object.entries(ov.provinceCounts).sort((a,b) => b[1]-a[1]).slice(0,6);
      const usersMap = await fetchUsersMapData();
      body.innerHTML = `
        <ul class="info stats">
          <li><b>${T({fr:'Imitateurs inscrits',en:'Registered imitators'})}</b>${ov.totalUsers}</li>
          <li><b>${T({fr:'Réponses reçues, tous domaines',en:'Responses received, all domains'})}</b>${ov.totalSubs}</li>
          <li><b>${T({fr:'Taux de participation ce mois',en:'Participation rate this month'})}</b>${T({fr:`${pct}\u00a0% (${ov.activeThisMonth} sur ${ov.totalUsers})`,en:`${pct}% (${ov.activeThisMonth} of ${ov.totalUsers})`})}</li>
          <li><b>${T({fr:'Camps Koumé-Bertoua',en:'Koumé-Bertoua camps'})}</b>${T({fr:`Fondation ${ov.campCounts.fondation} · Leadeur ${ov.campCounts.leadeur}`,en:`Foundation ${ov.campCounts.fondation} · Leader ${ov.campCounts.leadeur}`})}</li>
        </ul>
        <h2>${T({fr:'Utilisateurs inscrits et actifs dans le monde',en:'Registered and active users worldwide'})}</h2>
        <div class="admin-map-panel"><div id="adminUsersMap" class="admin-world-map"></div></div>
        <h2>${T({fr:'Réponses par domaine',en:'Responses by domain'})}</h2><div class="chart-wrap"><canvas id="chartOverview"></canvas></div>
        <h2>${T({fr:'Tendance — réponses par mois',en:'Trend — responses per month'})}</h2><div class="chart-wrap"><canvas id="chartTrend"></canvas></div>
        ${topProvinces.length ? `<h2>${T({fr:'Provinces spirituelles / nations',en:'Spiritual provinces / nations'})}</h2><div class="chart-wrap"><canvas id="chartProvince"></canvas></div>` : ''}
        <table class="print-only print-table"><thead><tr><th>${T({fr:'Domaine',en:'Domain'})}</th><th>${T({fr:'Réponses',en:'Responses'})}</th></tr></thead>
        <tbody>${DOMAINS.map(d => `<tr><td>${esc(T(d.label))}</td><td>${ov.counts[d.id] || 0}</td></tr>`).join('')}</tbody></table>`;
      renderAdminUsersMap(usersMap);
      statBar('chartOverview', DOMAINS.map(d => T(d.label)), DOMAINS.map(d => ov.counts[d.id] || 0), T({fr:'Réponses',en:'Responses'}));
      statBar('chartTrend', ov.months.map(monthLabel), ov.months.map(m => ov.trend[m] || 0), T({fr:'Réponses',en:'Responses'}));
      if (topProvinces.length) statBar('chartProvince', topProvinces.map(p => p[0]), topProvinces.map(p => p[1]), T({fr:'Imitateurs',en:'Imitators'}));
      return;
    }
    if (!domain.fields.length) { body.innerHTML = `<div class="empty">${ic(domain.icon)}<p>${T({fr:"Le formulaire de ce domaine n'est pas encore disponible.",en:"This domain's form is not available yet."})}</p></div>`; return; }
    const rows = await fetchDomainSubs(domain.id);
    if (!rows.length) { body.innerHTML = `<div class="empty">${ic(domain.icon)}<p>${T({fr:`Aucune réponse reçue pour ${T(domain.label)} pour l'instant.`,en:`No responses received yet for ${T(domain.label)}.`})}</p></div>`; return; }
    const months = [...new Set(rows.map(r => monthKey(r.created_at)))].sort().reverse();
    const choiceFields = domain.fields.filter(f => (f.type === 'radio' || f.type === 'checkbox') && f.options);
    const numberFields = domain.fields.filter(f => f.type === 'number');
    const textFields = domain.fields.filter(f => f.type === 'textarea');
    const nameOf = r => (r.profiles && r.profiles.nom) || '—';

    const renderDomain = selectedMonth => {
      clearCharts();
      const filtered = selectedMonth ? rows.filter(r => monthKey(r.created_at) === selectedMonth) : rows;
      const trendMonths = lastMonths(6);
      const trend = Object.fromEntries(trendMonths.map(m => [m,0]));
      rows.forEach(r => { const k = monthKey(r.created_at); if (trend[k] !== undefined) trend[k]++; });

      printHeader.textContent = T({
        fr:`ZTF Imitators — ${T(domain.label)} — ${selectedMonth?monthLabel(selectedMonth):'toutes périodes'} — généré le ${new Date().toLocaleDateString('fr-FR')}`,
        en:`ZTF Imitators — ${T(domain.label)} — ${selectedMonth?monthLabel(selectedMonth):'all periods'} — generated on ${new Date().toLocaleDateString('en-US')}`,
      });

      let html = `<div class="admin-filter print-hide"><label for="monthFilter">${T({fr:'Mois',en:'Month'})}</label><select id="monthFilter"><option value="">${T({fr:'Tous les mois',en:'All months'})}</option>${months.map(m => `<option value="${m}" ${m===selectedMonth?'selected':''}>${monthLabel(m)}</option>`).join('')}</select></div>`;
      html += `<p class="hint">${T({
        fr:`${filtered.length} réponse${filtered.length>1?'s':''} ${selectedMonth?'pour '+monthLabel(selectedMonth):'reçue'+(filtered.length>1?'s':'')} pour ${T(domain.label)}.`,
        en:`${filtered.length} response${filtered.length>1?'s':''} ${selectedMonth?'for '+monthLabel(selectedMonth):'received'} for ${T(domain.label)}.`,
      })}</p>`;
      if (numberFields.length) html += `<h2>${T({fr:'Chiffres clés',en:'Key figures'})}</h2><ul class="info stats">${numberFields.map(f => {
        const vals = filtered.map(r => Number(r.data[f.name])).filter(v => Number.isFinite(v));
        const sum = vals.reduce((a,b) => a+b, 0), avg = vals.length ? (sum/vals.length).toFixed(1) : '—';
        return `<li><b>${esc(T(f.label))}</b>${T({fr:`Total ${sum} · Moyenne ${avg} (${vals.length} réponse${vals.length>1?'s':''})`,en:`Total ${sum} · Average ${avg} (${vals.length} response${vals.length>1?'s':''})`})}</li>`;
      }).join('')}</ul>`;
      html += `<h2>${T({fr:'Tendance — réponses par mois',en:'Trend — responses per month'})}</h2><div class="chart-wrap"><canvas id="chartTrendDomain"></canvas></div>`;
      if (choiceFields.length) html += `<h2>${T({fr:'Répartition des choix',en:'Breakdown of choices'})}</h2>`;
      choiceFields.forEach((f,i) => html += `<p class="chart-title">${esc(T(f.label))}</p><div class="chart-wrap"><canvas id="chartField${i}"></canvas></div>`);
      if (textFields.length) {
        const recents = filtered.filter(r => textFields.some(f => r.data[f.name])).slice(0,5);
        html += `<h2>${T({fr:'Derniers témoignages',en:'Latest testimonies'})}</h2><ul class="info">${recents.length ? recents.map(r => {
          const f = textFields.find(f => r.data[f.name]); const v = String(r.data[f.name]);
          return `<li><b>${esc(nameOf(r))} — ${esc(T(f.label))}</b>${esc(v.slice(0,220))}${v.length > 220 ? '…' : ''}</li>`;
        }).join('') : `<li>${T({fr:"Aucun témoignage partagé pour l'instant.",en:'No testimony shared yet.'})}</li>`}</ul>`;
      }
      html += `<table class="print-only print-table"><thead><tr><th>${T({fr:'Nom',en:'Name'})}</th><th>${T({fr:'Date',en:'Date'})}</th>${numberFields.map(f => `<th>${esc(T(f.label))}</th>`).join('')}${choiceFields.map(f => `<th>${esc(T(f.label))}</th>`).join('')}</tr></thead><tbody>${filtered.map(r => {
        const numCells = numberFields.map(f => `<td>${esc(r.data[f.name] ?? '')}</td>`).join('');
        const choiceCells = choiceFields.map(f => { const v = r.data[f.name]; const vals = Array.isArray(v) ? v : [v]; const labels = vals.map(x => { const o = f.options.find(o => o.value === x); return o ? T(o) : x; }).filter(Boolean); return `<td>${esc(labels.join(', '))}</td>`; }).join('');
        return `<tr><td>${esc(nameOf(r))}</td><td>${new Date(r.created_at).toLocaleDateString(LANG==='fr'?'fr-FR':'en-US')}</td>${numCells}${choiceCells}</tr>`;
      }).join('')}</tbody></table>`;
      body.innerHTML = html;
      statBar('chartTrendDomain', trendMonths.map(monthLabel), trendMonths.map(m => trend[m] || 0), T(domain.label));
      choiceFields.forEach((f,i) => {
        const counts = Object.fromEntries(f.options.map(o => [o.value,0]));
        filtered.forEach(r => { const v = r.data[f.name]; (Array.isArray(v) ? v : [v]).forEach(x => { if (counts[x] !== undefined) counts[x]++; }); });
        statBar(`chartField${i}`, f.options.map(o => T(o)), f.options.map(o => counts[o.value]), T(f.label));
      });
      $('#monthFilter').onchange = e => renderDomain(e.target.value || null);
    };
    renderDomain(null);
  } catch (x) { body.innerHTML = `<p class="err">${T({fr:'Erreur de chargement : ',en:'Loading error: '})}${esc(x.message)}</p>`; }
}

function viewProfile(u) {
  const rows = ACCOUNT_FIELDS.filter(f => f.name !== 'password').map(f => `<li><b>${esc(T(f.label))}</b>${esc(fieldValueDisplay(f,u))}</li>`).join('');
  $('#app').innerHTML = `${hero(T({fr:'Mon compte',en:'My account'}),'','<a class="back" href="#/">'+T({fr:'← Retour',en:'← Back'})+'</a>','compact')}
  <main><ul class="info">${rows}</ul><button class="btn" id="out">${T({fr:'Se déconnecter',en:'Log out'})}</button></main>`;
  $('#out').onclick = async () => { await api.logout(); location.hash = '#/connexion'; await route(); };
}

/* ---------- Routeur ---------- */
async function route() {
  const u = await api.me(), h = location.hash.slice(2).split('/');
  const d = h[0] === 'd' ? DOMAINS.find(x => x.id === h[1]) : null;
  if (!u) viewAuth(h[0] === 'connexion' ? 'login' : 'register');
  else if (h[0] === 'admin' && u.is_admin) await viewAdmin(u);
  else if (d) viewForm(d);
  else if (h[0] === 'profil') viewProfile(u);
  else await viewHome(u);
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
      if (box.dataset.showIf === e.target.name) {
        const on = [...form.querySelectorAll(`[name="${box.dataset.showIf}"]`)].find(i => i.checked)?.value === box.dataset.showVal;
        box.hidden = !on;
        box.querySelectorAll('input,textarea,select').forEach(i => { if (i.dataset.wasRequired === undefined) i.dataset.wasRequired = i.required ? '1' : '0'; i.required = on && i.dataset.wasRequired === '1'; if (!on) i.value = i.type === 'radio' || i.type === 'checkbox' ? (i.checked = false) : ''; });
      }
    });
  }
});
addEventListener('hashchange', route);
$('#app').innerHTML = hero('ZTF Imitators', T({fr:'Chargement…',en:'Loading…'}));
route();
