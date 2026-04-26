/* =========================================================
   ATS Resume Analyser — app.js (Airbnb Design)
   ========================================================= */
'use strict';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ── DOM ───────────────────────────────────────────────────
const uploadPill   = document.getElementById('uploadPill');
const pillBtn      = document.getElementById('pillBtn');
const pillFileName = document.getElementById('pillFileName');
const fileInput    = document.getElementById('fileInput');
const fileChip     = document.getElementById('fileChip');
const fileName     = document.getElementById('fileName');
const fileSize     = document.getElementById('fileSize');
const btnRemove    = document.getElementById('btnRemove');
const btnAnalyse   = document.getElementById('btnAnalyse');
const progressWrap = document.getElementById('progressWrap');
const progressBar  = document.getElementById('progressBar');
const progressLabel= document.getElementById('progressLabel');
const progressPct  = document.getElementById('progressPct');
const results      = document.getElementById('results');
const scoreNumber  = document.getElementById('scoreNumber');
const scoreArc     = document.getElementById('scoreArc');
const scoreGrade   = document.getElementById('scoreGrade');
const resultHeadline = document.getElementById('resultHeadline');
const resultSummary  = document.getElementById('resultSummary');
const metaPills      = document.getElementById('metaPills');
const barScores    = document.getElementById('barScores');
const sectionCards = document.getElementById('sectionCards');
const previewText  = document.getElementById('previewText');
const previewToggle= document.getElementById('previewToggle');
const previewBody  = document.getElementById('previewBody');
const resultDate   = document.getElementById('resultDate');
const toast        = document.getElementById('toast');

let currentFile = null;
let radarChart  = null;

// ── Keywords ──────────────────────────────────────────────
const ACTION_VERBS = ['achieved','improved','developed','managed','led','created','designed',
  'built','increased','decreased','launched','coordinated','delivered','executed','implemented',
  'optimised','optimized','reduced','negotiated','generated','streamlined','trained','mentored',
  'collaborated','analysed','analyzed','reported','maintained','established','resolved'];

const TECH_SKILLS = ['python','javascript','typescript','java','c++','c#','sql','react','angular',
  'vue','node','django','flask','spring','docker','kubernetes','aws','azure','gcp','git','linux',
  'machine learning','deep learning','tensorflow','pytorch','excel','tableau','power bi','figma',
  'html','css','rest api','graphql','mongodb','postgresql','mysql','redis','ci/cd','agile','scrum'];

const SOFT_SKILLS = ['communication','leadership','teamwork','problem solving','critical thinking',
  'time management','adaptability','creativity','collaboration','project management'];

const DEGREE_WORDS = ['bachelor','master','phd','doctorate','bsc','msc','mba','b.tech','m.tech',
  'b.e','m.e','diploma','associate','undergraduate','graduate','degree'];

const SECTION_HEADERS = ['experience','education','skills','summary','objective','projects',
  'certifications','achievements','awards','languages','interests','volunteer','publications'];

// ── Helpers ───────────────────────────────────────────────
const norm = t => t.toLowerCase().replace(/[^a-z0-9\s]/g,' ');
const countMatches = (text, arr) => arr.filter(w => norm(text).includes(w)).length;
const hasEmail    = t => /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(t);
const hasPhone    = t => /(\+?\d[\d\s\-().]{7,}\d)/.test(t);
const hasLinkedIn = t => /linkedin\.com\/in\//i.test(t);
const hasGitHub   = t => /github\.com\//i.test(t);
const wordCount   = t => t.trim().split(/\s+/).filter(Boolean).length;

function scoreColor(s) {
  if (s >= 80) return { stroke:'#16a34a', cls:'c-great', badge:'badge-great', label:'Great' };
  if (s >= 60) return { stroke:'#ff385c', cls:'c-good',  badge:'badge-good',  label:'Good'  };
  if (s >= 40) return { stroke:'#ea580c', cls:'c-fair',  badge:'badge-fair',  label:'Fair'  };
  return             { stroke:'#dc2626', cls:'c-poor',  badge:'badge-poor',  label:'Poor'  };
}

// ── Scoring engine ────────────────────────────────────────
function analyseResume(rawText) {
  const text = rawText;
  const wc   = wordCount(text);
  const sections = [];

  // 1. Contact Info (10%)
  let contact = 0;
  if (hasEmail(text))    contact += 25;
  if (hasPhone(text))    contact += 25;
  if (hasLinkedIn(text)) contact += 25;
  if (/[A-Z][a-z]+ [A-Z][a-z]+/.test(text)) contact += 15;
  if (/[A-Z][a-z]+,?\s[A-Z]{2}|[A-Z][a-z]+,?\s[A-Z][a-z]+/.test(text)) contact += 10;
  contact = Math.min(contact, 100);
  const contactTips = [];
  if (!hasEmail(text))    contactTips.push({ icon:'⚠️', text:'Add a professional email address.' });
  if (!hasPhone(text))    contactTips.push({ icon:'⚠️', text:'Include a phone number.' });
  if (!hasLinkedIn(text)) contactTips.push({ icon:'💡', text:'Add your LinkedIn profile URL.' });
  if (!hasGitHub(text))   contactTips.push({ icon:'💡', text:'Consider adding a GitHub or portfolio link.' });
  if (!contactTips.length) contactTips.push({ icon:'✅', text:'Contact section looks complete!' });
  sections.push({ key:'contact', name:'Contact Info', emoji:'👤', weight:10, score:contact, tips:contactTips });

  // 2. Summary (10%)
  const hasSummary = /summary|objective|profile|about me|professional background/i.test(text);
  let summary = 0;
  if (hasSummary) summary += 50;
  if (wc > 200)   summary += 30;
  if (wc > 400)   summary += 20;
  summary = Math.min(summary, 100);
  const summaryTips = [];
  if (!hasSummary) summaryTips.push({ icon:'⚠️', text:'Add a professional summary or objective section.' });
  else summaryTips.push({ icon:'✅', text:'Summary/objective section detected.' });
  if (wc < 200) summaryTips.push({ icon:'💡', text:'Expand your resume — aim for 400+ words.' });
  sections.push({ key:'summary', name:'Summary', emoji:'📝', weight:10, score:summary, tips:summaryTips });

  // 3. Work Experience (25%)
  const expMatch   = /experience|employment|work history|career|positions? held/i.test(text);
  const actionCount= countMatches(text, ACTION_VERBS);
  const hasDates   = (text.match(/20\d{2}|19\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/gi)||[]).length;
  let experience = 0;
  if (expMatch)          experience += 30;
  if (actionCount >= 5)  experience += 30;
  else if (actionCount >= 2) experience += 15;
  if (hasDates >= 4)     experience += 25;
  else if (hasDates >= 2) experience += 12;
  if (/•|·|‣|–|-\s/.test(text)) experience += 15;
  experience = Math.min(experience, 100);
  const expTips = [];
  if (!expMatch)        expTips.push({ icon:'⚠️', text:'Add a clear "Work Experience" section header.' });
  if (actionCount < 5)  expTips.push({ icon:'💡', text:`Use more action verbs (found ${actionCount}). Aim for 8+.` });
  if (hasDates < 2)     expTips.push({ icon:'⚠️', text:'Include start and end dates for each role.' });
  if (!expTips.length)  expTips.push({ icon:'✅', text:'Work experience section looks strong!' });
  sections.push({ key:'experience', name:'Work Experience', emoji:'💼', weight:25, score:experience, tips:expTips });

  // 4. Education (15%)
  const hasEdu    = /education|academic|university|college|school|institute/i.test(text);
  const hasDegree = countMatches(text, DEGREE_WORDS) > 0;
  const hasGPA    = /gpa|cgpa|grade|percentage/i.test(text);
  let education = 0;
  if (hasEdu)    education += 40;
  if (hasDegree) education += 35;
  if (hasDates >= 2) education += 15;
  if (hasGPA)    education += 10;
  education = Math.min(education, 100);
  const eduTips = [];
  if (!hasEdu)    eduTips.push({ icon:'⚠️', text:'Add an Education section.' });
  if (!hasDegree) eduTips.push({ icon:'⚠️', text:'Mention your degree title clearly.' });
  if (!hasGPA)    eduTips.push({ icon:'💡', text:'Consider adding GPA/CGPA if strong (3.5+ / 8+).' });
  if (!eduTips.length) eduTips.push({ icon:'✅', text:'Education section is well-structured!' });
  sections.push({ key:'education', name:'Education', emoji:'🎓', weight:15, score:education, tips:eduTips });

  // 5. Skills (20%)
  const hasSkillsSection = /skills|technologies|tech stack|tools|competencies/i.test(text);
  const techCount  = countMatches(text, TECH_SKILLS);
  const softCount  = countMatches(text, SOFT_SKILLS);
  let skills = 0;
  if (hasSkillsSection) skills += 25;
  if (techCount >= 8)   skills += 45;
  else if (techCount >= 4) skills += 30;
  else if (techCount >= 1) skills += 15;
  if (softCount >= 3)   skills += 20;
  else if (softCount >= 1) skills += 10;
  if (techCount >= 3 && softCount >= 1) skills += 10;
  skills = Math.min(skills, 100);
  const skillTips = [];
  if (!hasSkillsSection) skillTips.push({ icon:'⚠️', text:'Add a dedicated Skills section.' });
  if (techCount < 4) skillTips.push({ icon:'💡', text:`List more technical skills (found ~${techCount}). Aim for 8+.` });
  if (softCount < 2) skillTips.push({ icon:'💡', text:'Include soft skills like communication, leadership.' });
  if (!skillTips.length) skillTips.push({ icon:'✅', text:`Strong skills section! (${techCount} tech skills found)` });
  sections.push({ key:'skills', name:'Skills', emoji:'⚙️', weight:20, score:skills, tips:skillTips });

  // 6. Keywords & ATS Fit (15%)
  const headerCount    = countMatches(text, SECTION_HEADERS);
  const hasQuantified  = /\d+%|\$[\d,]+|\d+\+|\d+x|\d+ (users|clients|projects|teams?)/i.test(text);
  const hasSpecialChars= /[│┃|]{3,}/.test(text);
  let keywords = 0;
  keywords += Math.min(headerCount * 10, 40);
  if (hasQuantified)    keywords += 35;
  if (!hasSpecialChars) keywords += 25;
  keywords = Math.min(keywords, 100);
  const kwTips = [];
  if (headerCount < 3) kwTips.push({ icon:'⚠️', text:'Use standard section headers (Experience, Education, Skills).' });
  if (!hasQuantified)  kwTips.push({ icon:'💡', text:'Quantify achievements: "Increased sales by 30%", "Led 5-person team".' });
  if (hasSpecialChars) kwTips.push({ icon:'⚠️', text:'Avoid tables/columns — ATS may misread them.' });
  if (!kwTips.length)  kwTips.push({ icon:'✅', text:'Good ATS keyword coverage!' });
  sections.push({ key:'keywords', name:'Keywords & ATS Fit', emoji:'🔍', weight:15, score:keywords, tips:kwTips });

  // 7. Formatting (5%)
  const hasBullets = /•|·|‣/.test(text);
  let formatting = 0;
  if (wc >= 300 && wc <= 900) formatting += 40;
  else if (wc >= 200)          formatting += 20;
  if (hasBullets)              formatting += 30;
  if (headerCount >= 4)        formatting += 30;
  formatting = Math.min(formatting, 100);
  const fmtTips = [];
  if (wc < 300)  fmtTips.push({ icon:'⚠️', text:`Resume is too short (${wc} words). Aim for 300–800 words.` });
  if (wc > 1000) fmtTips.push({ icon:'💡', text:`Resume may be too long (${wc} words). Consider trimming.` });
  if (!hasBullets) fmtTips.push({ icon:'💡', text:'Use bullet points for readability and ATS parsing.' });
  if (!fmtTips.length) fmtTips.push({ icon:'✅', text:'Good length and formatting structure.' });
  sections.push({ key:'formatting', name:'Formatting & Length', emoji:'📐', weight:5, score:formatting, tips:fmtTips });

  const overall = Math.round(sections.reduce((s, x) => s + x.score * (x.weight / 100), 0));
  return { overall, sections, wordCount: wc, techCount, actionCount };
}

// ── PDF extraction ────────────────────────────────────────
async function extractText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let out = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    out += content.items.map(it => it.str).join(' ') + '\n';
    setProgress(20 + Math.round((i / pdf.numPages) * 50), `Reading page ${i} of ${pdf.numPages}…`);
  }
  return out;
}

// ── Progress ──────────────────────────────────────────────
function setProgress(pct, label) {
  progressBar.style.width = pct + '%';
  progressPct.textContent = pct + '%';
  if (label) progressLabel.textContent = label;
}
function showProgress() { progressWrap.classList.add('visible'); setProgress(0, 'Starting…'); }
function hideProgress() { progressWrap.classList.remove('visible'); }

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, ms = 4000) {
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), ms);
}

// ── Render ────────────────────────────────────────────────
function renderResults(data) {
  const { overall, sections } = data;
  const { stroke, cls, badge, label } = scoreColor(overall);

  results.classList.add('visible');
  results.scrollIntoView({ behavior:'smooth', block:'start' });

  // Date
  resultDate.textContent = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

  // Animate ring
  const offset = 408 - (overall / 100) * 408;
  scoreArc.style.stroke = stroke;
  requestAnimationFrame(() => { scoreArc.style.strokeDashoffset = offset; });

  // Animate number
  let cur = 0;
  const tick = () => {
    cur = Math.min(cur + 2, overall);
    scoreNumber.textContent = cur;
    scoreNumber.className = `ring-score ${cls}`;
    if (cur < overall) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Badge
  scoreGrade.textContent = label;
  scoreGrade.className   = `score-badge ${badge}`;

  // Headline
  const headlines = {
    'badge-great': 'Your resume is ATS-ready!',
    'badge-good':  'Good resume — a few improvements can help.',
    'badge-fair':  'Several issues may cause ATS rejection.',
    'badge-poor':  'This resume needs significant work.'
  };
  resultHeadline.textContent = headlines[badge];
  resultSummary.textContent  = `Scored ${overall}/100 across 7 sections. Found ${data.techCount} technical skills and ${data.actionCount} action verbs in ${data.wordCount} words.`;

  // Meta pills
  metaPills.innerHTML = [
    `${data.wordCount} words`,
    `${data.techCount} tech skills`,
    `${data.actionCount} action verbs`,
    `${sections.filter(s => s.score >= 80).length} strong sections`,
  ].map(t => `<span class="meta-pill">${t}</span>`).join('');

  // Radar chart
  if (radarChart) radarChart.destroy();
  const ctx = document.getElementById('radarChart').getContext('2d');
  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: sections.map(s => s.name.split(' ').slice(0,2).join(' ')),
      datasets: [{
        label: 'Score',
        data: sections.map(s => s.score),
        backgroundColor: 'rgba(255,56,92,0.08)',
        borderColor: '#ff385c',
        borderWidth: 2,
        pointBackgroundColor: sections.map(s => scoreColor(s.score).stroke),
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { stepSize:20, color:'#c1c1c1', backdropColor:'transparent', font:{ size:10, family:'Plus Jakarta Sans' } },
          grid:       { color:'#ebebeb' },
          angleLines: { color:'#ebebeb' },
          pointLabels:{ color:'#6a6a6a', font:{ size:11, family:'Plus Jakarta Sans' } },
        }
      },
      plugins: { legend:{ display:false } },
    }
  });

  // Bar scores
  const barHTML = sections.map(s => {
    const { stroke: bs, cls: bc } = scoreColor(s.score);
    return `<div class="bar-item">
      <div class="bar-row">
        <span class="bar-name"><span>${s.emoji}</span> ${s.name}</span>
        <span class="bar-val ${bc}">${s.score}/100</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" data-w="${s.score}" style="background:${bs}"></div>
      </div>
    </div>`;
  }).join('');
  barScores.innerHTML = `<div class="card-label">Score by section</div>` + barHTML;
  setTimeout(() => {
    barScores.querySelectorAll('.bar-fill').forEach(el => { el.style.width = el.dataset.w + '%'; });
  }, 100);

  // Section cards
  sectionCards.innerHTML = '';
  sections.forEach((s, i) => {
    const { stroke: ss, cls: sc } = scoreColor(s.score);
    const card = document.createElement('div');
    card.className = 'section-card';
    card.innerHTML = `
      <div class="sc-header">
        <div class="sc-left">
          <div class="sc-icon">${s.emoji}</div>
          <div>
            <div class="sc-name">${s.name}</div>
            <div class="sc-weight">Weight: ${s.weight}%</div>
          </div>
        </div>
        <div class="sc-score ${sc}">${s.score}</div>
      </div>
      <div class="sc-bar">
        <div class="sc-fill" data-w="${s.score}" style="background:${ss}"></div>
      </div>
      <ul class="tips-list">
        ${s.tips.map(t => `<li><span class="tip-ico">${t.icon}</span><span>${t.text}</span></li>`).join('')}
      </ul>`;
    sectionCards.appendChild(card);
    setTimeout(() => {
      card.classList.add('animate-in');
      card.querySelector('.sc-fill').style.width = s.score + '%';
    }, i * 80 + 100);
  });
}

// ── File handling ─────────────────────────────────────────
function setFile(file) {
  if (!file || file.type !== 'application/pdf') { showToast('Please upload a valid PDF file.'); return; }
  if (file.size > 20 * 1024 * 1024) { showToast('File too large. Max size is 20 MB.'); return; }
  currentFile = file;
  const name = file.name;
  const kb   = (file.size / 1024).toFixed(1) + ' KB';
  // Update pill
  pillFileName.textContent = name;
  pillFileName.classList.add('active');
  // Show chip
  fileName.textContent = name;
  fileSize.textContent = kb;
  fileChip.classList.add('visible');
  btnAnalyse.disabled = false;
  results.classList.remove('visible');
}

function clearFile() {
  currentFile = null;
  fileInput.value = '';
  pillFileName.textContent = 'Upload your PDF';
  pillFileName.classList.remove('active');
  fileChip.classList.remove('visible');
  btnAnalyse.disabled = true;
  results.classList.remove('visible');
}

// Pill click → open file dialog
uploadPill.addEventListener('click', () => fileInput.click());
uploadPill.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
pillBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });

fileInput.addEventListener('change', () => { if (fileInput.files[0]) setFile(fileInput.files[0]); });

// Drag & drop on pill
uploadPill.addEventListener('dragover', e => { e.preventDefault(); uploadPill.classList.add('drag-over'); });
uploadPill.addEventListener('dragleave', () => uploadPill.classList.remove('drag-over'));
uploadPill.addEventListener('drop', e => {
  e.preventDefault(); uploadPill.classList.remove('drag-over');
  setFile(e.dataTransfer.files[0]);
});

btnRemove.addEventListener('click', clearFile);

// ── Analyse ───────────────────────────────────────────────
btnAnalyse.addEventListener('click', async () => {
  if (!currentFile) return;
  btnAnalyse.disabled = true;
  btnAnalyse.classList.add('loading');
  showProgress();

  try {
    setProgress(10, 'Loading PDF…');
    await new Promise(r => setTimeout(r, 150));

    const rawText = await extractText(currentFile);

    if (!rawText || rawText.trim().length < 50) {
      showToast('Could not extract text. This may be a scanned/image PDF.');
      hideProgress(); btnAnalyse.classList.remove('loading'); btnAnalyse.disabled = false;
      return;
    }

    setProgress(75, 'Scoring sections…');
    await new Promise(r => setTimeout(r, 250));

    const data = analyseResume(rawText);
    previewText.textContent = rawText.trim();

    setProgress(100, 'Done!');
    await new Promise(r => setTimeout(r, 250));

    hideProgress();
    renderResults(data);

  } catch (err) {
    console.error(err);
    showToast('Failed to analyse PDF. Please try another file.');
    hideProgress();
  } finally {
    btnAnalyse.classList.remove('loading');
    btnAnalyse.disabled = false;
  }
});

// ── Preview toggle ────────────────────────────────────────
previewToggle.addEventListener('click', () => {
  const open = previewBody.classList.toggle('open');
  previewToggle.classList.toggle('open', open);
  previewToggle.setAttribute('aria-expanded', open);
});
