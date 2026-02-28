/**
 * app.js - Main renderer for WellBeingBar
 * Detects current page and renders appropriate content
 */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('wb-scroll-' + location.pathname, window.scrollY);
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await Data.init();
    await I18n.init();
  } catch (e) {
    console.error('WellBeingBar init failed:', e);
    return;
  }

  if (typeof PracticeSelector !== 'undefined') PracticeSelector.init();

  _setupTooltip();
  _setupScrollTop();
  _setupNavDropdowns();

  const page = detectPage();
  renderPage(page);

  const savedY = sessionStorage.getItem('wb-scroll-' + location.pathname);
  if (savedY) {
    requestAnimationFrame(() => window.scrollTo(0, parseInt(savedY, 10)));
  }

  document.addEventListener('wb-lang-change', () => renderPage(detectPage()));

  // Horizontal scroll arrows for .grid-5 containers
  document.querySelectorAll('.grid-5').forEach(grid => {
    const wrapper = document.createElement('div');
    wrapper.className = 'scroll-wrapper';
    grid.parentNode.insertBefore(wrapper, grid);
    wrapper.appendChild(grid);

    const leftBtn = document.createElement('button');
    leftBtn.className = 'scroll-arrow scroll-arrow-left';
    leftBtn.innerHTML = '&#9664;';
    leftBtn.setAttribute('aria-label', 'Scroll left');

    const rightBtn = document.createElement('button');
    rightBtn.className = 'scroll-arrow scroll-arrow-right';
    rightBtn.innerHTML = '&#9654;';
    rightBtn.setAttribute('aria-label', 'Scroll right');

    wrapper.appendChild(leftBtn);
    wrapper.appendChild(rightBtn);

    function updateArrows() {
      const canLeft = grid.scrollLeft > 5;
      const canRight = grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 5;
      leftBtn.classList.toggle('visible', canLeft);
      rightBtn.classList.toggle('visible', canRight);
    }

    grid.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    setTimeout(updateArrows, 200);

    leftBtn.addEventListener('click', () => grid.scrollBy({ left: -220, behavior: 'smooth' }));
    rightBtn.addEventListener('click', () => grid.scrollBy({ left: 220, behavior: 'smooth' }));
  });
});


/* ===== Page detection ===== */
function detectPage() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('mindful-awareness')) return 'mindful-awareness';
  if (path.includes('body-mind-harmony')) return 'body-mind-harmony';
  if (path.includes('nature-connection')) return 'nature-connection';
  if (path.includes('gratitude-joy')) return 'gratitude-joy';
  if (path.includes('meaningful-bonds')) return 'meaningful-bonds';
  if (path.includes('purpose-growth')) return 'purpose-growth';
  if (path.includes('practice-detail')) return 'practice-detail';
  if (path.includes('compare')) return 'compare';
  if (path.includes('quiz')) return 'quiz';
  if (path.includes('daily-compass')) return 'daily-compass';
  if (path.includes('teachers')) return 'teachers';
  if (path.includes('principles')) return 'principles';
  if (path.includes('parables')) return 'parables';
  if (path.includes('tradition')) return 'tradition';
  if (path.includes('plant-detail')) return 'plant-detail';
  if (path.includes('medicinal-plants')) return 'medicinal-plants';
  return 'index';
}

/* ===== Render dispatch ===== */
function renderPage(page) {
  const renderers = {
    'index': renderIndex,
    'mindful-awareness': () => renderCategory('mindful-awareness'),
    'body-mind-harmony': () => renderCategory('body-mind-harmony'),
    'nature-connection': () => renderCategory('nature-connection'),
    'gratitude-joy': () => renderCategory('gratitude-joy'),
    'meaningful-bonds': () => renderCategory('meaningful-bonds'),
    'purpose-growth': () => renderCategory('purpose-growth'),
    'practice-detail': renderPracticeDetail,
    'compare': renderCompare,
    'quiz': renderQuiz,
    'daily-compass': renderDailyCompass,
    'teachers': renderTeachers,
    'principles': renderPrinciples,
    'parables': renderParables,
    'tradition': renderTradition,
    'medicinal-plants': renderMedicinalPlants,
    'plant-detail': renderPlantDetail
  };
  if (renderers[page]) renderers[page]();
}


/* ==========================================================================
   HELPER FUNCTIONS
   ========================================================================== */

function _t(key) { return I18n.t(key); }

function _practiceName(practice) { return I18n.getPracticeName(practice); }

function _backLink() {
  return `<div class="back-link-row"><a href="index.html" class="back-link">&larr; ${_t('nav.home')}</a></div>`;
}

function _categoryIcon(catId) {
  const icons = {
    'mindful-awareness': '\uD83E\uDDD8',
    'body-mind-harmony': '\uD83C\uDF0A',
    'nature-connection': '\uD83C\uDF3F',
    'gratitude-joy': '\u2600\uFE0F',
    'meaningful-bonds': '\uD83D\uDC9C',
    'purpose-growth': '\uD83C\uDF31'
  };
  return icons[catId] || '\u2728';
}

function _categoryColor(catId) {
  const colors = {
    'mindful-awareness': '#1565C0',
    'body-mind-harmony': '#2E7D32',
    'nature-connection': '#00695C',
    'gratitude-joy': '#E65100',
    'meaningful-bonds': '#C62828',
    'purpose-growth': '#6A1B9A'
  };
  return colors[catId] || '#7E57C2';
}

function _difficultyBadge(level) {
  const color = Data.getDifficultyColor(level);
  const label = Data.getDifficultyLabel(level);
  return `<span class="difficulty-badge" style="background:${color};color:#fff;">${_t('difficulty.' + label)}</span>`;
}

function _scienceBadge(rating) {
  const color = Data.getScienceColor(rating);
  const label = Data.getScienceLabel(rating);
  return `<span class="science-badge" style="background:${color};color:#fff;">${_t('science.' + label)}</span>`;
}

function _benefitBarHtml(dimension, value) {
  const benefitData = Data.getBenefits();
  const info = benefitData[dimension] || {};
  const color = info.color || '#7E57C2';
  const label = _t(info.name_key || ('benefit.' + dimension));
  const icon = info.icon || '';
  const pct = Math.min((value / 5) * 100, 100);
  return `<div class="benefit-bar-row">
    <span class="benefit-bar-label">${icon} ${label}</span>
    <div class="benefit-bar-track"><div class="benefit-bar-fill" style="width:${pct}%;background:${color}"></div></div>
    <span class="benefit-bar-value">${value}/5</span>
  </div>`;
}

function _statBar(label, value, max, unit, color) {
  const pct = Math.min((value / max) * 100, 100);
  return `<div class="stat-bar-row">
    <span class="stat-bar-label">${label}</span>
    <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%;background:${color || 'var(--wb-primary)'}"></div></div>
    <span class="stat-bar-value">${value} ${unit}</span>
  </div>`;
}

function _practiceCardHtml(practice) {
  const name = _practiceName(practice);
  const emoji = practice.emoji || '\u2728';
  const catColor = _categoryColor(practice.category);
  const benefits = practice.benefits || {};
  const dims = ['emotional', 'physical', 'mental', 'social', 'spiritual'];
  const benefitPreview = dims.map(d => {
    const val = benefits[d] || 0;
    const pct = (val / 5) * 100;
    const bInfo = Data.getBenefits()[d] || {};
    return `<div class="mini-bar" title="${_t(bInfo.name_key || ('benefit.' + d))}: ${val}/5">
      <div class="mini-bar-fill" style="width:${pct}%;background:${bInfo.color || '#7E57C2'}"></div>
    </div>`;
  }).join('');

  const timeMin = practice.time_commitment ? practice.time_commitment.minimum_minutes : 0;
  const timeRec = practice.time_commitment ? practice.time_commitment.recommended_minutes : 0;
  const timeStr = timeRec ? `${timeMin}-${timeRec} min` : `${timeMin} min`;

  return `<a href="practice-detail.html?id=${practice.id}" class="card practice-card" style="border-left-color:${catColor}">
    <div class="practice-card-header">
      <span class="card-icon">${emoji}</span>
      <span class="card-title">${name}</span>
    </div>
    <div class="practice-card-badges">
      ${_difficultyBadge(practice.difficulty)}
      ${_scienceBadge(practice.science_rating)}
    </div>
    <div class="practice-card-time">\u23F1 ${timeStr}</div>
    <div class="practice-card-benefits">${benefitPreview}</div>
    <span class="card-link" style="color:${catColor}">${_t('detail.view') || 'View details'} &rarr;</span>
  </a>`;
}

function _shareBarHtml(id) {
  return `<div id="${id}"></div>`;
}

function _shareBar(containerId, url, text) {
  const el = document.getElementById(containerId);
  if (!el) return;
  url = url || window.location.href;
  text = text || 'WellBeingBar - Discover Well-Being Practices';
  el.innerHTML = `<div class="share-bar">
    <span class="share-bar-label">${_t('share.label')}</span>
    <div class="share-bar-buttons">
      <button class="share-btn share-whatsapp" onclick="window.open('https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}','_blank')" title="WhatsApp">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.934 1.395 5.608L0 24l6.579-1.35A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.875 0-3.63-.51-5.13-1.395l-.36-.225-3.735.99.99-3.63-.24-.375A9.677 9.677 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>
      </button>
      <button class="share-btn share-x" onclick="window.open('https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}','_blank')" title="X">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </button>
      <button class="share-btn share-facebook" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}','_blank')" title="Facebook">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </button>
      <button class="share-btn share-linkedin" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}','_blank')" title="LinkedIn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </button>
      <button class="share-btn share-telegram" onclick="window.open('https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}','_blank')" title="Telegram">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
      </button>
      <button class="share-btn share-copy" onclick="_copyLink(this,'${url}')" title="${_t('share.copy')}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
      </button>
    </div>
  </div>`;
}

function _copyLink(btn, url) {
  navigator.clipboard.writeText(url).then(() => {
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 2000);
  });
}

function _setupNavDropdowns() {
  document.querySelectorAll('.nav-dropdown-toggle').forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      var parent = this.closest('.nav-dropdown');
      parent.classList.toggle('open');
    });
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
    }
  });
}

function _setupTooltip() {
  let tip = document.getElementById('wb-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'wb-tooltip';
    document.body.appendChild(tip);
  }
}

function _setupScrollTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.innerHTML = '&#9650;';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
}


/* ==========================================================================
   DAILY QUOTES - Curated wisdom from philosophers and thinkers
   ========================================================================== */
const _authorBios = {
  "Marcus Aurelius": "Roman Emperor (121\u2013180 CE) and Stoic philosopher. His private journal \u2018Meditations\u2019 is one of the greatest works on resilience and inner peace.",
  "Thich Nhat Hanh": "Vietnamese Zen Buddhist monk (1926\u20132022), peace activist, and father of modern mindfulness. Founded Plum Village monastery in France.",
  "Rumi": "13th-century Persian poet and Sufi mystic. His ecstatic poetry on love and the inner journey makes him the best-selling poet in America, 800 years later.",
  "Seneca": "Roman Stoic philosopher (~4 BCE\u201365 CE). Advisor to Emperor Nero, his letters on life, time, and emotions read like timeless self-help wisdom.",
  "Lao Tzu": "Ancient Chinese sage (~6th century BCE), author of the Tao Te Ching. Father of Taoism, teaching harmony with nature and effortless action.",
  "Buddha": "Siddhartha Gautama (~563\u2013483 BCE), the Awakened One. His teachings on mindfulness, suffering, and the Middle Way are the foundation of meditation practice worldwide.",
  "Epictetus": "Greek Stoic philosopher (~50\u2013135 CE), born a slave. Taught that freedom comes from mastering what is within our control and accepting what is not.",
  "Steve Jobs": "Co-founder of Apple (1955\u20132011). Known for combining technology with human creativity, and for his Stanford commencement speech on following your heart.",
  "Albert Einstein": "Theoretical physicist (1879\u20131955) who reshaped our understanding of the universe. Also a deep thinker on imagination, curiosity, and the mystery of life.",
  "Ralph Waldo Emerson": "American essayist and philosopher (1803\u20131882). Leader of the Transcendentalist movement, championing self-reliance and the divinity of nature.",
  "Aristotle": "Greek philosopher (384\u2013322 BCE), student of Plato and teacher of Alexander the Great. His works on ethics, logic, and happiness shaped Western thought for millennia.",
  "Oscar Wilde": "Irish poet and playwright (1854\u20131900). Celebrated wit whose works explore authenticity, beauty, and the courage to be oneself.",
  "Socrates": "Greek philosopher (~470\u2013399 BCE), father of Western philosophy. Taught that the examined life\u2014through questioning everything\u2014is the only life worth living.",
  "Dalai Lama": "Tenzin Gyatso (1935\u2013), the 14th Dalai Lama. Spiritual leader of Tibetan Buddhism, Nobel Peace Prize laureate, and global voice for compassion and inner peace.",
  "Friedrich Nietzsche": "German philosopher (1844\u20131900). His ideas on purpose, will, and self-overcoming challenge us to create meaning in our own lives.",
  "Raji Lukkoor": "Contemporary mindfulness teacher and author. Known for practical wisdom on conscious communication and emotional intelligence.",
  "Anne Lamott": "American novelist and non-fiction writer (1954\u2013). Beloved for her honest, humorous books on faith, imperfection, and the messy beauty of being human.",
  "Bryant McGill": "Author and activist. Known for writings on human potential, inner peace, and personal empowerment.",
  "Nelson Mandela": "South African anti-apartheid leader (1918\u20132013). After 27 years in prison, he became president and a global symbol of resilience, forgiveness, and moral courage.",
  "Chinese Proverb": "Ancient Chinese folk wisdom passed down through generations, reflecting thousands of years of observation about patience, timing, and the rhythms of life.",
  "Amit Ray": "Indian author and spiritual master. Known for integrating neuroscience with meditation and mindfulness in everyday life.",
  "Caroline Myss": "American author (1952\u2013) and medical intuitive. Pioneer in the field of energy medicine and the connection between emotional patterns and health.",
  "William Penn": "English Quaker leader (1644\u20131718) and founder of Pennsylvania. Advocated for peace, religious freedom, and contemplative silence."
};

const _dailyQuotes = [
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "It is not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "Respond; don't react. Listen; don't talk. Think; don't assume.", author: "Raji Lukkoor" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "When you realize nothing is lacking, the whole world belongs to you.", author: "Lao Tzu" },
  { text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Walk as if you are kissing the Earth with your feet.", author: "Thich Nhat Hanh" },
  { text: "Out beyond ideas of wrongdoing and rightdoing there is a field. I'll meet you there.", author: "Rumi" },
  { text: "If you want to conquer the anxiety of life, live in the moment, live in the breath.", author: "Amit Ray" },
  { text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.", author: "Caroline Myss" },
  { text: "True silence is the rest of the mind, and is to the spirit what sleep is to the body.", author: "William Penn" },
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Buddha" }
];


/* ==========================================================================
   INDEX PAGE
   ========================================================================== */
function renderIndex() {
  _renderBodyWisdom();
  _renderHeroStats();
  _renderDailyQuote();
  _renderCompassHome();
  _renderWisdomLibrary();
  _renderTraditionCards();
  _renderCategoryCards();
  _renderFeaturedCards();
  _renderFunFacts();
  _renderHomeShareBar();
}

function _renderBodyWisdom() {
  const box = document.getElementById('body-wisdom-box');
  if (!box) return;
  box.innerHTML = `<div class="summary-box--editorial">
    <p>${_t('wisdom.p1')}</p>
    <p>${_t('wisdom.p2')}</p>
    <p class="summary-cta">${_t('wisdom.p3')}</p>
  </div>`;
}

function _renderHeroStats() {
  const el = document.getElementById('hero-stats');
  if (!el) return;
  const practices = Data.getAllPractices();
  const categories = Data.getCategories();
  var plants = Data.getMedicinalPlants();
  el.textContent = practices.length + ' ' + _t('hero.stats_practices') + ' \u00B7 ' + categories.length + ' ' + _t('hero.stats_pillars') + (plants.length ? ' \u00B7 ' + plants.length + ' ' + (_t('plants.count_label') || 'medicinal plants') : '');
}

function _renderDailyQuote() {
  const el = document.getElementById('daily-quote-box');
  if (!el) return;
  // Use date-based index for daily consistency
  const today = new Date();
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % _dailyQuotes.length;
  const quote = _dailyQuotes[dayIndex];
  var bio = _authorBios[quote.author] || '';
  el.innerHTML = '<div class="daily-quote-box">' +
    '<div class="quote-icon">\u2728</div>' +
    '<div class="quote-body">' +
      '<div class="quote-text">' + quote.text + '</div>' +
      '<div class="quote-author"><span class="quote-author-btn">\u2014 ' + quote.author +
        (bio ? ' <span class="quote-info-btn">i</span>' : '') +
      '</span>' +
      (bio ? '<div class="quote-bio"><div class="quote-bio-title">Who is ' + quote.author + '</div>' + bio + '</div>' : '') +
      '</div>' +
    '</div>' +
  '</div>';
}

function _renderCompassHome() {
  var box = document.getElementById('compass-home-box');
  if (!box) return;
  box.innerHTML = '<div class="compass-home-card">' +
    '<div class="compass-home-icon">\uD83E\uDDD8</div>' +
    '<div class="compass-home-text">' +
      '<h3>' + (_t('compass.home_cta') || 'Find Your Practice Now') + '</h3>' +
      '<p>' + (_t('compass.home_desc') || 'Answer 5 quick questions and get personalized practice recommendations based on how you feel right now.') + '</p>' +
      '<a href="daily-compass.html" class="compass-home-btn">' + (_t('compass.start') || 'Start Here') + ' \u2192</a>' +
    '</div>' +
  '</div>';
}

function _renderWisdomLibrary() {
  var grid = document.getElementById('wisdom-library-cards');
  if (!grid) return;

  var tiles = [
    {
      emoji: '\uD83C\uDFDB\uFE0F',
      titleKey: 'wisdom_library.teachers_title',
      descKey: 'wisdom_library.teachers_desc',
      link: 'teachers.html',
      linkKey: 'wisdom_library.read_more',
      color: '#4A148C'
    },
    {
      emoji: '\uD83E\uDDED',
      titleKey: 'wisdom_library.principles_title',
      descKey: 'wisdom_library.principles_desc',
      link: 'principles.html',
      linkKey: 'wisdom_library.read_more',
      color: '#1565C0'
    },
    {
      emoji: '\uD83D\uDCD6',
      titleKey: 'wisdom_library.parables_title',
      descKey: 'wisdom_library.parables_desc',
      link: 'parables.html',
      linkKey: 'wisdom_library.read_more',
      color: '#00695C'
    },
    {
      emoji: '\uD83C\uDF3F',
      titleKey: 'wisdom_library.plants_title',
      descKey: 'wisdom_library.plants_desc',
      link: 'medicinal-plants.html',
      linkKey: 'wisdom_library.read_more',
      color: '#2E7D32'
    }
  ];

  grid.innerHTML = tiles.map(function(t) {
    return '<a href="' + t.link + '" class="wisdom-tile" style="border-top: 4px solid ' + t.color + '">' +
      '<span class="wisdom-tile-emoji">' + t.emoji + '</span>' +
      '<h3 class="wisdom-tile-title">' + _t(t.titleKey) + '</h3>' +
      '<p class="wisdom-tile-desc">' + _t(t.descKey) + '</p>' +
      '<span class="wisdom-tile-link" style="color:' + t.color + '">' + _t(t.linkKey) + ' \u2192</span>' +
    '</a>';
  }).join('');
}

function _renderTraditionCards() {
  var grid = document.getElementById('tradition-cards');
  if (!grid) return;

  var traditions = Data.getTraditions();
  var practices = Data.getAllPractices();

  grid.innerHTML = traditions.map(function(t) {
    var count = practices.filter(function(p) { return p.origin === t.id; }).length;
    return '<a href="tradition.html?id=' + t.id + '" class="card tradition-card" style="border-left-color:' + t.color + '">' +
      '<span class="card-icon">' + t.icon + '</span>' +
      '<div class="card-content">' +
        '<span class="card-title">' + _t(t.name_key) + '</span>' +
        '<div class="card-desc">' + _t(t.description_key) + '</div>' +
        '<span class="tradition-count">' + count + ' ' + _t('category.practices_found') + '</span>' +
        '<span class="tradition-link" style="color:' + t.color + '">' + _t('wisdom_library.read_more') + ' \u2192</span>' +
      '</div>' +
    '</a>';
  }).join('');
}

function _renderCategoryCards() {
  const grid = document.getElementById('category-cards');
  if (!grid) return;
  const cats = Data.getCategories();
  grid.innerHTML = cats.map(c => `<a href="${c.page}" class="card category-card" style="border-left-color:${c.color}">
    <span class="card-icon">${c.icon}</span>
    <div class="card-content">
      <span class="card-title">${_t(c.name_key)}</span>
      <div class="card-desc">${_t(c.desc_key)}</div>
      <span class="card-link" style="color:${c.color}">${_t(c.link_key)} &rarr;</span>
    </div>
  </a>`).join('');
}

function _renderFeaturedCards() {
  const grid = document.getElementById('featured-cards');
  if (!grid) return;
  const practices = Data.getAllPractices();

  // Top Meditation (best meditation by overall benefit score)
  const topMeditation = practices.filter(p => p.subcategory === 'meditation')
    .sort((a, b) => Data.getOverallBenefitScore(b) - Data.getOverallBenefitScore(a))[0];
  // Most Scientific (highest science_rating)
  const mostScientific = practices.slice().sort((a, b) => (b.science_rating || 0) - (a.science_rating || 0))[0];
  // Most Accessible (lowest difficulty + free + no equipment)
  const accessible = practices.filter(p => p.difficulty <= 2 && p.cost_tier === 1 && p.equipment_needed === 'none');
  const mostAccessible = accessible.sort((a, b) => a.difficulty - b.difficulty)[0] || practices[0];
  // Best for Stress (highest emotional benefit)
  const bestStress = practices.slice().sort((a, b) => ((b.benefits || {}).emotional || 0) - ((a.benefits || {}).emotional || 0))[0];
  // Nature's Gift (top nature-connection practice by overall score)
  const natureGift = practices.filter(p => p.category === 'nature-connection')
    .sort((a, b) => Data.getOverallBenefitScore(b) - Data.getOverallBenefitScore(a))[0];

  const featured = [
    { key: 'featured.top_meditation', top: topMeditation, color: '#1565C0' },
    { key: 'featured.most_scientific', top: mostScientific, color: '#4A148C' },
    { key: 'featured.most_accessible', top: mostAccessible, color: '#F9A825' },
    { key: 'featured.best_for_stress', top: bestStress, color: '#E65100' },
    { key: 'featured.natures_gift', top: natureGift, color: '#00695C' }
  ];

  grid.innerHTML = featured.map(f => {
    if (!f.top) return '';
    const name = _practiceName(f.top);
    const emoji = f.top.emoji || '\u2728';
    return `<a href="practice-detail.html?id=${f.top.id}" class="card featured-card" style="border-left-color:${f.color}">
      <span class="card-icon">${emoji}</span>
      <div class="card-content">
        <span class="card-title">${_t(f.key)}</span>
        <div class="card-desc">${name}</div>
        <span class="card-link" style="color:${f.color}">${_t('detail.view') || 'View'} &rarr;</span>
      </div>
    </a>`;
  }).join('');

  // Wire arrow buttons with visibility toggle (same pattern as Wildpedia)
  var leftBtn = document.querySelector('.featured-arrow-left');
  var rightBtn = document.querySelector('.featured-arrow-right');
  if (leftBtn && rightBtn) {
    var scrollAmount = 280;
    function updateArrows() {
      var canLeft = grid.scrollLeft > 5;
      var canRight = grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 5;
      leftBtn.classList.toggle('visible', canLeft);
      rightBtn.classList.toggle('visible', canRight);
    }
    leftBtn.addEventListener('click', function() { grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' }); });
    rightBtn.addEventListener('click', function() { grid.scrollBy({ left: scrollAmount, behavior: 'smooth' }); });
    grid.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }
}

function _renderBenefitsOverview() {
  const box = document.getElementById('benefits-chart-box');
  if (!box) return;
  const practices = Data.getAllPractices();
  if (practices.length === 0) return;

  const dims = ['emotional', 'physical', 'mental', 'social', 'spiritual'];
  const benefitData = Data.getBenefits();
  const avgScores = dims.map(d => {
    const total = practices.reduce((sum, p) => sum + ((p.benefits || {})[d] || 0), 0);
    return Math.round((total / practices.length) * 10) / 10;
  });

  const labels = dims.map(d => _t(benefitData[d] ? benefitData[d].name_key : ('benefit.' + d)));
  const colors = dims.map(d => benefitData[d] ? benefitData[d].color : '#7E57C2');

  box.innerHTML = `<div class="econ-chart-box"><canvas id="benefits-overview-chart"></canvas></div>
    <div class="benefits-legend" style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;margin-top:1rem;">
      ${dims.map((d, i) => `<span style="display:flex;align-items:center;gap:0.3rem;font-size:0.85rem;">
        <span style="width:12px;height:12px;border-radius:50%;background:${colors[i]};display:inline-block;"></span>
        ${labels[i]}: <strong>${avgScores[i]}</strong>
      </span>`).join('')}
    </div>`;

  if (typeof Chart !== 'undefined') {
    const ctx = document.getElementById('benefits-overview-chart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: avgScores,
          backgroundColor: colors,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function _renderScienceSpotlight() {
  const box = document.getElementById('science-chart-box');
  if (!box) return;
  const practices = Data.getAllPractices();
  if (practices.length === 0) return;

  const scienceData = Data.getScience();
  const levels = (scienceData.evidence_levels || []);
  const ratingCounts = {};
  practices.forEach(p => {
    const r = p.science_rating || 0;
    if (r > 0) ratingCounts[r] = (ratingCounts[r] || 0) + 1;
  });

  const chartData = levels.map(l => ({
    label: _t(l.name_key),
    count: ratingCounts[l.id] || 0,
    color: l.color
  })).filter(d => d.count > 0);

  box.innerHTML = `<div class="econ-chart-box"><canvas id="science-spotlight-chart"></canvas></div>
    <div class="science-legend" style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;margin-top:1rem;">
      ${chartData.map(d => `<span style="display:flex;align-items:center;gap:0.3rem;font-size:0.85rem;">
        <span style="width:12px;height:12px;border-radius:50%;background:${d.color};display:inline-block;"></span>
        ${d.label}: <strong>${d.count}</strong>
      </span>`).join('')}
    </div>`;

  if (typeof Chart !== 'undefined') {
    const ctx = document.getElementById('science-spotlight-chart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartData.map(d => d.label),
        datasets: [{
          data: chartData.map(d => d.count),
          backgroundColor: chartData.map(d => d.color),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

function _renderFunFacts() {
  const grid = document.getElementById('fun-facts-grid');
  if (!grid) return;
  const practices = Data.getAllPractices();
  const facts = [];
  const shuffled = practices.slice().sort(() => Math.random() - 0.5);
  for (const p of shuffled) {
    if (p.fun_facts && p.fun_facts.length > 0) {
      facts.push({ practice: p, fact: p.fun_facts[Math.floor(Math.random() * p.fun_facts.length)] });
      if (facts.length >= 6) break;
    }
  }
  grid.innerHTML = `<div class="cards-grid grid-3x2">${facts.map(f =>
    `<a href="practice-detail.html?id=${f.practice.id}" class="card fun-fact-card" style="text-decoration:none;color:inherit;">
      <span class="card-icon">${f.practice.emoji || '\u2728'}</span>
      <span class="card-title">${_practiceName(f.practice)}</span>
      <div class="card-description">${f.fact}</div>
    </a>`
  ).join('')}</div>`;
}

function _renderHomeShareBar() {
  _shareBar('share-bar-home');
}


/* ==========================================================================
   CATEGORY PAGE (generic - used by all 6 categories)
   ========================================================================== */
function renderCategory(categoryId) {
  const el = document.getElementById('category-content');
  if (!el) return;

  const category = Data.getCategory(categoryId);
  const practices = Data.getPracticesByCategory(categoryId);

  // Get unique subcategories
  const subcategories = [...new Set(practices.map(p => p.subcategory).filter(Boolean))];
  let activeSubcat = '';

  function render() {
    const filtered = activeSubcat
      ? practices.filter(p => p.subcategory === activeSubcat)
      : practices;

    const catName = category ? _t(category.name_key) : categoryId;
    const catIcon = category ? category.icon : _categoryIcon(categoryId);
    const catColor = category ? category.color : _categoryColor(categoryId);

    el.innerHTML = `
      ${_backLink()}
      <h1 class="page-title">${catIcon} ${catName}</h1>
      <p class="page-intro">${category ? _t(category.desc_key) : ''}</p>
      ${subcategories.length > 1 ? `<div class="pillar-tabs">
        <button class="pillar-tab ${!activeSubcat ? 'active' : ''}" data-subcat="" style="${!activeSubcat ? 'background:' + catColor + ';border-color:' + catColor : ''}">${_t('category.all') || 'All'}</button>
        ${subcategories.map(sc => `<button class="pillar-tab ${activeSubcat === sc ? 'active' : ''}" data-subcat="${sc}" style="${activeSubcat === sc ? 'background:' + catColor + ';border-color:' + catColor : ''}">${_t('subcat.' + sc.replace(/-/g, '_')) || sc.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</button>`).join('')}
      </div>` : ''}
      <p style="color:var(--text-gray);margin-bottom:1rem"><strong>${filtered.length}</strong> ${_t('category.practices_found') || 'practices'}</p>
      <div class="cards-grid grid-3x2">
        ${filtered.map(p => _practiceCardHtml(p)).join('')}
      </div>
      ${_shareBarHtml('share-bar-category')}
    `;

    _shareBar('share-bar-category');

    el.querySelectorAll('.pillar-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSubcat = btn.dataset.subcat;
        render();
      });
    });
  }
  render();
}


/* ==========================================================================
   TRADITION PAGE (filtered by origin)
   ========================================================================== */
function renderTradition() {
  var el = document.getElementById('tradition-content');
  if (!el) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  // If no ID, show all traditions overview
  if (!id) {
    var traditions = Data.getTraditions();
    var allPractices = Data.getAllPractices();
    el.innerHTML =
      _backLink() +
      '<h1 class="page-title">' + _t('traditions.section_title') + '</h1>' +
      '<p class="page-intro">' + _t('traditions.section_subtitle') + '</p>' +
      '<div class="cards-grid grid-3x2">' +
        traditions.map(function(t) {
          var count = allPractices.filter(function(p) { return p.origin === t.id; }).length;
          return '<a href="tradition.html?id=' + t.id + '" class="card tradition-card" style="border-left-color:' + t.color + '">' +
            '<span class="card-icon">' + t.icon + '</span>' +
            '<div class="card-content">' +
              '<span class="card-title">' + _t(t.name_key) + '</span>' +
              '<div class="card-desc">' + _t(t.description_key) + '</div>' +
              '<span class="tradition-count" style="color:' + t.color + '">' + count + ' ' + _t('category.practices_found') + '</span>' +
            '</div>' +
          '</a>';
        }).join('') +
      '</div>';
    return;
  }

  var tradition = Data.getTradition(id);
  var practices = Data.getPracticesByOrigin(id);

  if (!tradition) {
    el.innerHTML = _backLink() + '<p>Tradition not found.</p>';
    return;
  }

  var tradName = _t(tradition.name_key);
  var tradDesc = _t(tradition.description_key);
  var tradColor = tradition.color;

  // Get unique categories among these practices for filtering
  var categories = [];
  var seen = {};
  practices.forEach(function(p) {
    if (!seen[p.category]) {
      seen[p.category] = true;
      categories.push(p.category);
    }
  });
  var activeCat = '';

  function render() {
    var filtered = activeCat
      ? practices.filter(function(p) { return p.category === activeCat; })
      : practices;

    el.innerHTML =
      _backLink() +
      '<h1 class="page-title">' + tradition.icon + ' ' + tradName + '</h1>' +
      '<p class="page-intro">' + tradDesc + '</p>' +
      (categories.length > 1 ? '<div class="pillar-tabs">' +
        '<button class="pillar-tab ' + (!activeCat ? 'active' : '') + '" data-cat="" style="' + (!activeCat ? 'background:' + tradColor + ';border-color:' + tradColor : '') + '">' + (_t('category.all') || 'All') + '</button>' +
        categories.map(function(catId) {
          var cat = Data.getCategory(catId);
          var catName = cat ? _t(cat.name_key) : catId;
          return '<button class="pillar-tab ' + (activeCat === catId ? 'active' : '') + '" data-cat="' + catId + '" style="' + (activeCat === catId ? 'background:' + tradColor + ';border-color:' + tradColor : '') + '">' + catName + '</button>';
        }).join('') +
      '</div>' : '') +
      '<p style="color:var(--text-gray);margin-bottom:1rem"><strong>' + filtered.length + '</strong> ' + (_t('category.practices_found') || 'practices') + '</p>' +
      '<div class="cards-grid grid-3x2">' +
        filtered.map(function(p) { return _practiceCardHtml(p); }).join('') +
      '</div>' +
      _shareBarHtml('share-bar-tradition');

    _shareBar('share-bar-tradition');

    el.querySelectorAll('.pillar-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        activeCat = btn.dataset.cat;
        render();
      });
    });
  }
  render();

  // Update page title
  document.title = tradName + ' — WellBeingBar';
}


/* ==========================================================================
   PRACTICE DETAIL
   ========================================================================== */
function renderPracticeDetail() {
  const el = document.getElementById('practice-detail-content');
  if (!el) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  // Browse all practices if no ID
  if (!id) {
    const practices = Data.getAllPractices();
    const lang = I18n.getLang();
    const sorted = practices.map(p => ({ practice: p, name: _practiceName(p) }))
      .sort((a, b) => a.name.localeCompare(b.name, lang));
    el.innerHTML = `
      ${_backLink()}
      <h1 class="page-title">${_t('nav.practice_search')}</h1>
      <div class="food-browse-grid">
        ${sorted.map(({ practice: p, name }) =>
          `<a href="practice-detail.html?id=${p.id}" class="card food-browse-card">
            <span class="food-browse-icon">${p.emoji || '\u2728'}</span>
            <span class="food-browse-name">${name}</span>
            <div style="margin-top:0.25rem">${_difficultyBadge(p.difficulty)} ${_scienceBadge(p.science_rating)}</div>
          </a>`
        ).join('')}
      </div>`;
    return;
  }

  const practice = Data.getPractice(id);
  if (!practice) {
    el.innerHTML = `${_backLink()}<div class="not-found">${_t('error.practice_not_found') || 'Practice not found.'}</div>`;
    return;
  }

  const name = _practiceName(practice);
  const emoji = practice.emoji || '\u2728';
  const catColor = _categoryColor(practice.category);
  const catIcon = _categoryIcon(practice.category);
  const benefits = practice.benefits || {};
  const dims = ['emotional', 'physical', 'mental', 'social', 'spiritual'];
  const time = practice.time_commitment || {};
  const timeMin = time.minimum_minutes || 0;
  const timeRec = time.recommended_minutes || timeMin;
  const timeStr = timeMin === timeRec ? `${timeMin} min` : `${timeMin}-${timeRec} min`;
  const related = Data.getRelatedPractices(id);

  // Cost tier display
  const costLabels = { 1: 'free', 2: 'low_cost', 3: 'moderate_cost' };
  const costLabel = _t('cost.' + (costLabels[practice.cost_tier] || 'free'));

  // Setting display
  const settingsStr = (practice.settings || []).map(s => _t('setting.' + s)).join(', ');

  // Solo/group display
  const sgRaw = practice.solo_or_group;
  const sgArr = Array.isArray(sgRaw) ? sgRaw : (sgRaw ? [sgRaw] : []);
  const soloGroup = sgArr.map(s => _t('mode.' + s)).join(', ');

  // Equipment
  const equipmentStr = practice.equipment_needed === 'none'
    ? _t('equipment.none') || 'None'
    : (practice.equipment_needed || '').replace(/_/g, ' ');

  el.innerHTML = `
    ${_backLink()}

    <!-- Header -->
    <div class="practice-detail-header">
      <h1 class="page-title">${emoji} ${name}</h1>
      <div class="practice-tags-row">
        <span class="category-badge" style="background:${catColor};color:#fff;">${catIcon} ${_t('cat.' + practice.category.replace(/-/g, '_'))}</span>
        ${_difficultyBadge(practice.difficulty)}
        ${_scienceBadge(practice.science_rating)}
      </div>
      ${practice.origin ? `<p style="font-style:italic;color:var(--text-gray);margin-top:0.5rem">${_t('detail.origin')}: ${_t('origin.' + practice.origin)}</p>` : ''}
    </div>

    <!-- Quick Stats Row -->
    <div class="content-section">
      <h2>${_t('detail.quick_stats')}</h2>
      <div class="econ-metrics">
        <div class="econ-metric"><div class="econ-metric-label">\u23F1 ${_t('detail.time')}</div><div class="econ-metric-value">${timeStr}</div></div>
        <div class="econ-metric"><div class="econ-metric-label">\uD83C\uDFAF ${_t('detail.difficulty_label')}</div><div class="econ-metric-value">${_t('difficulty.' + Data.getDifficultyLabel(practice.difficulty))}</div></div>
        <div class="econ-metric"><div class="econ-metric-label">\uD83D\uDCB0 ${_t('detail.cost')}</div><div class="econ-metric-value">${costLabel}</div></div>
        <div class="econ-metric"><div class="econ-metric-label">\uD83C\uDFE0 ${_t('detail.setting')}</div><div class="econ-metric-value">${settingsStr || '\u2014'}</div></div>
        <div class="econ-metric"><div class="econ-metric-label">\uD83D\uDC65 ${_t('detail.solo_group')}</div><div class="econ-metric-value">${soloGroup || '\u2014'}</div></div>
      </div>
    </div>

    <!-- Benefits Radar Chart -->
    <div class="content-section">
      <h2>${_t('detail.benefits')}</h2>
      <div class="benefits-layout">
        <div class="benefits-radar"><canvas id="benefits-radar-chart"></canvas></div>
        <div class="benefits-bars">
          ${dims.map(d => _benefitBarHtml(d, benefits[d] || 0)).join('')}
        </div>
      </div>
    </div>

    <!-- How It Helps -->
    ${practice.best_for && practice.best_for.length ? `<div class="content-section">
      <h2>${_t('detail.how_it_helps')}</h2>
      <div class="age-benefit-chips">
        ${practice.best_for.map(tag => `<span class="food-chip">${_t('bestfor.' + tag) || tag.replace(/_/g, ' ')}</span>`).join('')}
      </div>
    </div>` : ''}

    <!-- Science & Evidence -->
    <div class="content-section">
      <h2>\uD83D\uDD2C ${_t('detail.science_evidence')}</h2>
      ${_statBar(_t('detail.evidence_level'), practice.science_rating || 0, 5, '/5', Data.getScienceColor(practice.science_rating))}
      ${practice.science_summary ? `<p style="margin-top:1rem">${practice.science_summary}</p>` : ''}
      ${practice.key_studies && practice.key_studies.length ? `<div style="margin-top:1rem">
        <h3>${_t('detail.key_studies')}</h3>
        <ul class="studies-list">
          ${practice.key_studies.map(s => `<li>${typeof s === 'string' ? s : (
            `<strong>${s.title || s.author || ''}</strong>` +
            (s.year ? `<span style="color:var(--text-gray)"> (${s.year})</span>` : '') +
            (s.finding ? `<br><span style="font-size:0.9rem">${s.finding}</span>` : '')
          )}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>

    <!-- Quick Tips -->
    ${practice.quick_tips && practice.quick_tips.length ? `<div class="content-section">
      <h2>\uD83D\uDCA1 ${_t('detail.quick_tips')}</h2>
      <ul class="tips-list">
        ${practice.quick_tips.map(tip => `<li>${tip}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Contraindications -->
    ${practice.contraindications && practice.contraindications.length ? `<div class="content-section contraindications-box">
      <h2>\u26A0\uFE0F ${_t('detail.contraindications')}</h2>
      <ul class="avoid-list">
        ${practice.contraindications.map(c => `<li>${c}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Fun Facts -->
    ${practice.fun_facts && practice.fun_facts.length ? `<div class="content-section">
      <h2>\uD83C\uDF1F ${_t('detail.fun_facts')}</h2>
      <div class="cards-grid grid-2">
        ${practice.fun_facts.map(f => `<div class="card fun-fact-card">
          <div class="card-description">${f}</div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Equipment Needed -->
    <div class="content-section">
      <h2>\uD83E\uDDF0 ${_t('detail.equipment')}</h2>
      <p>${equipmentStr}</p>
    </div>

    <!-- Related Practices -->
    ${related.length ? `<div class="content-section">
      <h2>${_t('detail.related')}</h2>
      <div class="age-benefit-chips">
        ${related.map(rp => `<a href="practice-detail.html?id=${rp.id}" class="food-chip">${rp.emoji || '\u2728'} ${_practiceName(rp)}</a>`).join('')}
      </div>
    </div>` : ''}

    ${_shareBarHtml('share-bar-detail')}
  `;

  _shareBar('share-bar-detail');

  // Render benefits radar chart
  if (typeof Chart !== 'undefined') {
    const ctx = document.getElementById('benefits-radar-chart');
    if (ctx) {
      const benefitMeta = Data.getBenefits();
      const radarLabels = dims.map(d => {
        const icon = benefitMeta[d] ? benefitMeta[d].icon : '';
        return icon + ' ' + _t(benefitMeta[d] ? benefitMeta[d].name_key : ('benefit.' + d));
      });
      const radarData = dims.map(d => benefits[d] || 0);
      const radarColors = dims.map(d => benefitMeta[d] ? benefitMeta[d].color : '#7E57C2');

      new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
          labels: radarLabels,
          datasets: [{
            label: name,
            data: radarData,
            borderColor: catColor,
            backgroundColor: catColor + '33',
            borderWidth: 2,
            pointBackgroundColor: catColor
          }]
        },
        options: {
          responsive: true,
          scales: {
            r: {
              min: 0, max: 5,
              ticks: { stepSize: 1, font: { size: 14 } },
              pointLabels: { font: { size: 16, weight: '600' } }
            }
          },
          plugins: { legend: { display: false } }
        }
      });
    }
  }
}


/* ==========================================================================
   COMPARE
   ========================================================================== */
function renderCompare() {
  const el = document.getElementById('compare-content');
  if (!el) return;

  const practices = Data.getAllPractices();
  const lang = I18n.getLang();
  const sorted = practices.slice().sort((a, b) => _practiceName(a).localeCompare(_practiceName(b), lang));

  const params = new URLSearchParams(window.location.search);
  let sel1 = params.get('a') || '';
  let sel2 = params.get('b') || '';
  let sel3 = params.get('c') || '';

  function render() {
    const options = sorted.map(p => `<option value="${p.id}">${p.emoji || '\u2728'} ${_practiceName(p)}</option>`).join('');

    el.innerHTML = `
      ${_backLink()}
      <h1 class="page-title">${_t('compare.title')}</h1>
      <p class="page-intro">${_t('compare.subtitle')}</p>
      <div class="compare-controls">
        <div class="compare-selector">
          <label>${_t('compare.select_first')}</label>
          <select id="compare-a"><option value="">\u2014</option>${options}</select>
        </div>
        <div class="compare-selector">
          <label>${_t('compare.select_second')}</label>
          <select id="compare-b"><option value="">\u2014</option>${options}</select>
        </div>
        <div class="compare-selector">
          <label>${_t('compare.select_third')}</label>
          <select id="compare-c"><option value="">\u2014</option>${options}</select>
        </div>
        <button class="compare-btn" id="compare-go">${_t('compare.btn')}</button>
      </div>
      <div id="compare-results"></div>
      ${_shareBarHtml('share-bar-compare')}`;

    if (sel1) document.getElementById('compare-a').value = sel1;
    if (sel2) document.getElementById('compare-b').value = sel2;
    if (sel3) document.getElementById('compare-c').value = sel3;

    document.getElementById('compare-go').addEventListener('click', () => {
      sel1 = document.getElementById('compare-a').value;
      sel2 = document.getElementById('compare-b').value;
      sel3 = document.getElementById('compare-c').value;

      // Update URL params
      const newUrl = new URL(window.location);
      if (sel1) newUrl.searchParams.set('a', sel1); else newUrl.searchParams.delete('a');
      if (sel2) newUrl.searchParams.set('b', sel2); else newUrl.searchParams.delete('b');
      if (sel3) newUrl.searchParams.set('c', sel3); else newUrl.searchParams.delete('c');
      history.replaceState(null, '', newUrl);

      _renderComparison(sel1, sel2, sel3);
    });

    if (sel1 && sel2) _renderComparison(sel1, sel2, sel3);
    _shareBar('share-bar-compare');
  }

  function _renderComparison(id1, id2, id3) {
    const box = document.getElementById('compare-results');
    const selected = [id1, id2, id3].map(id => Data.getPractice(id)).filter(Boolean);
    if (selected.length < 2) {
      box.innerHTML = `<div class="compare-hint">${_t('compare.hint')}</div>`;
      return;
    }

    const colors = ['#1565C0', '#2E7D32', '#6A1B9A'];
    const dims = ['emotional', 'physical', 'mental', 'social', 'spiritual'];
    const benefitMeta = Data.getBenefits();

    // Stats comparison bars
    const maxTime = Math.max(...selected.map(p => (p.time_commitment ? p.time_commitment.maximum_minutes : 0))) * 1.2 || 60;

    const statKeys = [
      { key: 'time', label: _t('detail.time') + ' (min/' + (_t('detail.day') || 'day') + ')', getVal: p => p.time_commitment ? p.time_commitment.recommended_minutes || p.time_commitment.minimum_minutes : 0, max: maxTime, unit: 'min' },
      { key: 'difficulty', label: _t('detail.difficulty_label'), getVal: p => p.difficulty || 0, max: 5, unit: '/5' },
      { key: 'cost', label: _t('detail.cost'), getVal: p => p.cost_tier || 1, max: 3, unit: '/3' },
      { key: 'science', label: _t('detail.evidence_level'), getVal: p => p.science_rating || 0, max: 5, unit: '/5' }
    ];

    // Additional info
    const infoRows = [
      { label: _t('detail.equipment') || 'Equipment', getVal: p => p.equipment_needed === 'none' ? (_t('equipment.none') || 'None') : (p.equipment_needed || '').replace(/_/g, ' ') },
      { label: _t('detail.best_for') || 'Best for', getVal: p => (p.best_for || []).slice(0, 3).map(t => _t('bestfor.' + t) || t.replace(/_/g, ' ')).join(', ') || '\u2014' },
      { label: _t('detail.setting') || 'Settings', getVal: p => (p.settings || []).map(s => _t('setting.' + s)).join(', ') || '\u2014' }
    ];

    box.innerHTML = `
      <div class="compare-section">
        <h2>${_t('compare.stats')}</h2>
        ${statKeys.map(sk => `<div class="compare-bar-row">
          <div class="compare-bar-label">${sk.label}</div>
          <div class="compare-bar-group">
            ${selected.map((p, i) => {
              const val = sk.getVal(p);
              const pct = sk.max > 0 ? Math.min((val / sk.max) * 100, 100) : 0;
              return `<div class="compare-bar-entry">
                <span class="compare-bar-name">${p.emoji || '\u2728'} ${_practiceName(p)}</span>
                <div class="compare-bar-track"><div class="compare-bar-fill" style="width:${pct}%;background:${colors[i]}"></div></div>
                <span class="compare-bar-value">${val} ${sk.unit}</span>
              </div>`;
            }).join('')}
          </div>
        </div>`).join('')}
      </div>
      <div class="compare-section">
        <h2>${_t('compare.benefits') || 'Benefits'}</h2>
        <div class="compare-radar-wrap"><canvas id="compare-radar"></canvas></div>
      </div>
      <div class="compare-section">
        <h2>${_t('compare.additional') || 'Additional Info'}</h2>
        <div class="compare-info-table">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;padding:0.5rem;border-bottom:2px solid var(--border-light, #eee);"></th>
                ${selected.map((p, i) => `<th style="text-align:left;padding:0.5rem;border-bottom:2px solid ${colors[i]};color:${colors[i]};">${p.emoji || '\u2728'} ${_practiceName(p)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${infoRows.map(row => `<tr>
                <td style="padding:0.5rem;font-weight:600;border-bottom:1px solid var(--border-light, #eee);">${row.label}</td>
                ${selected.map(p => `<td style="padding:0.5rem;border-bottom:1px solid var(--border-light, #eee);">${row.getVal(p)}</td>`).join('')}
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    // Radar chart
    if (typeof Chart !== 'undefined') {
      const ctx = document.getElementById('compare-radar');
      if (ctx) {
        const radarLabels = dims.map(d => {
          const icon = benefitMeta[d] ? benefitMeta[d].icon : '';
          return icon + ' ' + _t(benefitMeta[d] ? benefitMeta[d].name_key : ('benefit.' + d));
        });

        new Chart(ctx.getContext('2d'), {
          type: 'radar',
          data: {
            labels: radarLabels,
            datasets: selected.map((p, i) => ({
              label: _practiceName(p),
              data: dims.map(d => (p.benefits || {})[d] || 0),
              borderColor: colors[i],
              backgroundColor: colors[i] + '33',
              borderWidth: 2,
              pointBackgroundColor: colors[i]
            }))
          },
          options: {
            responsive: true,
            scales: {
              r: {
                min: 0, max: 5,
                ticks: { stepSize: 1, font: { size: 14 } },
                pointLabels: { font: { size: 16, weight: '600' } }
              }
            },
            plugins: {
              legend: { labels: { font: { size: 15, weight: '600' }, padding: 20 } }
            }
          }
        });
      }
    }
  }
  render();
}


/* ==========================================================================
   QUIZ
   ========================================================================== */
function renderQuiz() {
  const el = document.getElementById('quiz-content');
  if (!el) return;

  let state = 'start'; // start, play, results
  let difficulty = 'medium'; // easy, medium, hard
  let questions = [];
  let current = 0;
  let score = 0;
  let answered = false;

  function generateQuestions() {
    const practices = Data.getAllPractices();
    const qs = [];

    // === EASY questions ===

    // Which practice is a form of meditation?
    const meditations = practices.filter(p => p.tags && p.tags.includes('meditation'));
    const nonMeditations = practices.filter(p => !p.tags || !p.tags.includes('meditation'));
    if (meditations.length >= 1 && nonMeditations.length >= 3) {
      const correct = _pickRandom(meditations, 1)[0];
      const wrong = _pickRandom(nonMeditations, 3);
      qs.push({ diff: 'easy', q: _t('quiz.q_meditation') || 'Which practice is a form of meditation?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.is_meditation') || 'is a meditation practice.'}` });
    }

    // Which practice is done outdoors?
    const outdoor = practices.filter(p => p.settings && p.settings.includes('outdoors'));
    const indoor = practices.filter(p => p.settings && !p.settings.includes('outdoors'));
    if (outdoor.length >= 1 && indoor.length >= 3) {
      const correct = _pickRandom(outdoor, 1)[0];
      const wrong = _pickRandom(indoor, 3);
      qs.push({ diff: 'easy', q: _t('quiz.q_outdoors') || 'Which practice is typically done outdoors?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.is_outdoor') || 'is an outdoor practice.'}` });
    }

    // Which practice needs no equipment?
    const noEquip = practices.filter(p => p.equipment_needed === 'none');
    const hasEquip = practices.filter(p => p.equipment_needed !== 'none');
    if (noEquip.length >= 1 && hasEquip.length >= 3) {
      const correct = _pickRandom(noEquip, 1)[0];
      const wrong = _pickRandom(hasEquip, 3);
      qs.push({ diff: 'easy', q: _t('quiz.q_no_equipment') || 'Which practice needs no equipment?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.needs_nothing') || 'requires no equipment at all.'}` });
    }

    // Which category does X belong to? (6 categories)
    const categories = Data.getCategories();
    categories.forEach(cat => {
      const catPractices = practices.filter(p => p.category === cat.id);
      const otherPractices = practices.filter(p => p.category !== cat.id);
      if (catPractices.length >= 1 && otherPractices.length >= 3) {
        const correct = _pickRandom(catPractices, 1)[0];
        const wrong = _pickRandom(otherPractices, 3);
        const catName = _t(cat.name_key);
        qs.push({ diff: 'easy', q: (_t('quiz.q_category') || 'Which practice belongs to the "{cat}" pillar?').replace('{cat}', catName), options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.belongs_to') || 'belongs to'} ${catName}.` });
      }
    });

    // Which practice is free?
    const freePractices = practices.filter(p => p.cost_tier === 1);
    const paidPractices = practices.filter(p => p.cost_tier > 1);
    if (freePractices.length >= 1 && paidPractices.length >= 3) {
      const correct = _pickRandom(freePractices, 1)[0];
      const wrong = _pickRandom(paidPractices, 3);
      qs.push({ diff: 'easy', q: _t('quiz.q_free') || 'Which of these practices is completely free?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.is_free') || 'costs nothing to practice.'}` });
    }

    // === MEDIUM questions ===

    // Which has strongest scientific evidence?
    const byScience = practices.filter(p => p.science_rating > 0).sort((a, b) => b.science_rating - a.science_rating);
    if (byScience.length >= 4) {
      const correct = byScience[0];
      const wrong = _pickRandom(byScience.slice(3), 3);
      qs.push({ diff: 'medium', q: _t('quiz.q_strongest_evidence') || 'Which practice has the strongest scientific evidence?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.highest_evidence') || 'has the highest evidence rating of'} ${correct.science_rating}/5.` });
    }

    // Best for anxiety?
    const byAnxiety = practices.filter(p => p.best_for && p.best_for.includes('anxiety'))
      .sort((a, b) => ((b.benefits || {}).emotional || 0) - ((a.benefits || {}).emotional || 0));
    const notAnxiety = practices.filter(p => !p.best_for || !p.best_for.includes('anxiety'));
    if (byAnxiety.length >= 1 && notAnxiety.length >= 3) {
      const correct = byAnxiety[0];
      const wrong = _pickRandom(notAnxiety, 3);
      qs.push({ diff: 'medium', q: _t('quiz.q_anxiety') || 'Which practice is specifically recommended for anxiety?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.helps_anxiety') || 'is known to help with anxiety.'}` });
    }

    // Which originates from Stoicism?
    const stoic = practices.filter(p => p.origin === 'stoicism');
    const nonStoic = practices.filter(p => p.origin !== 'stoicism');
    if (stoic.length >= 1 && nonStoic.length >= 3) {
      const correct = _pickRandom(stoic, 1)[0];
      const wrong = _pickRandom(nonStoic, 3);
      qs.push({ diff: 'medium', q: _t('quiz.q_stoicism') || 'Which practice has roots in Stoic philosophy?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.from_stoicism') || 'draws from Stoic philosophical tradition.'}` });
    }

    // Most physical benefits?
    const byPhysical = practices.filter(p => p.benefits && p.benefits.physical > 0)
      .sort((a, b) => (b.benefits.physical || 0) - (a.benefits.physical || 0));
    if (byPhysical.length >= 4) {
      const correct = byPhysical[0];
      const wrong = _pickRandom(byPhysical.slice(3), 3);
      qs.push({ diff: 'medium', q: _t('quiz.q_physical') || 'Which practice offers the most physical benefits?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.top_physical') || 'has the highest physical benefit score of'} ${correct.benefits.physical}/5.` });
    }

    // Which is beginner-friendly?
    const beginners = practices.filter(p => p.difficulty === 1);
    const advanced = practices.filter(p => p.difficulty >= 4);
    if (beginners.length >= 1 && advanced.length >= 3) {
      const correct = _pickRandom(beginners, 1)[0];
      const wrong = _pickRandom(advanced, 3);
      qs.push({ diff: 'medium', q: _t('quiz.q_beginner') || 'Which practice is most beginner-friendly?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.is_beginner') || 'is rated as beginner level.'}` });
    }

    // Which can be done alone?
    const solo = practices.filter(p => p.solo_or_group && p.solo_or_group.includes('solo') && !p.solo_or_group.includes('group'));
    const groupOnly = practices.filter(p => p.solo_or_group && p.solo_or_group.includes('group') && !p.solo_or_group.includes('solo'));
    if (solo.length >= 1 && groupOnly.length >= 3) {
      const correct = _pickRandom(solo, 1)[0];
      const wrong = _pickRandom(groupOnly, 3);
      qs.push({ diff: 'medium', q: _t('quiz.q_solo') || 'Which practice is best suited for solo practice?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.is_solo') || 'is designed primarily for solo practice.'}` });
    }

    // Most social benefits?
    const bySocial = practices.filter(p => p.benefits && p.benefits.social > 0)
      .sort((a, b) => (b.benefits.social || 0) - (a.benefits.social || 0));
    if (bySocial.length >= 4) {
      const correct = bySocial[0];
      const wrong = _pickRandom(bySocial.slice(3), 3);
      qs.push({ diff: 'medium', q: _t('quiz.q_social') || 'Which practice has the strongest social benefits?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.top_social') || 'scores highest in social benefits with'} ${correct.benefits.social}/5.` });
    }

    // === HARD questions ===

    // Fun fact identification (sanitized)
    const withFacts = practices.filter(p => p.fun_facts && p.fun_facts.length > 0);
    if (withFacts.length >= 4) {
      const candidates = withFacts.filter(p => {
        const name = _practiceName(p).toLowerCase();
        const names = [name, p.id.replace(/_/g, ' ').replace(/-/g, ' ')];
        return p.fun_facts.some(f => !names.some(n => f.toLowerCase().includes(n)));
      });
      const pool = candidates.length >= 4 ? candidates : withFacts;
      const factPractice = _pickRandom(pool, 1)[0];
      const name = _practiceName(factPractice).toLowerCase();
      const safeNames = [name, factPractice.id.replace(/_/g, ' ').replace(/-/g, ' ')];
      let fact = factPractice.fun_facts.find(f => !safeNames.some(n => f.toLowerCase().includes(n)));
      if (!fact) {
        fact = factPractice.fun_facts[0];
        safeNames.forEach(n => { fact = fact.replace(new RegExp(n, 'gi'), 'this practice'); });
      }
      const wrong = _pickRandom(withFacts.filter(p => p.id !== factPractice.id), 3);
      qs.push({ diff: 'hard', q: `"${fact}" \u2014 ${_t('quiz.q_which_practice') || 'Which practice is this about?'}`, options: _shuffle([factPractice, ...wrong]), correct: factPractice.id, explanation: `${_t('quiz.fact_about') || 'This fact is about'} ${_practiceName(factPractice)}.` });
    }

    // Which practice has contraindications?
    const withContra = practices.filter(p => p.contraindications && p.contraindications.length > 0);
    const noContra = practices.filter(p => !p.contraindications || p.contraindications.length === 0);
    if (withContra.length >= 1 && noContra.length >= 3) {
      const correct = _pickRandom(withContra, 1)[0];
      const wrong = _pickRandom(noContra, 3);
      qs.push({ diff: 'hard', q: _t('quiz.q_contraindications') || 'Which of these practices has known contraindications?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.has_contra') || 'should be practiced with care due to contraindications.'}` });
    }

    // Which has the highest spiritual score?
    const bySpiritual = practices.filter(p => p.benefits && p.benefits.spiritual > 0)
      .sort((a, b) => (b.benefits.spiritual || 0) - (a.benefits.spiritual || 0));
    if (bySpiritual.length >= 4) {
      const correct = bySpiritual[0];
      const wrong = _pickRandom(bySpiritual.slice(3), 3);
      qs.push({ diff: 'hard', q: _t('quiz.q_spiritual') || 'Which practice scores highest in spiritual benefits?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.top_spiritual') || 'has a spiritual benefit score of'} ${correct.benefits.spiritual}/5.` });
    }

    // Which is the most challenging?
    const byDifficulty = practices.filter(p => p.difficulty > 0).sort((a, b) => b.difficulty - a.difficulty);
    if (byDifficulty.length >= 4) {
      const correct = byDifficulty[0];
      const wrong = _pickRandom(byDifficulty.filter(p => p.difficulty <= 3), 3);
      if (wrong.length >= 3) {
        qs.push({ diff: 'hard', q: _t('quiz.q_hardest') || 'Which is the most challenging practice?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.highest_difficulty') || 'has the highest difficulty rating of'} ${correct.difficulty}/5.` });
      }
    }

    // Which practice requires the most time?
    const byTime = practices.filter(p => p.time_commitment && p.time_commitment.recommended_minutes > 0)
      .sort((a, b) => (b.time_commitment.recommended_minutes || 0) - (a.time_commitment.recommended_minutes || 0));
    if (byTime.length >= 4) {
      const correct = byTime[0];
      const wrong = _pickRandom(byTime.slice(3), 3);
      qs.push({ diff: 'hard', q: _t('quiz.q_most_time') || 'Which practice requires the most daily time?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.needs_time') || 'recommends'} ${correct.time_commitment.recommended_minutes} ${_t('quiz.minutes_daily') || 'minutes daily.'}` });
    }

    // Which practice has highest mental benefit?
    const byMental = practices.filter(p => p.benefits && p.benefits.mental > 0)
      .sort((a, b) => (b.benefits.mental || 0) - (a.benefits.mental || 0));
    if (byMental.length >= 4) {
      const correct = byMental[0];
      const wrong = _pickRandom(byMental.slice(3), 3);
      qs.push({ diff: 'hard', q: _t('quiz.q_mental') || 'Which practice scores highest in mental clarity benefits?', options: _shuffle([correct, ...wrong]), correct: correct.id, explanation: `${_practiceName(correct)} ${_t('quiz.top_mental') || 'has a mental benefit score of'} ${correct.benefits.mental}/5.` });
    }

    // Filter by difficulty
    let filtered;
    if (difficulty === 'easy') {
      filtered = qs.filter(q => q.diff === 'easy');
    } else if (difficulty === 'hard') {
      filtered = qs.filter(q => q.diff === 'hard');
    } else {
      filtered = qs; // medium = mix of all
    }

    // If not enough questions, fill from all
    if (filtered.length < 10) {
      const extra = qs.filter(q => !filtered.includes(q));
      filtered = filtered.concat(_shuffle(extra));
    }

    return _shuffle(filtered).slice(0, 10);
  }

  function _pickRandom(arr, n) {
    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }

  function _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function render() {
    if (state === 'start') {
      el.innerHTML = `<div class="quiz-start-screen">
        ${_backLink()}
        <div class="quiz-icon">\uD83E\uDDD8</div>
        <h1>${_t('quiz.title')}</h1>
        <p>${_t('quiz.subtitle')}</p>
        <div class="quiz-difficulty">
          <p style="font-weight:600;margin-bottom:0.5rem;">${_t('quiz.difficulty') || 'Choose difficulty'}</p>
          <div class="quiz-diff-buttons">
            <button class="quiz-diff-btn${difficulty === 'easy' ? ' active' : ''}" data-diff="easy">\uD83C\uDF31 ${_t('quiz.easy') || 'Easy'}</button>
            <button class="quiz-diff-btn${difficulty === 'medium' ? ' active' : ''}" data-diff="medium">\uD83C\uDF3F ${_t('quiz.medium') || 'Medium'}</button>
            <button class="quiz-diff-btn${difficulty === 'hard' ? ' active' : ''}" data-diff="hard">\uD83C\uDF32 ${_t('quiz.hard') || 'Hard'}</button>
          </div>
        </div>
        <p style="color:var(--text-gray)">${_t('quiz.questions') || '10 questions'}</p>
        <button class="quiz-start-btn" id="quiz-start-btn">${_t('quiz.start')}</button>
      </div>`;
      el.querySelectorAll('.quiz-diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          difficulty = btn.dataset.diff;
          el.querySelectorAll('.quiz-diff-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
      document.getElementById('quiz-start-btn').addEventListener('click', () => {
        questions = generateQuestions();
        current = 0;
        score = 0;
        answered = false;
        state = 'play';
        render();
      });
    } else if (state === 'play') {
      const q = questions[current];
      if (!q) { state = 'results'; render(); return; }
      const pct = ((current) / questions.length) * 100;

      el.innerHTML = `<div class="quiz-play-screen">
        <div class="quiz-header">
          <span class="quiz-progress-text">${(_t('quiz.question_of') || 'Question {n} of {total}').replace('{n}', current + 1).replace('{total}', questions.length)}</span>
          <span class="quiz-score-display">${_t('quiz.score') || 'Score'}: ${score}</span>
        </div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
        <div class="quiz-question-text">${q.q}</div>
        <div class="quiz-options">
          ${q.options.map(p => `<button class="quiz-option-btn" data-id="${p.id}">${p.emoji || '\u2728'} ${_practiceName(p)}</button>`).join('')}
        </div>
        <div id="quiz-feedback"></div>
      </div>`;

      el.querySelectorAll('.quiz-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const chosen = btn.dataset.id;
          const isCorrect = chosen === q.correct;
          if (isCorrect) score++;

          el.querySelectorAll('.quiz-option-btn').forEach(b => {
            b.disabled = true;
            if (b.dataset.id === q.correct) b.classList.add('quiz-correct');
            if (b.dataset.id === chosen && !isCorrect) b.classList.add('quiz-wrong');
          });

          const fb = document.getElementById('quiz-feedback');
          fb.innerHTML = `<div class="quiz-feedback ${isCorrect ? 'quiz-feedback-correct' : 'quiz-feedback-wrong'}">
            ${isCorrect ? '\u2713 ' : '\u2717 '}${q.explanation}
          </div>
          <button class="quiz-next-btn" id="quiz-next">${current < questions.length - 1 ? (_t('quiz.next') || 'Next') : (_t('quiz.results') || 'Results')}</button>`;

          document.getElementById('quiz-next').addEventListener('click', () => {
            current++;
            answered = false;
            if (current >= questions.length) state = 'results';
            render();
          });
        });
      });
    } else if (state === 'results') {
      const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
      let emoji, msg;
      if (pct === 100) { emoji = '\uD83C\uDFC6'; msg = _t('quiz.perfect') || 'Perfect score! You are a well-being master!'; }
      else if (pct >= 70) { emoji = '\uD83C\uDF1F'; msg = _t('quiz.great') || 'Great job! You know your practices well!'; }
      else if (pct >= 40) { emoji = '\uD83D\uDC4D'; msg = _t('quiz.good') || 'Good effort! Keep exploring!'; }
      else { emoji = '\uD83E\uDDD8'; msg = _t('quiz.try_again') || 'Keep learning! Try again to improve your score.'; }

      const shareText = encodeURIComponent(`I scored ${score}/${questions.length} on the WellBeingBar Quiz! ${window.location.href}`);
      const shareUrl = encodeURIComponent(window.location.href);
      const tweetText = encodeURIComponent(`I scored ${score}/${questions.length} on the WellBeingBar Quiz!`);

      el.innerHTML = `<div class="quiz-results-screen">
        <div class="quiz-rating-emoji">${emoji}</div>
        <div class="quiz-score-big">${score}/${questions.length}</div>
        <div class="quiz-score-label">${_t('quiz.your_score') || 'Your Score'}</div>
        <div class="quiz-rating">${msg}</div>
        <div class="quiz-actions">
          <button class="quiz-play-again" id="quiz-again">${_t('quiz.play_again') || 'Play Again'}</button>
        </div>
        <div class="quiz-share-section">
          <div class="quiz-share-label">${_t('quiz.share') || 'Share your result'}</div>
          <div class="quiz-share-buttons">
            <button class="quiz-social-btn quiz-social-whatsapp" onclick="window.open('https://wa.me/?text=${shareText}','_blank')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.934 1.395 5.608L0 24l6.579-1.35A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.875 0-3.63-.51-5.13-1.395l-.36-.225-3.735.99.99-3.63-.24-.375A9.677 9.677 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>
            </button>
            <button class="quiz-social-btn quiz-social-x" onclick="window.open('https://x.com/intent/tweet?text=${tweetText}&url=${shareUrl}','_blank')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <button class="quiz-social-btn quiz-social-facebook" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${shareUrl}','_blank')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button class="quiz-social-btn quiz-social-linkedin" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}','_blank')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </button>
            <button class="quiz-social-btn quiz-social-telegram" onclick="window.open('https://t.me/share/url?url=${shareUrl}&text=${shareText}','_blank')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </button>
            <button class="quiz-social-btn quiz-social-copy" onclick="_copyLink(this,'${window.location.href}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
          </div>
        </div>
      </div>`;

      document.getElementById('quiz-again').addEventListener('click', () => {
        state = 'start';
        render();
      });
    }
  }
  render();
}


/* ==========================================================================
   DAILY COMPASS - Interactive practice recommender
   ========================================================================== */
function renderDailyCompass() {
  const el = document.getElementById('compass-content');
  if (!el) return;

  let step = 0;
  const totalSteps = 5;
  const answers = {
    feeling: '',
    time: '',
    location: '',
    need: '',
    social: ''
  };

  const feelings = [
    { id: 'stressed', icon: '\uD83D\uDE30', key: 'compass.feeling_stressed' },
    { id: 'low_energy', icon: '\uD83D\uDE34', key: 'compass.feeling_low_energy' },
    { id: 'anxious', icon: '\uD83D\uDE1F', key: 'compass.feeling_anxious' },
    { id: 'scattered', icon: '\uD83C\uDF00', key: 'compass.feeling_scattered' },
    { id: 'sad', icon: '\uD83D\uDE22', key: 'compass.feeling_sad' },
    { id: 'restless', icon: '\uD83D\uDE24', key: 'compass.feeling_restless' },
    { id: 'overwhelmed', icon: '\uD83E\uDD2F', key: 'compass.feeling_overwhelmed' },
    { id: 'content', icon: '\uD83D\uDE0A', key: 'compass.feeling_content' }
  ];

  const timeOptions = [
    { id: '5min', icon: '\u23F1', key: 'compass.time_5min', maxMin: 5 },
    { id: '15min', icon: '\u23F0', key: 'compass.time_15min', maxMin: 15 },
    { id: '30min', icon: '\uD83D\uDD52', key: 'compass.time_30min', maxMin: 30 },
    { id: '60min', icon: '\uD83D\uDD50', key: 'compass.time_60min', maxMin: 999 }
  ];

  const locations = [
    { id: 'home', icon: '\uD83C\uDFE0', key: 'compass.location_home' },
    { id: 'outdoors', icon: '\uD83C\uDF33', key: 'compass.location_outdoors' },
    { id: 'office', icon: '\uD83C\uDFE2', key: 'compass.location_office' },
    { id: 'commuting', icon: '\uD83D\uDE8C', key: 'compass.location_commuting' }
  ];

  const needs = [
    { id: 'calm', icon: '\uD83C\uDF0A', key: 'compass.need_calm' },
    { id: 'energy', icon: '\u26A1', key: 'compass.need_energy' },
    { id: 'clarity', icon: '\uD83D\uDCA1', key: 'compass.need_clarity' },
    { id: 'connection', icon: '\uD83D\uDC9C', key: 'compass.need_connection' },
    { id: 'meaning', icon: '\u2728', key: 'compass.need_meaning' },
    { id: 'healing', icon: '\uD83D\uDC9A', key: 'compass.need_healing' },
    { id: 'joy', icon: '\u2600\uFE0F', key: 'compass.need_joy' },
    { id: 'resilience', icon: '\uD83D\uDCAA', key: 'compass.need_resilience' }
  ];

  const socialOptions = [
    { id: 'alone', icon: '\uD83E\uDDD8', key: 'compass.social_alone' },
    { id: 'with_partner', icon: '\uD83D\uDC6B', key: 'compass.social_partner' },
    { id: 'with_group', icon: '\uD83D\uDC65', key: 'compass.social_group' }
  ];

  // Map needs and feelings to benefit dimensions and best_for tags
  const needToBenefit = {
    calm: 'emotional',
    energy: 'physical',
    clarity: 'mental',
    connection: 'social',
    meaning: 'spiritual',
    healing: 'emotional',
    joy: 'emotional',
    resilience: 'mental'
  };

  const feelingToBestFor = {
    stressed: ['stress', 'stress_relief', 'relaxation', 'calm'],
    low_energy: ['energy', 'vitality', 'motivation', 'focus'],
    anxious: ['anxiety', 'calm', 'grounding', 'relaxation'],
    scattered: ['focus', 'clarity', 'concentration', 'mindfulness'],
    sad: ['mood', 'joy', 'happiness', 'gratitude', 'connection'],
    restless: ['movement', 'energy', 'grounding', 'body', 'physical'],
    overwhelmed: ['stress', 'calm', 'simplicity', 'breathwork', 'grounding'],
    content: ['growth', 'purpose', 'meaning', 'spiritual']
  };

  const socialToMode = {
    alone: 'solo',
    with_partner: 'partner',
    with_group: 'group'
  };

  function _getRecommendations() {
    const practices = Data.getAllPractices();
    const timeChoice = timeOptions.find(t => t.id === answers.time);
    const maxMinutes = timeChoice ? timeChoice.maxMin : 999;
    const targetBenefit = needToBenefit[answers.need] || 'emotional';
    const targetBestFor = feelingToBestFor[answers.feeling] || [];
    const targetSocial = socialToMode[answers.social] || 'solo';
    const targetSetting = answers.location;

    // Filter practices
    let candidates = practices.filter(p => {
      // Time filter
      const minTime = p.time_commitment ? p.time_commitment.minimum_minutes : 0;
      if (minTime > maxMinutes) return false;
      return true;
    });

    // Score remaining practices
    const scored = candidates.map(p => {
      let score = 0;

      // Setting match
      if (p.settings && p.settings.includes(targetSetting)) score += 3;

      // Solo/group match
      if (p.solo_or_group && p.solo_or_group.includes(targetSocial)) score += 2;

      // Benefit dimension match
      if (p.benefits && p.benefits[targetBenefit]) score += p.benefits[targetBenefit];

      // Best-for tag match
      if (p.best_for) {
        const matches = p.best_for.filter(tag => targetBestFor.some(t => tag.includes(t) || t.includes(tag)));
        score += matches.length * 2;
      }

      // Prefer higher science rating
      score += (p.science_rating || 0) * 0.5;

      // Prefer easier practices slightly
      score += (6 - (p.difficulty || 3)) * 0.3;

      return { practice: p, score: score };
    });

    // Sort by score descending, return top 5
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5);
  }

  function render() {
    const progressPct = (step / totalSteps) * 100;

    // Progress indicator
    let progressHtml = `<div class="compass-progress">
      <div class="compass-progress-bar"><div class="compass-progress-fill" style="width:${progressPct}%"></div></div>
      <div class="compass-steps">
        ${[1, 2, 3, 4, 5].map(s => `<span class="compass-step ${s - 1 < step ? 'done' : ''} ${s - 1 === step ? 'active' : ''}">${s}</span>`).join('')}
      </div>
    </div>`;

    if (step === 0) {
      // Step 1: How are you feeling?
      el.innerHTML = `
        ${_backLink()}
        <h1 class="page-title">\uD83E\uDDD8 ${_t('compass.title') || 'Daily Compass'}</h1>
        <p class="page-intro">${_t('compass.subtitle') || 'Find the perfect practice for right now.'}</p>
        ${progressHtml}
        <div class="compass-question">
          <h2>${_t('compass.step1_title') || 'How are you feeling right now?'}</h2>
          <div class="compass-options">
            ${feelings.map(f => `<button class="compass-option-btn ${answers.feeling === f.id ? 'selected' : ''}" data-value="${f.id}">
              <span class="compass-option-icon">${f.icon}</span>
              <span class="compass-option-label">${_t(f.key) || f.id.replace(/_/g, ' ')}</span>
            </button>`).join('')}
          </div>
          <div class="compass-nav">
            <button class="compass-next-btn" id="compass-next" ${!answers.feeling ? 'disabled' : ''}>${_t('compass.next') || 'Next'} &rarr;</button>
          </div>
        </div>`;

      el.querySelectorAll('.compass-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          answers.feeling = btn.dataset.value;
          el.querySelectorAll('.compass-option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          document.getElementById('compass-next').disabled = false;
        });
      });
      document.getElementById('compass-next').addEventListener('click', () => { step = 1; render(); });

    } else if (step === 1) {
      // Step 2: How much time?
      el.innerHTML = `
        ${_backLink()}
        <h1 class="page-title">\uD83E\uDDD8 ${_t('compass.title') || 'Daily Compass'}</h1>
        ${progressHtml}
        <div class="compass-question">
          <h2>${_t('compass.step2_title') || 'How much time do you have?'}</h2>
          <div class="compass-options">
            ${timeOptions.map(t => `<button class="compass-option-btn ${answers.time === t.id ? 'selected' : ''}" data-value="${t.id}">
              <span class="compass-option-icon">${t.icon}</span>
              <span class="compass-option-label">${_t(t.key) || t.id}</span>
            </button>`).join('')}
          </div>
          <div class="compass-nav">
            <button class="compass-back-btn" id="compass-back">&larr; ${_t('compass.back') || 'Back'}</button>
            <button class="compass-next-btn" id="compass-next" ${!answers.time ? 'disabled' : ''}>${_t('compass.next') || 'Next'} &rarr;</button>
          </div>
        </div>`;

      el.querySelectorAll('.compass-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          answers.time = btn.dataset.value;
          el.querySelectorAll('.compass-option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          document.getElementById('compass-next').disabled = false;
        });
      });
      document.getElementById('compass-back').addEventListener('click', () => { step = 0; render(); });
      document.getElementById('compass-next').addEventListener('click', () => { step = 2; render(); });

    } else if (step === 2) {
      // Step 3: Where are you?
      el.innerHTML = `
        ${_backLink()}
        <h1 class="page-title">\uD83E\uDDD8 ${_t('compass.title') || 'Daily Compass'}</h1>
        ${progressHtml}
        <div class="compass-question">
          <h2>${_t('compass.step3_title') || 'Where are you right now?'}</h2>
          <div class="compass-options">
            ${locations.map(l => `<button class="compass-option-btn ${answers.location === l.id ? 'selected' : ''}" data-value="${l.id}">
              <span class="compass-option-icon">${l.icon}</span>
              <span class="compass-option-label">${_t(l.key) || l.id.replace(/_/g, ' ')}</span>
            </button>`).join('')}
          </div>
          <div class="compass-nav">
            <button class="compass-back-btn" id="compass-back">&larr; ${_t('compass.back') || 'Back'}</button>
            <button class="compass-next-btn" id="compass-next" ${!answers.location ? 'disabled' : ''}>${_t('compass.next') || 'Next'} &rarr;</button>
          </div>
        </div>`;

      el.querySelectorAll('.compass-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          answers.location = btn.dataset.value;
          el.querySelectorAll('.compass-option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          document.getElementById('compass-next').disabled = false;
        });
      });
      document.getElementById('compass-back').addEventListener('click', () => { step = 1; render(); });
      document.getElementById('compass-next').addEventListener('click', () => { step = 3; render(); });

    } else if (step === 3) {
      // Step 4: What do you need?
      el.innerHTML = `
        ${_backLink()}
        <h1 class="page-title">\uD83E\uDDD8 ${_t('compass.title') || 'Daily Compass'}</h1>
        ${progressHtml}
        <div class="compass-question">
          <h2>${_t('compass.step4_title') || 'What do you need most right now?'}</h2>
          <div class="compass-options">
            ${needs.map(n => `<button class="compass-option-btn ${answers.need === n.id ? 'selected' : ''}" data-value="${n.id}">
              <span class="compass-option-icon">${n.icon}</span>
              <span class="compass-option-label">${_t(n.key) || n.id.replace(/_/g, ' ')}</span>
            </button>`).join('')}
          </div>
          <div class="compass-nav">
            <button class="compass-back-btn" id="compass-back">&larr; ${_t('compass.back') || 'Back'}</button>
            <button class="compass-next-btn" id="compass-next" ${!answers.need ? 'disabled' : ''}>${_t('compass.next') || 'Next'} &rarr;</button>
          </div>
        </div>`;

      el.querySelectorAll('.compass-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          answers.need = btn.dataset.value;
          el.querySelectorAll('.compass-option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          document.getElementById('compass-next').disabled = false;
        });
      });
      document.getElementById('compass-back').addEventListener('click', () => { step = 2; render(); });
      document.getElementById('compass-next').addEventListener('click', () => { step = 4; render(); });

    } else if (step === 4) {
      // Step 5: Alone or with others?
      el.innerHTML = `
        ${_backLink()}
        <h1 class="page-title">\uD83E\uDDD8 ${_t('compass.title') || 'Daily Compass'}</h1>
        ${progressHtml}
        <div class="compass-question">
          <h2>${_t('compass.step5_title') || 'Alone or with others?'}</h2>
          <div class="compass-options">
            ${socialOptions.map(s => `<button class="compass-option-btn ${answers.social === s.id ? 'selected' : ''}" data-value="${s.id}">
              <span class="compass-option-icon">${s.icon}</span>
              <span class="compass-option-label">${_t(s.key) || s.id.replace(/_/g, ' ')}</span>
            </button>`).join('')}
          </div>
          <div class="compass-nav">
            <button class="compass-back-btn" id="compass-back">&larr; ${_t('compass.back') || 'Back'}</button>
            <button class="compass-next-btn" id="compass-next" ${!answers.social ? 'disabled' : ''}>${_t('compass.show_results') || 'Show My Practices'} &rarr;</button>
          </div>
        </div>`;

      el.querySelectorAll('.compass-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          answers.social = btn.dataset.value;
          el.querySelectorAll('.compass-option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          document.getElementById('compass-next').disabled = false;
        });
      });
      document.getElementById('compass-back').addEventListener('click', () => { step = 3; render(); });
      document.getElementById('compass-next').addEventListener('click', () => { step = 5; render(); });

    } else if (step === 5) {
      // Results
      const recommendations = _getRecommendations();

      // Summary of choices
      const feelingChoice = feelings.find(f => f.id === answers.feeling);
      const timeChoice = timeOptions.find(t => t.id === answers.time);
      const locationChoice = locations.find(l => l.id === answers.location);
      const needChoice = needs.find(n => n.id === answers.need);
      const socialChoice = socialOptions.find(s => s.id === answers.social);

      const feelingDesc = _t('compass.results_feeling_' + answers.feeling) || '';

      el.innerHTML = `
        ${_backLink()}
        <h1 class="page-title">\uD83E\uDDD8 ${_t('compass.results_title') || 'Your Personalized Practices'}</h1>
        <p class="page-intro">${_t('compass.results_desc') || 'Based on how you feel, what you need, and the time you have — we\'ve selected practices that fit you best right now.'}</p>
        ${feelingDesc ? `<div class="compass-feeling-note">${feelingChoice ? feelingChoice.icon : ''} ${feelingDesc}</div>` : ''}

        <div class="compass-summary">
          <div class="compass-summary-item">${feelingChoice ? feelingChoice.icon : ''} ${_t(feelingChoice ? feelingChoice.key : '') || answers.feeling}</div>
          <div class="compass-summary-item">${timeChoice ? timeChoice.icon : ''} ${_t(timeChoice ? timeChoice.key : '') || answers.time}</div>
          <div class="compass-summary-item">${locationChoice ? locationChoice.icon : ''} ${_t(locationChoice ? locationChoice.key : '') || answers.location}</div>
          <div class="compass-summary-item">${needChoice ? needChoice.icon : ''} ${_t(needChoice ? needChoice.key : '') || answers.need}</div>
          <div class="compass-summary-item">${socialChoice ? socialChoice.icon : ''} ${_t(socialChoice ? socialChoice.key : '') || answers.social}</div>
        </div>

        ${recommendations.length > 0 ? `
          <div class="compass-results">
            ${recommendations.map((rec, idx) => {
              const p = rec.practice;
              const name = _practiceName(p);
              const emoji = p.emoji || '\u2728';
              const catColor = _categoryColor(p.category);
              const dims = ['emotional', 'physical', 'mental', 'social', 'spiritual'];
              const benefits = p.benefits || {};
              const timeMin = p.time_commitment ? p.time_commitment.minimum_minutes : 0;
              const timeMax = p.time_commitment ? p.time_commitment.maximum_minutes : 0;
              const timeStr = timeMin === timeMax ? `${timeMin} min` : `${timeMin}-${timeMax} min`;
              const matchPct = Math.round((rec.score / 20) * 100);
              const matchLabel = matchPct > 80 ? (_t('compass.excellent_match') || 'Excellent match') :
                                 matchPct > 50 ? (_t('compass.good_match') || 'Good match') :
                                 (_t('compass.possible_match') || 'Worth trying');

              return `<div class="compass-result-card" style="border-left-color:${catColor}">
                <div class="compass-result-rank">${idx === 0 ? (_t('compass.best_match') || 'Best Match') : (_t('compass.match') || 'Match') + ' #' + (idx + 1)}</div>
                <a href="practice-detail.html?id=${p.id}" class="compass-result-link">
                  <div class="compass-result-header">
                    <span class="compass-result-emoji">${emoji}</span>
                    <div>
                      <span class="compass-result-name">${name}</span>
                      <div class="compass-result-badges">
                        ${_difficultyBadge(p.difficulty)}
                        ${_scienceBadge(p.science_rating)}
                      </div>
                    </div>
                  </div>
                  <div class="compass-result-match">
                    <span class="compass-match-label">${matchLabel}</span>
                  </div>
                  <div class="compass-result-meta">
                    <span>\u23F1 ${timeStr}</span>
                    <span>\uD83C\uDFAF ${_t('difficulty.' + Data.getDifficultyLabel(p.difficulty))}</span>
                  </div>
                  <div class="compass-result-benefits">
                    ${dims.map(d => {
                      const val = benefits[d] || 0;
                      const pct = (val / 5) * 100;
                      const bInfo = Data.getBenefits()[d] || {};
                      return `<div class="mini-bar" title="${_t(bInfo.name_key || ('benefit.' + d))}: ${val}/5">
                        <div class="mini-bar-fill" style="width:${pct}%;background:${bInfo.color || '#7E57C2'}"></div>
                      </div>`;
                    }).join('')}
                  </div>
                </a>
              </div>`;
            }).join('')}
          </div>
        ` : `<div class="compass-no-results">
          <p>${_t('compass.no_results') || 'No perfect matches found. Try adjusting your preferences.'}</p>
        </div>`}

        <div class="compass-nav" style="margin-top:2rem;">
          <button class="compass-back-btn" id="compass-restart">\u21BA ${_t('compass.start_over') || 'Start Over'}</button>
        </div>
        ${_shareBarHtml('share-bar-compass')}
      `;

      _shareBar('share-bar-compass');

      document.getElementById('compass-restart').addEventListener('click', () => {
        step = 0;
        answers.feeling = '';
        answers.time = '';
        answers.location = '';
        answers.need = '';
        answers.social = '';
        render();
      });
    }
  }
  render();
}


/* ==========================================================================
   TEACHERS PAGE
   ========================================================================== */
function renderTeachers() {
  const container = document.getElementById('teachers-content');
  if (!container) return;

  const teachers = Data.getTeachers();
  const modern = teachers.filter(t => t.category === 'modern');
  const ancient = teachers.filter(t => t.category === 'ancient');

  function renderTeacherCards(list) {
    return list.map(t => `
      <div class="teacher-card">
        <div class="teacher-header">
          <span class="teacher-emoji">${t.emoji}</span>
          <div class="teacher-name-block">
            <h3 class="teacher-name">${t.name}</h3>
            <span class="teacher-years">${t.years}</span>
            <span class="teacher-origin">${t.origin}</span>
          </div>
        </div>
        <div class="teacher-tradition">${t.tradition}</div>
        <blockquote class="teacher-quote">\u201C${t.quote}\u201D</blockquote>
        <div class="teacher-ideas">
          <h4>${_t('teachers.main_ideas')}</h4>
          <ul>${t.main_ideas.map(i => '<li>' + i + '</li>').join('')}</ul>
        </div>
        <div class="teacher-works">
          <h4>${_t('teachers.key_works')}</h4>
          <p>${t.key_works.join(' \u00B7 ')}</p>
        </div>
        <div class="teacher-relevance">
          <p>${t.relevance}</p>
        </div>
      </div>
    `).join('');
  }

  container.innerHTML = `
    ${_backLink()}
    <h1>${_t('teachers.title')}</h1>
    <p class="page-subtitle">${_t('teachers.subtitle')}</p>

    <section class="teachers-section">
      <h2>${_t('teachers.modern_title')}</h2>
      <p class="section-desc">${_t('teachers.modern_subtitle')}</p>
      <div class="teachers-grid">${renderTeacherCards(modern)}</div>
    </section>

    <section class="teachers-section">
      <h2>${_t('teachers.ancient_title')}</h2>
      <p class="section-desc">${_t('teachers.ancient_subtitle')}</p>
      <div class="teachers-grid">${renderTeacherCards(ancient)}</div>
    </section>
  `;
}


/* ==========================================================================
   PRINCIPLES PAGE — Guidelines for a Fulfilled Life
   ========================================================================== */
function renderPrinciples() {
  const container = document.getElementById('principles-content');
  if (!container) return;

  const principles = [
    { emoji: '\uD83D\uDC9B', key: 'kindness', color: '#F9A825' },
    { emoji: '\uD83D\uDE4F', key: 'gratitude', color: '#4A148C' },
    { emoji: '\uD83E\uDDD8', key: 'presence', color: '#1565C0' },
    { emoji: '\uD83C\uDF31', key: 'growth', color: '#2E7D32' },
    { emoji: '\uD83E\uDD1D', key: 'service', color: '#C62828' },
    { emoji: '\u2696\uFE0F', key: 'balance', color: '#00695C' },
    { emoji: '\uD83D\uDD25', key: 'purpose', color: '#E65100' },
    { emoji: '\uD83D\uDD4A\uFE0F', key: 'forgiveness', color: '#7E57C2' },
    { emoji: '\uD83C\uDF0A', key: 'acceptance', color: '#0277BD' },
    { emoji: '\u2728', key: 'integrity', color: '#6A1B9A' },
    { emoji: '\uD83D\uDCAA', key: 'resilience', color: '#AD1457' },
    { emoji: '\uD83C\uDF0D', key: 'connection', color: '#00838F' }
  ];

  container.innerHTML =
    _backLink() +
    '<h1>' + _t('principles.title') + '</h1>' +
    '<p class="page-subtitle">' + _t('principles.subtitle') + '</p>' +
    '<div class="principles-intro">' +
      '<p>' + _t('principles.intro_p1') + '</p>' +
      '<p>' + _t('principles.intro_p2') + '</p>' +
    '</div>' +
    '<div class="principles-grid">' +
      principles.map(function(p) {
        return '<div class="principle-card" style="border-top: 4px solid ' + p.color + '">' +
          '<div class="principle-emoji">' + p.emoji + '</div>' +
          '<h3 class="principle-name">' + _t('principles.' + p.key + '.title') + '</h3>' +
          '<p class="principle-desc">' + _t('principles.' + p.key + '.text') + '</p>' +
          '<blockquote class="principle-quote">' + _t('principles.' + p.key + '.quote') + '</blockquote>' +
        '</div>';
      }).join('') +
    '</div>' +
    '<div class="principles-closing">' +
      '<h2>' + _t('principles.closing_title') + '</h2>' +
      '<p>' + _t('principles.closing_text') + '</p>' +
    '</div>';
}


/* ==========================================================================
   PARABLES & WISDOM STORIES PAGE
   ========================================================================== */
function renderParables() {
  var container = document.getElementById('parables-content');
  if (!container) return;

  var parables = Data.getParables();

  var themeColors = {
    'character': '#4A148C', 'choice': '#1565C0', 'perspective': '#00695C',
    'compassion': '#C62828', 'acceptance': '#0277BD', 'self-acceptance': '#6A1B9A',
    'humility': '#2E7D32', 'contentment': '#E65100', 'resilience': '#AD1457',
    'responsibility': '#F9A825', 'honesty': '#00838F', 'letting-go': '#7E57C2',
    'courage': '#D84315', 'self-discovery': '#4A148C', 'transformation': '#1B5E20',
    'service': '#C62828', 'patience': '#2E7D32', 'mindfulness': '#1565C0',
    'action': '#E65100'
  };

  container.innerHTML =
    _backLink() +
    '<h1>' + _t('parables.title') + '</h1>' +
    '<p class="page-subtitle">' + _t('parables.subtitle') + '</p>' +
    '<div class="parables-grid">' +
      parables.map(function(p) {
        var color = themeColors[p.theme] || '#4A148C';
        return '<div class="parable-card" style="border-top: 4px solid ' + color + '">' +
          '<div class="parable-header">' +
            '<span class="parable-emoji">' + p.emoji + '</span>' +
            '<div>' +
              '<h3 class="parable-title">' + p.title + '</h3>' +
              '<span class="parable-origin">' + p.origin + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="parable-story"><p>' + p.story + '</p></div>' +
          '<div class="parable-meaning">' +
            '<h4>' + _t('parables.meaning') + '</h4>' +
            '<p>' + p.meaning + '</p>' +
          '</div>' +
          '<div class="parable-lesson">' +
            '<span class="parable-theme" style="background:' + color + '">' + p.theme.replace('-', ' ') + '</span>' +
            '<p>' + p.lesson + '</p>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
}


/* ==========================================================================
   MEDICINAL PLANTS
   ========================================================================== */

function _plantCategoryIcon(catId) {
  var icons = {
    'digestive': '\uD83E\uDEDA',
    'anti-inflammatory': '\uD83D\uDD25',
    'calming': '\uD83C\uDF19',
    'immune': '\uD83D\uDEE1\uFE0F',
    'pain-relief': '\uD83D\uDC8A',
    'skin': '\uD83C\uDF38'
  };
  return icons[catId] || '\uD83C\uDF3F';
}

function _plantCategoryColor(catId) {
  var colors = {
    'digestive': '#2E7D32',
    'anti-inflammatory': '#E65100',
    'calming': '#1565C0',
    'immune': '#00695C',
    'pain-relief': '#C62828',
    'skin': '#6A1B9A'
  };
  return colors[catId] || '#4A148C';
}

function _plantCategoryName(catId) {
  var key = 'plants.cat.' + catId.replace(/-/g, '_');
  return _t(key) || catId.replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
}

function _plantName(plant) {
  if (plant.name) {
    var lang = I18n.getLang();
    return plant.name[lang] || plant.name['en'] || plant.id;
  }
  return plant.id;
}

function _plantCardHtml(plant) {
  var name = _plantName(plant);
  var emoji = plant.emoji || '\uD83C\uDF3F';
  var catColor = _plantCategoryColor(plant.category);
  var benefits = plant.benefits || {};
  var dims = ['emotional', 'physical', 'mental', 'social', 'spiritual'];
  var benefitPreview = dims.map(function(d) {
    var val = benefits[d] || 0;
    var pct = (val / 5) * 100;
    var bInfo = Data.getBenefits()[d] || {};
    return '<div class="mini-bar" title="' + (_t(bInfo.name_key || ('benefit.' + d))) + ': ' + val + '/5">' +
      '<div class="mini-bar-fill" style="width:' + pct + '%;background:' + (bInfo.color || '#7E57C2') + '"></div>' +
    '</div>';
  }).join('');

  var lang = I18n.getLang();
  var uses = plant.medicinal_uses ? (plant.medicinal_uses[lang] || plant.medicinal_uses['en'] || []) : [];
  var usesHtml = uses.slice(0, 3).map(function(u) {
    return '<span class="plant-use-chip">' + u + '</span>';
  }).join('');

  var imageHtml = plant.image_url
    ? '<div class="plant-card-img"><img src="' + plant.image_url + '" alt="' + name + '" loading="lazy"></div>'
    : '';

  return '<a href="plant-detail.html?id=' + plant.id + '" class="card plant-card" style="border-left-color:' + catColor + '">' +
    imageHtml +
    '<div class="plant-card-body">' +
      '<div class="practice-card-header">' +
        '<span class="card-icon">' + emoji + '</span>' +
        '<span class="card-title">' + name + '</span>' +
      '</div>' +
      '<p class="plant-scientific-name">' + (plant.scientific_name || '') + '</p>' +
      '<div class="practice-card-badges">' +
        '<span class="category-badge" style="background:' + catColor + ';color:#fff">' + _plantCategoryIcon(plant.category) + ' ' + _plantCategoryName(plant.category) + '</span>' +
        _scienceBadge(plant.science_rating) +
      '</div>' +
      (usesHtml ? '<div class="plant-uses-row">' + usesHtml + '</div>' : '') +
      '<div class="practice-card-benefits">' + benefitPreview + '</div>' +
      '<span class="card-link" style="color:' + catColor + '">' + (_t('detail.view') || 'View details') + ' &rarr;</span>' +
    '</div>' +
  '</a>';
}

function renderMedicinalPlants() {
  var el = document.getElementById('plants-content');
  if (!el) return;

  var plants = Data.getMedicinalPlants();
  var categories = Data.getMedicinalPlantCategories();
  var activeCat = '';

  function render() {
    var filtered = activeCat
      ? plants.filter(function(p) { return p.category === activeCat; })
      : plants;

    el.innerHTML =
      _backLink() +
      '<h1 class="page-title">\uD83C\uDF3F ' + (_t('plants.title') || 'Medicinal Plants') + '</h1>' +
      '<p class="page-intro">' + (_t('plants.subtitle') || 'Healing herbs and plants from traditional medicine around the world.') + '</p>' +
      '<div class="pillar-tabs">' +
        '<button class="pillar-tab ' + (!activeCat ? 'active' : '') + '" data-cat="" style="' + (!activeCat ? 'background:var(--wb-primary);border-color:var(--wb-primary)' : '') + '">' + (_t('plants.filter.all') || 'All Plants') + '</button>' +
        categories.map(function(cat) {
          var color = _plantCategoryColor(cat);
          return '<button class="pillar-tab ' + (activeCat === cat ? 'active' : '') + '" data-cat="' + cat + '" style="' + (activeCat === cat ? 'background:' + color + ';border-color:' + color : '') + '">' + _plantCategoryIcon(cat) + ' ' + _plantCategoryName(cat) + '</button>';
        }).join('') +
      '</div>' +
      '<p style="color:var(--text-gray);margin-bottom:1rem"><strong>' + filtered.length + '</strong> ' + (_t('plants.count_label') || 'medicinal plants') + '</p>' +
      '<div class="cards-grid grid-3x2">' +
        filtered.map(function(p) { return _plantCardHtml(p); }).join('') +
      '</div>' +
      _shareBarHtml('share-bar-plants');

    _shareBar('share-bar-plants');

    el.querySelectorAll('.pillar-tab').forEach(function(btn) {
      btn.addEventListener('click', function() {
        activeCat = btn.dataset.cat;
        render();
      });
    });
  }
  render();
}

function renderPlantDetail() {
  var el = document.getElementById('plant-detail-content');
  if (!el) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  if (!id) {
    var allPlants = Data.getMedicinalPlants();
    var lang = I18n.getLang();
    var sorted = allPlants.map(function(p) { return { plant: p, name: _plantName(p) }; })
      .sort(function(a, b) { return a.name.localeCompare(b.name, lang); });
    el.innerHTML =
      _backLink() +
      '<h1 class="page-title">' + (_t('plants.title') || 'Medicinal Plants') + '</h1>' +
      '<div class="food-browse-grid">' +
        sorted.map(function(item) {
          var p = item.plant;
          return '<a href="plant-detail.html?id=' + p.id + '" class="card food-browse-card">' +
            '<span class="food-browse-icon">' + (p.emoji || '\uD83C\uDF3F') + '</span>' +
            '<span class="food-browse-name">' + item.name + '</span>' +
            '<div style="margin-top:0.25rem">' + _scienceBadge(p.science_rating) + '</div>' +
          '</a>';
        }).join('') +
      '</div>';
    return;
  }

  var plant = Data.getMedicinalPlant(id);
  if (!plant) {
    el.innerHTML = _backLink() + '<div class="not-found">' + (_t('error.plant_not_found') || 'Plant not found.') + '</div>';
    return;
  }

  var name = _plantName(plant);
  var emoji = plant.emoji || '\uD83C\uDF3F';
  var catColor = _plantCategoryColor(plant.category);
  var benefits = plant.benefits || {};
  var dims = ['emotional', 'physical', 'mental', 'social', 'spiritual'];
  var lang = I18n.getLang();

  var sciSummary = plant.science_summary ? (plant.science_summary[lang] || plant.science_summary['en'] || '') : '';
  var uses = plant.medicinal_uses ? (plant.medicinal_uses[lang] || plant.medicinal_uses['en'] || []) : [];
  var prep = plant.preparation_methods ? (plant.preparation_methods[lang] || plant.preparation_methods['en'] || []) : [];
  var dosage = plant.dosage ? (plant.dosage[lang] || plant.dosage['en'] || '') : '';
  var contras = plant.contraindications ? (plant.contraindications[lang] || plant.contraindications['en'] || []) : [];

  // Image + origin side by side
  var imageHtml = plant.image_url
    ? '<div class="plant-detail-image"><img src="' + plant.image_url + '" alt="' + name + '"></div>'
    : '';

  // Origin cards - each region gets a mini world map + shape outline
  var originCardsHtml = '';
  if (plant.origin_regions && plant.origin_regions.length) {
    originCardsHtml = '<div class="plant-origin-section">' +
      '<h3>\uD83C\uDF0D ' + (_t('plants.detail.origin') || 'Origin Regions') + '</h3>' +
      '<div class="plant-origin-cards">' +
        plant.origin_regions.map(function(r) {
          return _renderOriginCard(r, catColor);
        }).join('') +
      '</div>' +
    '</div>';
  }

  // Related plants
  var relatedHtml = '';
  if (plant.related_plants && plant.related_plants.length) {
    var relatedPlants = plant.related_plants.map(function(rid) { return Data.getMedicinalPlant(rid); }).filter(Boolean);
    if (relatedPlants.length) {
      relatedHtml = '<div class="content-section">' +
        '<h2>\uD83C\uDF3F ' + (_t('plants.detail.related') || 'Related Plants') + '</h2>' +
        '<div class="cards-grid grid-3x2">' +
          relatedPlants.map(function(rp) { return _plantCardHtml(rp); }).join('') +
        '</div>' +
      '</div>';
    }
  }

  el.innerHTML =
    '<div class="back-link-row"><a href="medicinal-plants.html" class="back-link">&larr; ' + (_t('plants.detail.back') || 'Back to all plants') + '</a></div>' +

    '<div class="plant-detail-top">' +
      '<div class="plant-detail-visual">' +
        imageHtml +
        originCardsHtml +
      '</div>' +
      '<div class="plant-detail-info">' +
        '<h1 class="page-title">' + emoji + ' ' + name + '</h1>' +
        '<p class="plant-scientific-name-lg"><em>' + (plant.scientific_name || '') + '</em></p>' +
        '<div class="practice-tags-row">' +
          '<span class="category-badge" style="background:' + catColor + ';color:#fff">' + _plantCategoryIcon(plant.category) + ' ' + _plantCategoryName(plant.category) + '</span>' +
          _scienceBadge(plant.science_rating) +
        '</div>' +
        (plant.plant_family ? '<p style="margin-top:0.5rem;color:var(--text-gray)"><strong>' + (_t('plants.detail.family') || 'Family') + ':</strong> ' + plant.plant_family + '</p>' : '') +
      '</div>' +
    '</div>' +

    '<div class="content-section">' +
      '<h2>\uD83C\uDF3F ' + (_t('plants.detail.compounds') || 'Active Compounds') + '</h2>' +
      '<div class="age-benefit-chips">' +
        (plant.active_compounds || []).map(function(c) {
          return '<span class="food-chip">' + c + '</span>';
        }).join('') +
      '</div>' +
    '</div>' +

    (plant.traditional_systems && plant.traditional_systems.length ? '<div class="content-section">' +
      '<h2>\uD83D\uDCDC ' + (_t('plants.detail.traditions') || 'Traditional Systems') + '</h2>' +
      '<div class="age-benefit-chips">' +
        plant.traditional_systems.map(function(t) {
          return '<span class="food-chip" style="background:var(--wb-light);color:#fff">' + t + '</span>';
        }).join('') +
      '</div>' +
    '</div>' : '') +

    '<div class="content-section">' +
      '<h2>\uD83D\uDC8A ' + (_t('plants.detail.uses') || 'Medicinal Uses') + '</h2>' +
      '<ul class="plant-uses-list">' +
        uses.map(function(u) { return '<li>' + u + '</li>'; }).join('') +
      '</ul>' +
    '</div>' +

    '<div class="content-section">' +
      '<h2>\uD83C\uDF75 ' + (_t('plants.detail.preparation') || 'Preparation Methods') + '</h2>' +
      '<ul class="plant-uses-list">' +
        prep.map(function(p) { return '<li>' + p + '</li>'; }).join('') +
      '</ul>' +
    '</div>' +

    (dosage ? '<div class="content-section">' +
      '<h2>\uD83D\uDCCF ' + (_t('plants.detail.dosage') || 'Recommended Dosage') + '</h2>' +
      '<p class="plant-dosage-box">' + dosage + '</p>' +
    '</div>' : '') +

    '<div class="content-section">' +
      '<h2>' + (_t('detail.benefits') || 'Benefits') + '</h2>' +
      '<div class="benefits-bars">' +
        dims.map(function(d) { return _benefitBarHtml(d, benefits[d] || 0); }).join('') +
      '</div>' +
    '</div>' +

    '<div class="content-section">' +
      '<h2>\uD83D\uDD2C ' + (_t('plants.detail.science') || 'Scientific Evidence') + '</h2>' +
      _statBar(_t('detail.evidence_level') || 'Evidence Level', plant.science_rating || 0, 5, '/5', Data.getScienceColor(plant.science_rating)) +
      (sciSummary ? '<p style="margin-top:1rem">' + sciSummary + '</p>' : '') +
      (plant.key_studies && plant.key_studies.length ? '<div style="margin-top:1rem">' +
        '<h3>' + (_t('plants.detail.studies') || 'Key Studies') + '</h3>' +
        '<ul class="studies-list">' +
          plant.key_studies.map(function(s) { return '<li>' + s + '</li>'; }).join('') +
        '</ul>' +
      '</div>' : '') +
    '</div>' +

    (contras.length ? '<div class="content-section plant-warning-box">' +
      '<h2>\u26A0\uFE0F ' + (_t('plants.detail.contraindications') || 'Contraindications') + '</h2>' +
      '<ul>' +
        contras.map(function(c) { return '<li>' + c + '</li>'; }).join('') +
      '</ul>' +
    '</div>' : '') +

    (plant.fun_facts && plant.fun_facts.length ? '<div class="content-section">' +
      '<h2>\uD83D\uDCA1 ' + (_t('plants.detail.fun_facts') || 'Did You Know?') + '</h2>' +
      '<ul class="fun-facts-list">' +
        plant.fun_facts.map(function(f) { return '<li>' + f + '</li>'; }).join('') +
      '</ul>' +
    '</div>' : '') +

    relatedHtml +

    _shareBarHtml('share-bar-plant-detail');

  _shareBar('share-bar-plant-detail');

}

// World map base paths for mini maps
var _worldMapBase =
  '<rect width="100" height="70" fill="#E8F5E9" rx="3"/>' +
  '<path d="M10,18 L14,15 L20,14 L26,16 L28,20 L30,26 L28,32 L24,36 L20,38 L18,42 L16,40 L14,34 L10,28 Z" fill="#C8E6C9"/>' +
  '<path d="M24,44 L28,42 L32,44 L34,48 L33,54 L30,60 L26,64 L24,60 L22,54 L22,48 Z" fill="#C8E6C9"/>' +
  '<path d="M44,16 L48,14 L52,15 L56,18 L54,22 L52,26 L48,28 L44,26 L42,22 L42,18 Z" fill="#C8E6C9"/>' +
  '<path d="M44,32 L48,30 L54,32 L58,36 L60,42 L58,50 L54,56 L50,60 L46,58 L44,52 L42,46 L42,38 Z" fill="#C8E6C9"/>' +
  '<path d="M56,14 L62,12 L70,14 L78,16 L82,20 L84,26 L82,32 L78,36 L72,38 L66,40 L60,38 L58,34 L56,28 L54,22 Z" fill="#C8E6C9"/>' +
  '<path d="M64,38 L68,36 L74,38 L80,42 L78,48 L74,50 L70,48 L66,44 Z" fill="#C8E6C9"/>' +
  '<path d="M76,54 L82,52 L88,54 L90,58 L88,62 L84,64 L78,62 L76,58 Z" fill="#C8E6C9"/>';

var _regionCoords = {
  'South Asia': { cx: 68, cy: 40 },
  'Southeast Asia': { cx: 75, cy: 45 },
  'East Asia': { cx: 78, cy: 35 },
  'Central Asia': { cx: 65, cy: 32 },
  'West Asia': { cx: 58, cy: 36 },
  'Western Asia': { cx: 58, cy: 36 },
  'Middle East': { cx: 57, cy: 38 },
  'North Africa': { cx: 50, cy: 40 },
  'Northwest Africa': { cx: 44, cy: 38 },
  'East Africa': { cx: 55, cy: 52 },
  'West Africa': { cx: 45, cy: 48 },
  'South Africa': { cx: 53, cy: 62 },
  'Southern Africa': { cx: 53, cy: 60 },
  'Sub-Saharan Africa': { cx: 52, cy: 55 },
  'Africa': { cx: 52, cy: 50 },
  'Europe': { cx: 50, cy: 26 },
  'Northern Europe': { cx: 50, cy: 20 },
  'Central Europe': { cx: 50, cy: 26 },
  'Southern Europe': { cx: 50, cy: 30 },
  'Mediterranean': { cx: 50, cy: 32 },
  'North America': { cx: 22, cy: 28 },
  'Eastern North America': { cx: 26, cy: 30 },
  'Central America': { cx: 20, cy: 42 },
  'South America': { cx: 28, cy: 55 },
  'Amazon': { cx: 28, cy: 50 },
  'Australia': { cx: 82, cy: 60 },
  'Oceania': { cx: 85, cy: 56 },
  'Pacific Islands': { cx: 88, cy: 48 },
  'India': { cx: 68, cy: 40 },
  'Indian subcontinent': { cx: 67, cy: 40 },
  'China': { cx: 76, cy: 32 },
  'Japan': { cx: 82, cy: 30 },
  'Korea': { cx: 80, cy: 32 },
  'Indonesia': { cx: 78, cy: 50 },
  'Malaysia': { cx: 76, cy: 46 },
  'Thailand': { cx: 73, cy: 42 },
  'Myanmar': { cx: 71, cy: 40 },
  'Sri Lanka': { cx: 70, cy: 46 },
  'Mongolia': { cx: 74, cy: 28 },
  'Himalayas': { cx: 70, cy: 36 },
  'Siberia': { cx: 72, cy: 18 },
  'Northern Asia': { cx: 70, cy: 20 },
  'Arabian Peninsula': { cx: 58, cy: 42 },
  'Madagascar': { cx: 58, cy: 58 },
  'Papua New Guinea': { cx: 84, cy: 50 },
  'Maluku Islands (Indonesia)': { cx: 80, cy: 48 },
  'Zanzibar': { cx: 56, cy: 52 },
  'Worldwide': { cx: 50, cy: 35 },
  'Global': { cx: 50, cy: 35 },
  'Tropical regions': { cx: 50, cy: 45 },
  'Temperate regions': { cx: 50, cy: 30 }
};

function _renderOriginCard(regionName, catColor) {
  var coord = _regionCoords[regionName];
  var cx = coord ? coord.cx : 50;
  var cy = coord ? coord.cy : 35;

  // Mini world map with pin
  var miniMap = '<svg viewBox="0 0 100 70" class="origin-mini-map">' +
    _worldMapBase +
    '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + catColor + '" opacity="0.25"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="2.5" fill="' + catColor + '" stroke="#fff" stroke-width="0.8"/>' +
  '</svg>';

  // Region shape outline
  var shapePath = (typeof _regionShapes !== 'undefined') ? _regionShapes[regionName] : null;
  var shapeHtml = '';
  if (shapePath) {
    shapeHtml = '<svg viewBox="0 0 50 50" class="origin-region-shape">' +
      '<path d="' + shapePath + '" fill="' + catColor + '" opacity="0.7" stroke="' + catColor + '" stroke-width="0.5"/>' +
    '</svg>';
  }

  return '<div class="origin-card">' +
    '<div class="origin-card-visuals">' +
      miniMap +
      shapeHtml +
    '</div>' +
    '<span class="origin-card-label">' + regionName + '</span>' +
  '</div>';
}
