/**
 * Patente Italiana Flashcards
 * A flashcard app for Persian speakers studying for the Italian driving license exam.
 *
 * Features:
 * - Manual & CSV vocabulary import
 * - AI-powered vocabulary extraction (via Anthropic API)
 * - Spaced repetition (simplified SRS)
 * - True/false quiz with manual, file, and AI input
 * - Category filtering, search, known/unknown marking
 * - Visual flag for words used in quizzes
 * - Light/dark theme
 * - Data export/import (JSON)
 *
 * All data stored in localStorage. No server, no tracking.
 */

// ---------- State ----------
const STORAGE_KEY = 'patente_fc_data_v1';
const SETTINGS_KEY = 'patente_fc_settings_v1';
const THEME_KEY = 'patente_fc_theme';

let state = {
  words: [],          // {id, it, fa, category, note, known, nextReview, level}
  quizQuestions: [],  // {id, statement, isTrue, sourceWordIds: []}
  studyIndex: 0,
  studyQueue: [],
  quizIndex: 0,
  quizActive: false,
  apiKey: ''
};

let settings = {
  intervalEasy: 4,
  intervalGood: 2,
  intervalHard: 1
};

// ---------- Default seed data ----------
const SEED_WORDS = [
  { it: 'precedenza', fa: 'حق تقدم', category: 'قوانین', note: '' },
  { it: 'incrocio', fa: 'تقاطع', category: 'علائم', note: '' },
  { it: 'sorpasso', fa: 'سبقت', category: 'قوانین', note: '' },
  { it: 'segnale', fa: 'علامت', category: 'علائم', note: '' },
  { it: 'rotatoria', fa: 'میدان (دوربرگردان)', category: 'علائم', note: '' },
  { it: 'semaforo', fa: 'چراغ راهنما', category: 'علائم', note: '' },
  { it: 'pedone', fa: 'عابر پیاده', category: 'عمومی', note: '' },
  { it: 'velocità', fa: 'سرعت', category: 'قوانین', note: '' },
  { it: 'patente', fa: 'گواهینامه', category: 'عمومی', note: '' },
  { it: 'guida', fa: 'رانندگی', category: 'عمومی', note: '' },
  { it: 'autostrada', fa: 'بزرگراه', category: 'جاده‌ها', note: '' },
  { it: 'carreggiata', fa: 'مسیر عبور', category: 'جاده‌ها', note: '' },
  { it: 'corsia', fa: 'لاین', category: 'جاده‌ها', note: '' },
  { it: 'marciapiede', fa: 'پیاده‌رو', category: 'جاده‌ها', note: '' },
  { it: 'curva', fa: 'پیچ', category: 'جاده‌ها', note: '' },
  { it: 'pendenza', fa: 'شیب', category: 'جاده‌ها', note: '' },
  { it: 'galleria', fa: 'تونل', category: 'جاده‌ها', note: '' },
  { it: 'frenata', fa: 'ترمز', category: 'وسیله نقلیه', note: '' },
  { it: 'pneumatico', fa: 'لاستیک', category: 'وسیله نقلیه', note: '' },
  { it: 'cintura di sicurezza', fa: 'کمربند ایمنی', category: 'ایمنی', note: '' },
  { it: 'casco', fa: 'کلاه ایمنی', category: 'ایمنی', note: '' },
  { it: 'airbag', fa: 'کیسه هوا', category: 'ایمنی', note: '' },
  { it: 'multa', fa: 'جریمه', category: 'قوانین', note: '' },
  { it: 'divieto', fa: 'منع، ممنوعیت', category: 'علائم', note: '' },
  { it: 'obbligo', fa: 'الزام', category: 'علائم', note: '' },
  { it: 'pericolo', fa: 'خطر', category: 'علائم', note: '' },
  { it: 'stop', fa: 'توقف', category: 'علائم', note: '' },
  { it: 'parcheggio', fa: 'پارکینگ', category: 'عمومی', note: '' },
  { it: 'distanza di sicurezza', fa: 'فاصله ایمن', category: 'قوانین', note: '' },
  { it: 'limite di velocità', fa: 'محدودیت سرعت', category: 'قوانین', note: '' },
  { it: 'patente di guida', fa: 'گواهینامه رانندگی', category: 'عمومی', note: '' }
];

// ---------- Init ----------
function init() {
  loadState();
  loadSettings();
  loadTheme();
  bindEvents();
  renderAll();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = { ...state, ...JSON.parse(raw) };
    } else {
      // First run: seed with default words
      state.words = SEED_WORDS.map(w => ({
        id: uid(),
        ...w,
        known: false,
        nextReview: Date.now(),
        level: 0
      }));
      saveState();
    }
  } catch (e) {
    console.error('Load failed:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    alert('خطا در ذخیره داده‌ها. ممکنه حافظه مرورگر پر باشه.');
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) settings = { ...settings, ...JSON.parse(raw) };
  } catch (e) { console.error(e); }
}

function saveSettings() {
  settings.intervalEasy = parseInt(document.getElementById('intervalEasy').value) || 4;
  settings.intervalGood = parseInt(document.getElementById('intervalGood').value) || 2;
  settings.intervalHard = parseInt(document.getElementById('intervalHard').value) || 1;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  toast('تنظیمات ذخیره شد');
}

function loadTheme() {
  const t = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeToggle').textContent = t === 'dark' ? '☀' : '🌙';
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  document.getElementById('themeToggle').textContent = next === 'dark' ? '☀' : '🌙';
}

// ---------- Utilities ----------
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: var(--ink); color: var(--bg); padding: 10px 20px; border-radius: 8px;
    z-index: 1000; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ---------- Event Binding ----------
function bindEvents() {
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => switchTab(t.dataset.tab));
  });
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importDataBtn').addEventListener('click', triggerImport);

  // Load saved API key
  const savedKey = localStorage.getItem('patente_fc_apikey');
  if (savedKey) {
    state.apiKey = savedKey;
    const inp = document.getElementById('apiKey');
    if (inp) inp.value = savedKey;
  }
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === 'tab-' + name);
  });
  if (name === 'study') startStudy();
  if (name === 'vocab') renderVocabList();
  if (name === 'quiz') renderQuizSetup();
}

// ---------- Stats ----------
function renderStats() {
  document.getElementById('statTotal').textContent = state.words.length;
  document.getElementById('statKnown').textContent = state.words.filter(w => w.known).length;
  const now = Date.now();
  document.getElementById('statDue').textContent = state.words.filter(w => !w.known && (w.nextReview || 0) <= now).length;
  document.getElementById('statQuiz').textContent = wordsInQuiz().size;
}

function wordsInQuiz() {
  const set = new Set();
  state.quizQuestions.forEach(q => (q.sourceWordIds || []).forEach(id => set.add(id)));
  return set;
}

// ---------- Study Mode (Simplified SRS) ----------
function startStudy() {
  const now = Date.now();
  state.studyQueue = state.words
    .filter(w => !w.known && (w.nextReview || 0) <= now)
    .sort((a, b) => (a.nextReview || 0) - (b.nextReview || 0));

  if (state.studyQueue.length === 0) {
    // fallback: show all unknown
    state.studyQueue = state.words.filter(w => !w.known);
  }
  state.studyIndex = 0;
  showCurrentCard();
}

function showCurrentCard() {
  const card = document.getElementById('flashcard');
  card.classList.remove('flipped');
  const w = state.studyQueue[state.studyIndex];

  if (!w) {
    document.getElementById('cardWord').textContent = '🎉';
    document.getElementById('cardCategory').textContent = '—';
    document.getElementById('cardCategoryBack').textContent = '—';
    document.getElementById('cardTranslation').textContent = 'تموم شد';
    document.getElementById('studyProgress').style.width = '100%';
    return;
  }

  document.getElementById('cardWord').textContent = w.it;
  document.getElementById('cardTranslation').textContent = w.fa + (w.note ? ` — ${w.note}` : '');
  document.getElementById('cardCategory').textContent = w.category || '—';
  document.getElementById('cardCategoryBack').textContent = w.category || '—';

  const pct = state.studyQueue.length ? ((state.studyIndex) / state.studyQueue.length) * 100 : 0;
  document.getElementById('studyProgress').style.width = pct + '%';
}

function flipCard() {
  document.getElementById('flashcard').classList.toggle('flipped');
}

function rateCard(rating) {
  const w = state.studyQueue[state.studyIndex];
  if (!w) return;

  const target = state.words.find(x => x.id === w.id);
  if (!target) return;

  let days;
  if (rating === 'easy') {
    target.level = (target.level || 0) + 1;
    days = settings.intervalEasy * Math.max(1, target.level);
  } else if (rating === 'good') {
    target.level = (target.level || 0) + 1;
    days = settings.intervalGood * Math.max(1, target.level);
  } else {
    target.level = 0;
    days = settings.intervalHard;
  }

  target.nextReview = Date.now() + days * 24 * 60 * 60 * 1000;

  if (rating === 'easy' && target.level >= 3) {
    target.known = true;
  }

  saveState();
  state.studyIndex++;
  showCurrentCard();
  renderStats();
}

function skipCard() {
  state.studyIndex++;
  showCurrentCard();
}

function resetStudy() {
  startStudy();
}

// ---------- Vocab List ----------
function renderVocabList() {
  const list = document.getElementById('vocabList');
  const search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const cat = document.getElementById('categoryFilter').value;
  const status = document.getElementById('statusFilter').value;

  // Populate category filter
  const cats = [...new Set(state.words.map(w => w.category).filter(Boolean))].sort();
  const cf = document.getElementById('categoryFilter');
  const cur = cf.value;
  cf.innerHTML = '<option value="">همه دسته‌ها</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  cf.value = cur;

  const quizSet = wordsInQuiz();

  const filtered = state.words.filter(w => {
    if (search && !w.it.toLowerCase().includes(search) && !w.fa.toLowerCase().includes(search)) return false;
    if (cat && w.category !== cat) return false;
    if (status === 'known' && !w.known) return false;
    if (status === 'learning' && w.known) return false;
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty" style="grid-column: 1/-1;"><div class="empty-icon">📭</div>چیزی پیدا نشد</div>';
    return;
  }

  list.innerHTML = filtered.map(w => `
    <div class="word-item ${w.known ? 'known' : ''} ${quizSet.has(w.id) ? 'in-quiz' : ''}">
      <div class="word-it">${escapeHtml(w.it)}</div>
      <div class="word-fa">${escapeHtml(w.fa)}</div>
      ${w.category ? `<div class="word-meta">${escapeHtml(w.category)}</div>` : ''}
      ${w.note ? `<div class="word-meta" style="text-transform: none; font-style: italic;">${escapeHtml(w.note)}</div>` : ''}
      <div class="word-actions">
        <button class="btn btn-secondary" onclick="toggleKnown('${w.id}')">${w.known ? '↩ نشده' : '✓ آموختم'}</button>
        <button class="btn btn-secondary" onclick="editWord('${w.id}')">✎</button>
        <button class="btn btn-danger" onclick="deleteWord('${w.id}')">🗑</button>
      </div>
    </div>
  `).join('');
}

function toggleKnown(id) {
  const w = state.words.find(x => x.id === id);
  if (!w) return;
  w.known = !w.known;
  saveState();
  renderVocabList();
  renderStats();
}

function deleteWord(id) {
  if (!confirm('حذف این کلمه؟')) return;
  state.words = state.words.filter(w => w.id !== id);
  saveState();
  renderVocabList();
  renderStats();
}

function editWord(id) {
  const w = state.words.find(x => x.id === id);
  if (!w) return;
  const newIt = prompt('کلمه ایتالیایی:', w.it);
  if (newIt === null) return;
  const newFa = prompt('ترجمه فارسی:', w.fa);
  if (newFa === null) return;
  const newCat = prompt('دسته‌بندی:', w.category || '');
  if (newCat === null) return;
  w.it = newIt.trim();
  w.fa = newFa.trim();
  w.category = newCat.trim();
  saveState();
  renderVocabList();
}

// ---------- Add Words ----------
function addWord() {
  const it = document.getElementById('newWordIt').value.trim();
  const fa = document.getElementById('newWordFa').value.trim();
  const category = document.getElementById('newWordCat').value.trim();
  const note = document.getElementById('newWordNote').value.trim();

  if (!it || !fa) {
    alert('کلمه ایتالیایی و ترجمه الزامی هستن.');
    return;
  }

  state.words.push({
    id: uid(),
    it, fa, category, note,
    known: false,
    nextReview: Date.now(),
    level: 0
  });

  saveState();
  document.getElementById('newWordIt').value = '';
  document.getElementById('newWordFa').value = '';
  document.getElementById('newWordCat').value = '';
  document.getElementById('newWordNote').value = '';
  toast('کلمه اضافه شد ✓');
  renderStats();
}

function importCSV() {
  const text = document.getElementById('csvInput').value;
  const count = parseCSVText(text);
  if (count > 0) {
    document.getElementById('csvInput').value = '';
    toast(`${count} کلمه اضافه شد ✓`);
    renderStats();
  } else {
    alert('چیزی پیدا نشد. فرمت باید "italiano,farsi,categoria,note" باشه.');
  }
}

function importCSVFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const count = parseCSVText(e.target.result);
    toast(`${count} کلمه از فایل اضافه شد ✓`);
    renderStats();
  };
  reader.readAsText(file);
  ev.target.value = '';
}

function parseCSVText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  let count = 0;
  for (const line of lines) {
    const parts = line.split(/[,\t]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < 2 || !parts[0] || !parts[1]) continue;
    state.words.push({
      id: uid(),
      it: parts[0],
      fa: parts[1],
      category: parts[2] || '',
      note: parts[3] || '',
      known: false,
      nextReview: Date.now(),
      level: 0
    });
    count++;
  }
  if (count > 0) saveState();
  return count;
}

// ---------- AI Extraction ----------
async function extractWithAI() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const text = document.getElementById('aiInput').value.trim();
  const btn = document.getElementById('aiBtn');
  const btnText = document.getElementById('aiBtnText');
  const result = document.getElementById('aiResult');

  if (!apiKey) { alert('کلید API رو وارد کن.'); return; }
  if (!text) { alert('متن ایتالیایی رو وارد کن.'); return; }

  localStorage.setItem('patente_fc_apikey', apiKey);
  state.apiKey = apiKey;

  btn.disabled = true;
  btnText.innerHTML = '<span class="spinner"></span> در حال استخراج...';
  result.innerHTML = '';

  const prompt = `Extract the most important Italian vocabulary words from the following text that would be useful for someone studying for the Italian driving license exam (Patente italiana). For each word, provide:
- The Italian word (lowercase, base form)
- Persian (Farsi) translation
- A category (one of: علائم, قوانین, جاده‌ها, وسیله نقلیه, ایمنی, عمومی)

Return ONLY a valid JSON array, no other text. Format:
[{"it": "word", "fa": "ترجمه", "category": "دسته"}]

Text:
${text}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const content = data.content.map(c => c.text || '').join('');
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('JSON یافت نشد در پاسخ.');

    const extracted = JSON.parse(jsonMatch[0]);
    showExtractedWords(extracted);

  } catch (err) {
    result.innerHTML = `<div style="color: var(--accent); padding: 12px; background: var(--accent-soft); border-radius: 8px;">خطا: ${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    btnText.textContent = 'استخراج کن';
  }
}

function showExtractedWords(words) {
  const result = document.getElementById('aiResult');
  if (!Array.isArray(words) || words.length === 0) {
    result.innerHTML = '<div class="empty">چیزی استخراج نشد</div>';
    return;
  }

  result.innerHTML = `
    <div style="margin-bottom: 12px;">
      <strong>${words.length} کلمه پیدا شد</strong>
      <button class="btn btn-primary" style="float: left;" onclick='addExtracted(${JSON.stringify(words).replace(/'/g, "&#39;")})'>افزودن همه</button>
    </div>
    <div class="word-list">
      ${words.map(w => `
        <div class="word-item">
          <div class="word-it">${escapeHtml(w.it || '')}</div>
          <div class="word-fa">${escapeHtml(w.fa || '')}</div>
          ${w.category ? `<div class="word-meta">${escapeHtml(w.category)}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function addExtracted(words) {
  let added = 0;
  for (const w of words) {
    if (!w.it || !w.fa) continue;
    state.words.push({
      id: uid(),
      it: w.it,
      fa: w.fa,
      category: w.category || '',
      note: '',
      known: false,
      nextReview: Date.now(),
      level: 0
    });
    added++;
  }
  saveState();
  toast(`${added} کلمه اضافه شد ✓`);
  document.getElementById('aiResult').innerHTML = '';
  document.getElementById('aiInput').value = '';
  renderStats();
}

// ---------- Quiz ----------
function renderQuizSetup() {
  document.getElementById('quizSetupPanel').style.display = 'block';
  document.getElementById('quizPlayPanel').style.display = 'none';
  document.getElementById('quizCount').textContent = state.quizQuestions.length;

  const list = document.getElementById('quizQuestionsList');
  if (state.quizQuestions.length === 0) {
    list.innerHTML = '<div class="empty"><div class="empty-icon">❓</div>هنوز سوالی نداری</div>';
    return;
  }

  list.innerHTML = state.quizQuestions.map((q, i) => `
    <div style="background: var(--bg); padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
      <div style="flex: 1;">
        <div>${escapeHtml(q.statement)}</div>
        <div style="font-size: 12px; color: var(--ink-soft); margin-top: 4px;">پاسخ صحیح: ${q.isTrue ? 'درست' : 'غلط'}</div>
      </div>
      <button class="btn btn-danger" onclick="deleteQuizQuestion(${i})">🗑</button>
    </div>
  `).join('');
}

function deleteQuizQuestion(i) {
  state.quizQuestions.splice(i, 1);
  saveState();
  renderQuizSetup();
  renderStats();
}

function showQuizModal(mode) {
  const modal = document.getElementById('quizModal');
  const body = document.getElementById('quizModalBody');
  const title = document.getElementById('quizModalTitle');
  const saveBtn = document.getElementById('quizModalSave');

  if (mode === 'manual') {
    title.textContent = 'افزودن سوال دستی';
    body.innerHTML = `
      <label>جمله</label>
      <textarea id="qStatement" placeholder="مثلاً: در میدان، خودروهای داخل میدان حق تقدم دارند"></textarea>
      <div style="margin-top: 12px;">
        <label>پاسخ صحیح</label>
        <select id="qIsTrue"><option value="true">درست</option><option value="false">غلط</option></select>
      </div>
      <div style="margin-top: 12px;">
        <label>کلمات مرتبط (اختیاری، با کاما جدا کن)</label>
        <input type="text" id="qWords" placeholder="precedenza, rotatoria">
        <div class="help-text">این کلمات تو لیست واژگان با علامت ✦ مشخص میشن</div>
      </div>
    `;
    saveBtn.onclick = () => {
      const statement = document.getElementById('qStatement').value.trim();
      const isTrue = document.getElementById('qIsTrue').value === 'true';
      const wordTerms = document.getElementById('qWords').value.split(',').map(s => s.trim()).filter(Boolean);
      if (!statement) { alert('جمله رو وارد کن'); return; }

      const sourceWordIds = wordTerms.map(t => {
        const match = state.words.find(w => w.it.toLowerCase() === t.toLowerCase());
        return match ? match.id : null;
      }).filter(Boolean);

      state.quizQuestions.push({ id: uid(), statement, isTrue, sourceWordIds });
      saveState();
      closeQuizModal();
      renderQuizSetup();
      renderStats();
      renderVocabList();
    };
  } else if (mode === 'file') {
    title.textContent = 'آپلود فایل سوال';
    body.innerHTML = `
      <p style="color: var(--ink-soft); font-size: 13px; margin-bottom: 12px;">
        فرمت هر خط: <code>جمله | true یا false | کلمه۱,کلمه۲</code>
      </p>
      <textarea id="qFileText" placeholder="در میدان، خودروهای داخل میدان حق تقدم دارند | true | precedenza,rotatoria
سرعت مجاز در شهر ۹۰ کیلومتر در ساعت است | false | velocità"></textarea>
      <div style="margin-top: 12px;">
        <button class="btn btn-secondary" onclick="document.getElementById('qFileInput').click()">یا از فایل بخوون</button>
        <input type="file" id="qFileInput" accept=".txt,.csv" style="display:none" onchange="loadQuizFile(event)">
      </div>
    `;
    saveBtn.onclick = () => {
      const text = document.getElementById('qFileText').value;
      const count = parseQuizText(text);
      toast(`${count} سوال اضافه شد ✓`);
      closeQuizModal();
      renderQuizSetup();
      renderStats();
      renderVocabList();
    };
  } else if (mode === 'ai') {
    title.textContent = 'تولید سوال با AI';
    const savedKey = state.apiKey || localStorage.getItem('patente_fc_apikey') || '';
    body.innerHTML = `
      <label>کلید API انتروپیک</label>
      <input type="text" id="qApiKey" value="${escapeHtml(savedKey)}" placeholder="sk-ant-...">
      <div style="margin-top: 12px;">
        <label>موضوع یا متن</label>
        <textarea id="qAiText" placeholder="مثلاً: قوانین حق تقدم در میدان، یا یه متن ایتالیایی..."></textarea>
      </div>
      <div style="margin-top: 12px;">
        <label>تعداد سوال</label>
        <input type="text" id="qCount" value="5">
      </div>
      <div id="qAiResult" style="margin-top: 12px;"></div>
    `;
    saveBtn.innerHTML = '<span id="qAiBtnText">تولید کن</span>';
    saveBtn.onclick = () => generateQuizAI();
  }

  modal.classList.add('show');
}

function closeQuizModal() {
  document.getElementById('quizModal').classList.remove('show');
  document.getElementById('quizModalSave').innerHTML = 'ذخیره';
}

function parseQuizText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let count = 0;
  for (const line of lines) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 2) continue;
    const statement = parts[0];
    const isTrue = /^(true|درست|t|1)$/i.test(parts[1]);
    const wordTerms = (parts[2] || '').split(',').map(s => s.trim()).filter(Boolean);
    const sourceWordIds = wordTerms.map(t => {
      const match = state.words.find(w => w.it.toLowerCase() === t.toLowerCase());
      return match ? match.id : null;
    }).filter(Boolean);
    state.quizQuestions.push({ id: uid(), statement, isTrue, sourceWordIds });
    count++;
  }
  if (count > 0) saveState();
  return count;
}

function loadQuizFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('qFileText').value = e.target.result;
  };
  reader.readAsText(file);
}

async function generateQuizAI() {
  const apiKey = document.getElementById('qApiKey').value.trim();
  const topic = document.getElementById('qAiText').value.trim();
  const count = parseInt(document.getElementById('qCount').value) || 5;
  const btn = document.getElementById('quizModalSave');
  const btnText = document.getElementById('qAiBtnText');
  const result = document.getElementById('qAiResult');

  if (!apiKey || !topic) { alert('کلید API و موضوع رو وارد کن.'); return; }

  localStorage.setItem('patente_fc_apikey', apiKey);
  state.apiKey = apiKey;

  btn.disabled = true;
  if (btnText) btnText.innerHTML = '<span class="spinner"></span> در حال تولید...';

  const prompt = `Generate ${count} true/false quiz questions in Persian (Farsi) for someone studying for the Italian driving license exam (Patente italiana). The topic is: ${topic}

Mix of true and false statements. Make the false ones plausible but clearly wrong.

For each question, also list the relevant Italian vocabulary words.

Return ONLY a valid JSON array, no other text:
[{"statement": "جمله به فارسی", "isTrue": true, "words": ["italian_word1"]}]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) throw new Error('API error ' + response.status);
    const data = await response.json();
    const content = data.content.map(c => c.text || '').join('');
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('JSON یافت نشد.');
    const questions = JSON.parse(jsonMatch[0]);

    let added = 0;
    for (const q of questions) {
      if (!q.statement) continue;
      const wordTerms = q.words || [];
      const sourceWordIds = wordTerms.map(t => {
        const match = state.words.find(w => w.it.toLowerCase() === t.toLowerCase());
        return match ? match.id : null;
      }).filter(Boolean);
      state.quizQuestions.push({
        id: uid(),
        statement: q.statement,
        isTrue: Boolean(q.isTrue),
        sourceWordIds
      });
      added++;
    }
    saveState();
    toast(`${added} سوال اضافه شد ✓`);
    closeQuizModal();
    renderQuizSetup();
    renderStats();
    renderVocabList();
  } catch (err) {
    result.innerHTML = `<div style="color: var(--accent);">خطا: ${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    if (btnText) btnText.textContent = 'تولید کن';
  }
}

function startQuiz() {
  if (state.quizQuestions.length === 0) {
    alert('اول سوال اضافه کن.');
    return;
  }
  state.quizActive = true;
  state.quizIndex = 0;
  document.getElementById('quizSetupPanel').style.display = 'none';
  document.getElementById('quizPlayPanel').style.display = 'block';
  showQuizQuestion();
}

function showQuizQuestion() {
  const q = state.quizQuestions[state.quizIndex];
  if (!q) {
    endQuiz();
    return;
  }
  document.getElementById('quizStatement').textContent = q.statement;
  document.getElementById('quizFeedback').classList.remove('show', 'correct', 'wrong');
  document.getElementById('quizFeedback').textContent = '';
  document.getElementById('quizProgress').style.width = (state.quizIndex / state.quizQuestions.length * 100) + '%';
}

function answerQuiz(userAnswer) {
  const q = state.quizQuestions[state.quizIndex];
  if (!q) return;
  const fb = document.getElementById('quizFeedback');
  if (userAnswer === q.isTrue) {
    fb.textContent = '✓ درسته!';
    fb.classList.add('show', 'correct');
  } else {
    fb.textContent = '✗ اشتباه. پاسخ صحیح: ' + (q.isTrue ? 'درست' : 'غلط');
    fb.classList.add('show', 'wrong');
  }
  setTimeout(() => {
    state.quizIndex++;
    showQuizQuestion();
  }, 1400);
}

function endQuiz() {
  state.quizActive = false;
  document.getElementById('quizSetupPanel').style.display = 'block';
  document.getElementById('quizPlayPanel').style.display = 'none';
  renderQuizSetup();
}

// ---------- Export / Import ----------
function exportData() {
  const blob = new Blob([JSON.stringify({ state, settings }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `patente-fc-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('فایل پشتیبان دانلود شد ✓');
}

function triggerImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.state) state = { ...state, ...data.state };
        if (data.settings) settings = { ...settings, ...data.settings };
        saveState();
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        toast('داده‌ها وارد شدن ✓');
        renderAll();
      } catch (err) {
        alert('فایل معتبر نیست.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearAll() {
  if (!confirm('همه کلمات و سوالات و تنظیمات پاک میشن. مطمئنی؟')) return;
  if (!confirm('واقعاً مطمئنی؟ این کار قابل بازگشت نیست.')) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  state = { words: [], quizQuestions: [], studyIndex: 0, studyQueue: [], quizIndex: 0, quizActive: false, apiKey: '' };
  loadState(); // reseed
  toast('همه چیز پاک شد');
  renderAll();
}

// ---------- Render All ----------
function renderAll() {
  renderStats();
  renderVocabList();
  renderQuizSetup();
  // populate settings inputs
  document.getElementById('intervalEasy').value = settings.intervalEasy;
  document.getElementById('intervalGood').value = settings.intervalGood;
  document.getElementById('intervalHard').value = settings.intervalHard;
}

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', init);
