/* Leonida Trophy Guide — tracker logic.
   Loads app/data/trophies.json, renders the checklist, the roadmap and the
   filters, and keeps progress (earned trophies and counters) in localStorage.
   No network at run time: the only fetch is the local trophies.json file. */

const STORE_KEY = 'leonida-trophy-guide-v1';

const KIND_LABELS = {
  all: 'All 55',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

/* Roadmap to the platinum, built from the official descriptions and the
   launch-week guides: which chapters and missions, which collectibles and
   counts, in what order. Trophy ids refer to app/data/trophies.json. */
const ROADMAP = [
  {
    title: 'Before you start',
    warn: true,
    text: 'Turn cheats off on your trophy save — cheats should switch off trophies and saving. The game has 15 manual save slots plus one autosave: keep one at the start of every chapter and one untouched save from just before the final mission. There is no mission replay and no New Game Plus.',
    trophies: [],
  },
  {
    title: 'Chapter 1 — do the one thing you can miss',
    warn: true,
    text: 'After Lucia is home, check the kitchen in the morning (a morning after the mission Down to Earth is the usual time). She heads out to the balcony of Jason’s house to meditate — follow her and accept the optional task. It is gone once Chapter 1 ends, and it counts toward Positive Mental Attitude. While you are here, beat Cal at fishing and finish an arcade game.',
    trophies: [3, 28, 20, 21, 2],
  },
  {
    title: 'Chapter 2 — the map opens up',
    text: 'Switching between Jason and Lucia opens after Breakfast Run, and then most side content opens with it. Rob Kingpin Bowling with Sticky Bombs. After the mission Daily Driver the Vice City Real Estate app opens, so you can start buying the eight garages; after Moses the Scooter Bros app opens for vehicle registrations.',
    trophies: [4, 8, 46, 54, 55],
  },
  {
    title: 'Chapter 3 — races, jewelry and partner robberies',
    text: 'Do the Race Against Yago the moment it appears — it is time-sensitive (hourglass icon) and its strand counts toward Strangers & Freaks. The mission Yasmani’s Jewelry Jobs gives you the Snap Gun for jewelry store robberies. With your partner, rob three shops back-to-back for Retail Therapy.',
    trophies: [5, 25, 39, 34],
  },
  {
    title: 'Chapter 4 — vaults, then the finale',
    text: 'Near the end of the chapter, the optional mission That’s Where The Money Is opens bank vault robberies. Bring your partner: you cannot carry all the bags alone, and escaping a vault with them also earns Hot Together. Keep one untouched manual save from just before the final mission.',
    trophies: [6, 40, 33, 7],
  },
  {
    title: 'After the story — finales and the 100% cleanup',
    text: 'The six side-story finales and the eight Strangers & Freaks strands all stay open after the credits. The 100% checklist appears under Progress, then Stats, then 100% Completion — work you did earlier still counts. Its biggest pieces: 300 stunts, 70 of the 80 Challenges, 200 of the 277 vehicle models, all 8 bank vaults and all 39 illegal operations.',
    trophies: [22, 23, 24, 26, 27, 29, 25, 15, 32, 35, 40, 43, 14, 1],
  },
];

const state = {
  trophies: [],
  earned: new Set(),
  counts: {},
  kind: 'all',
  grade: 'all',
  search: '',
  hideEarned: false,
  spoiler: true,
  openGuide: null,
};

const $ = (id) => document.getElementById(id);

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.earned)) state.earned = new Set(saved.earned);
    if (saved.counts && typeof saved.counts === 'object') state.counts = saved.counts;
    if (typeof saved.spoiler === 'boolean') state.spoiler = saved.spoiler;
  } catch (e) {
    /* A corrupt save is ignored; the tracker starts fresh. */
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      earned: [...state.earned],
      counts: state.counts,
      spoiler: state.spoiler,
    }));
    $('saveNote').textContent = 'Progress saved in this browser.';
  } catch (e) {
    $('saveNote').textContent = 'Could not save in this browser (storage unavailable).';
  }
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isHidden(trophy) {
  return trophy.hidden && state.spoiler && !state.earned.has(trophy.id);
}

function displayName(trophy) {
  return isHidden(trophy) ? 'Hidden trophy' : trophy.name;
}

function displayDescription(trophy) {
  return isHidden(trophy)
    ? 'A hidden story trophy. Earn it to reveal its name and description.'
    : trophy.description;
}

function filteredTrophies() {
  const q = state.search.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.hideEarned && state.earned.has(t.id)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const total = state.trophies.length;
  const earned = state.earned.size;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  $('progressText').textContent = earned + ' of ' + total + ' earned';
  $('progressPct').textContent = pct + '%';
  $('progressFill').style.width = pct + '%';
  const remaining = state.trophies.filter((t) => !state.earned.has(t.id));
  const nextMissable = remaining.find((t) => t.missable);
  $('progressNote').textContent = nextMissable
    ? 'Next missable to watch: ' + nextMissable.name + '.'
    : (earned === total
      ? 'Platinum earned — you are a Leonida Legend.'
      : 'Earn every other trophy to unlock the platinum, Vice Got a Price!');
}

function sourceList(trophy) {
  if (!trophy.sources || !trophy.sources.length) return '';
  const items = trophy.sources.map((s) => {
    if (s.url) return '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + '</a></li>';
    return '<li>' + escapeHtml(s.name) + '</li>';
  }).join('');
  return '<p class="sources-label">Sources:</p><ul class="sources">' + items + '</ul>';
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function trophyCard(trophy) {
  const earned = state.earned.has(trophy.id);
  const hidden = isHidden(trophy);
  const open = state.openGuide === trophy.id;
  const tags = [];
  tags.push('<span class="tag">' + KIND_LABELS[trophy.kind] + '</span>');
  if (trophy.missable) tags.push('<span class="tag missable">Missable</span>');
  if (trophy.hidden) tags.push('<span class="tag">Hidden</span>');
  if (trophy.count) tags.push('<span class="tag count">Target: ' + trophy.count + ' ' + escapeHtml(trophy.countUnit || '') + '</span>');

  let counter = '';
  if (trophy.count) {
    const value = state.counts[trophy.id] || 0;
    counter = '<div class="counter">'
      + '<button type="button" data-count="' + trophy.id + '" data-delta="-1" aria-label="Decrease count">−</button>'
      + '<span>' + value + ' / ' + trophy.count + ' ' + escapeHtml(trophy.countUnit || '') + '</span>'
      + '<button type="button" data-count="' + trophy.id + '" data-delta="1" aria-label="Increase count">+</button>'
      + '</div>';
  }

  const guide = open
    ? '<div class="guide"><p>' + escapeHtml(trophy.guide) + '</p>' + sourceList(trophy) + '</div>'
    : '';
  const toggleLabel = open ? 'Hide guide' : 'Show guide with sources';

  return '<article class="trophy' + (earned ? ' earned' : '') + '" id="trophy-' + trophy.id + '">'
    + '<div class="trophy-head">'
    + '<label class="trophy-check"><input type="checkbox" data-earned="' + trophy.id + '"'
    + (earned ? ' checked' : '') + ' aria-label="Mark ' + escapeHtml(displayName(trophy)) + ' as earned"></label>'
    + '<div class="trophy-title"><h3>'
    + '<span class="grade grade-' + trophy.grade + '">' + gradeLabel(trophy.grade) + '</span>'
    + '<span class="' + (hidden ? 'hidden-name' : '') + '">' + escapeHtml(displayName(trophy)) + '</span>'
    + '</h3>'
    + '<p class="trophy-desc' + (hidden ? ' hidden-desc' : '') + '">' + escapeHtml(displayDescription(trophy)) + '</p>'
    + '<div class="tags">' + tags.join('') + '</div>'
    + counter
    + '<button type="button" class="guide-toggle" data-guide="' + trophy.id + '">' + toggleLabel + '</button>'
    + guide
    + '</div></div></article>';
}

function renderList() {
  const list = filteredTrophies();
  $('trophyList').innerHTML = list.map(trophyCard).join('');
  $('emptyNote').hidden = list.length > 0;
  const shown = list.length;
  const total = state.trophies.length;
  $('listNote').textContent = shown === total
    ? 'Showing all ' + total + ' trophies. Tick a trophy when you earn it; tap “Show guide” for how to get it and where the facts come from.'
    : 'Showing ' + shown + ' of ' + total + ' trophies.';
  $('listHeading').textContent = state.kind === 'all'
    ? 'All trophies'
    : KIND_LABELS[state.kind] + ' trophies';
}

function renderRoadmap() {
  $('roadmapStages').innerHTML = ROADMAP.map((stage, i) => {
    const chips = stage.trophies.map((id) => {
      const t = state.trophies.find((x) => x.id === id);
      if (!t) return '';
      const done = state.earned.has(id);
      return '<a href="#trophy-' + id + '" data-roadmap="' + id + '" class="' + (done ? 'done' : '') + '">'
        + escapeHtml(isHidden(t) ? 'Hidden trophy' : t.name) + '</a>';
    }).join('');
    return '<div class="stage' + (stage.warn ? ' warn' : '') + '"><h3><span class="stage-no">'
      + (i + 1) + '</span>' + escapeHtml(stage.title) + '</h3><p>'
      + escapeHtml(stage.text) + '</p>'
      + (chips ? '<div class="stage-trophies">' + chips + '</div>' : '')
      + '</div>';
  }).join('');
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
}

function exportProgress() {
  const payload = {
    guide: 'Leonida Trophy Guide — GTA VI (PS5)',
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    counts: state.counts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const earned = Array.isArray(data.earned) ? data.earned.filter((id) => state.trophies.some((t) => t.id === id)) : [];
      const counts = {};
      if (data.counts && typeof data.counts === 'object') {
        Object.keys(data.counts).forEach((key) => {
          const id = Number(key);
          const trophy = state.trophies.find((t) => t.id === id);
          if (trophy && trophy.count) counts[id] = Math.max(0, Math.min(trophy.count, Number(data.counts[key]) || 0));
        });
      }
      state.earned = new Set(earned);
      state.counts = counts;
      saveProgress();
      renderAll();
      $('saveNote').textContent = 'Progress imported: ' + earned.length + ' trophies earned.';
    } catch (e) {
      $('saveNote').textContent = 'That file could not be read as a progress export.';
    }
  };
  reader.readAsText(file);
}

function bindEvents() {
  $('searchInput').addEventListener('input', (e) => { state.search = e.target.value; renderList(); });
  $('gradeFilter').addEventListener('change', (e) => { state.grade = e.target.value; renderList(); });
  $('hideEarned').addEventListener('change', (e) => { state.hideEarned = e.target.checked; renderList(); });
  $('spoilerToggle').addEventListener('change', (e) => {
    state.spoiler = e.target.checked;
    saveProgress();
    renderAll();
  });
  $('kindRow').addEventListener('click', (e) => {
    const button = e.target.closest('[data-kind]');
    if (!button) return;
    state.kind = button.dataset.kind;
    document.querySelectorAll('#kindRow .chip').forEach((chip) => {
      chip.classList.toggle('active', chip === button);
    });
    renderList();
  });
  $('trophyList').addEventListener('change', (e) => {
    const box = e.target.closest('[data-earned]');
    if (!box) return;
    const id = Number(box.dataset.earned);
    if (box.checked) state.earned.add(id); else state.earned.delete(id);
    saveProgress();
    renderAll();
  });
  $('trophyList').addEventListener('click', (e) => {
    const guideBtn = e.target.closest('[data-guide]');
    if (guideBtn) {
      const id = Number(guideBtn.dataset.guide);
      state.openGuide = state.openGuide === id ? null : id;
      renderList();
      return;
    }
    const countBtn = e.target.closest('[data-count]');
    if (countBtn) {
      const id = Number(countBtn.dataset.count);
      const trophy = state.trophies.find((t) => t.id === id);
      if (!trophy || !trophy.count) return;
      const next = Math.max(0, Math.min(trophy.count, (state.counts[id] || 0) + Number(countBtn.dataset.delta)));
      state.counts[id] = next;
      if (next >= trophy.count) state.earned.add(id);
      saveProgress();
      renderAll();
    }
  });
  $('roadmapStages').addEventListener('click', (e) => {
    const link = e.target.closest('[data-roadmap]');
    if (!link) return;
    e.preventDefault();
    const id = Number(link.dataset.roadmap);
    state.kind = 'all';
    state.search = '';
    $('searchInput').value = '';
    document.querySelectorAll('#kindRow .chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.kind === 'all');
    });
    state.openGuide = id;
    renderList();
    const card = $('trophy-' + id);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Reset all progress? Earned trophies and counters will be cleared.')) return;
    state.earned = new Set();
    state.counts = {};
    saveProgress();
    renderAll();
  });
}

function applyDeepLinks() {
  const params = new URLSearchParams(window.location.search);
  const open = Number(params.get('open'));
  if (open && state.trophies.some((t) => t.id === open)) state.openGuide = open;
  const spoiler = params.get('spoiler');
  if (spoiler === '0' || spoiler === '1') {
    state.spoiler = spoiler === '1';
    $('spoilerToggle').checked = state.spoiler;
  }
  const kind = params.get('kind');
  if (kind && KIND_LABELS[kind]) {
    state.kind = kind;
    document.querySelectorAll('#kindRow .chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.kind === kind);
    });
  }
  const view = params.get('view');
  if (view === 'roadmap') {
    setTimeout(() => $('roadmap').scrollIntoView({ behavior: 'smooth' }), 50);
  } else if (open) {
    setTimeout(() => {
      const card = $('trophy-' + open);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }
}

async function init() {
  loadProgress();
  $('spoilerToggle').checked = state.spoiler;
  bindEvents();
  try {
    const response = await fetch('data/trophies.json');
    const data = await response.json();
    state.trophies = Array.isArray(data) ? data : data.trophies;
  } catch (e) {
    $('trophyList').innerHTML = '<p class="empty-note">The trophy list could not be loaded. Check that app/data/trophies.json sits beside this page.</p>';
    return;
  }
  applyDeepLinks();
  renderAll();
}

init();
