const STORAGE_KEY = 'careerQuestData';

const careers = {
  technology: {
    label: 'Technology',
    lessons: [
      { title: 'Web Developer Basics', text: 'Web developers build websites and apps using HTML, CSS, and JavaScript.' },
      { title: 'Cybersecurity Analyst', text: 'Cybersecurity analysts protect systems and data from attacks and scams.' }
    ],
    quiz: { q: 'Which skill is most essential for web development?', options: ['Painting', 'HTML/CSS', 'Cooking'], answer: 1 }
  },
  medicine: {
    label: 'Medicine',
    lessons: [
      { title: 'Nurse Career Snapshot', text: 'Nurses care for patients, administer medicine, and support families.' },
      { title: 'Pediatrician Path', text: 'Pediatricians specialize in children\'s health and growth.' }
    ],
    quiz: { q: 'What does a pediatrician focus on?', options: ['Cars', 'Children', 'Buildings'], answer: 1 }
  },
  arts: {
    label: 'Arts',
    lessons: [
      { title: 'Graphic Design', text: 'Graphic designers create visual content for brands, games, and media.' },
      { title: 'Animator Role', text: 'Animators bring stories to life with motion and creativity.' }
    ],
    quiz: { q: 'Animators mainly work with...', options: ['Motion and visual storytelling', 'Surgical tools', 'Tax forms'], answer: 0 }
  },
  engineering: {
    label: 'Engineering',
    lessons: [
      { title: 'Mechanical Engineer', text: 'Mechanical engineers design machines and devices for everyday life.' },
      { title: 'Civil Engineer', text: 'Civil engineers plan and build bridges, roads, and public systems.' }
    ],
    quiz: { q: 'Who designs roads and bridges?', options: ['Civil engineer', 'Chef', 'Musician'], answer: 0 }
  },
  business: {
    label: 'Business',
    lessons: [
      { title: 'Entrepreneurship', text: 'Entrepreneurs start businesses by solving customer problems.' },
      { title: 'Marketing Specialist', text: 'Marketing specialists help products reach the right audience.' }
    ],
    quiz: { q: 'Marketing helps a product by...', options: ['Hiding it', 'Reaching the right audience', 'Turning it into art'], answer: 1 }
  }
};

let state = load();
let activeCareer = null;
let activeLessonIndex = 0;
let lessonStart = Date.now();

dailyStreak();
render();

function load() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    xp: 0, level: 1, streak: 0, lastVisit: null, premium: false,
    completedLessons: {}, quizScores: {}, timeSpent: {}, badges: [], feedback: [], selectedTheme: 'gold', mascotSkin: 'classic'
  };
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function levelFromXp(xp) { return Math.floor(xp / 100) + 1; }

function dailyStreak() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (state.lastVisit === today) return;
  state.streak = state.lastVisit === yesterday ? state.streak + 1 : 1;
  state.lastVisit = today;
  save();
}

function render() {
  document.getElementById('xpValue').textContent = state.xp;
  state.level = levelFromXp(state.xp);
  document.getElementById('levelValue').textContent = state.level;
  document.getElementById('streakValue').textContent = state.streak;
  renderCareerButtons();
  renderBadges();
  renderRecommendation();
  applyTheme();
  renderPremium();
}

function renderCareerButtons() {
  const grid = document.getElementById('careerGrid');
  grid.innerHTML = '';
  Object.entries(careers).forEach(([key, c]) => {
    const btn = document.createElement('button');
    btn.className = 'career-btn';
    btn.textContent = c.label;
    btn.onclick = () => openCareer(key);
    grid.appendChild(btn);
  });
}

function openCareer(careerKey) {
  trackTime();
  activeCareer = careerKey;
  activeLessonIndex = (state.completedLessons[careerKey] || 0);
  const lesson = careers[careerKey].lessons[Math.min(activeLessonIndex, careers[careerKey].lessons.length - 1)];
  lessonStart = Date.now();
  document.getElementById('lessonTitle').textContent = `${careers[careerKey].label}: ${lesson.title}`;
  document.getElementById('lessonText').textContent = lesson.text;
  showQuiz(careerKey);
  mascot(`Great choice! ${careers[careerKey].label} explorers are problem-solvers.`);
}

function showQuiz(careerKey) {
  const quiz = careers[careerKey].quiz;
  const panel = document.getElementById('quizPanel');
  panel.innerHTML = `<p><strong>Quiz:</strong> ${quiz.q}</p>` + quiz.options.map((o, i)=>`<button class="btn ghost" onclick="submitQuiz('${careerKey}', ${i})">${o}</button>`).join(' ');
}
window.submitQuiz = function (careerKey, index) {
  const correct = careers[careerKey].quiz.answer === index;
  state.quizScores[careerKey] = correct ? 100 : 40;
  if (correct) { addXp(30); mascot('Quiz win! Brilliant thinking! 🎉'); }
  else { mascot('Nice try! Every mistake helps your brain grow.'); }
  save();
  renderRecommendation();
};

document.getElementById('completeLessonBtn').addEventListener('click', () => {
  if (!activeCareer) return mascot('Pick a career path first.');
  trackTime();
  state.completedLessons[activeCareer] = (state.completedLessons[activeCareer] || 0) + 1;
  addXp(20);
  checkBadges(activeCareer);
  save();
  openCareer(activeCareer);
});

function addXp(amount) { state.xp += amount; render(); }

function trackTime() {
  if (!activeCareer) return;
  const spent = Math.floor((Date.now() - lessonStart) / 1000);
  state.timeSpent[activeCareer] = (state.timeSpent[activeCareer] || 0) + Math.max(1, spent);
  lessonStart = Date.now();
}

function checkBadges(careerKey) {
  const completed = state.completedLessons[careerKey] || 0;
  if (completed >= careers[careerKey].lessons.length) {
    const badge = `${careers[careerKey].label} Mini Degree`;
    if (!state.badges.includes(badge)) { state.badges.push(badge); mascot(`You earned the ${badge} badge! 🏅`); }
  }
  if (state.xp >= 200 && !state.badges.includes('Rising Star')) state.badges.push('Rising Star');
  if (state.streak >= 3 && !state.badges.includes('Consistency Champ')) state.badges.push('Consistency Champ');
}
function renderBadges() {
  const list = document.getElementById('badgeList');
  list.innerHTML = state.badges.length ? state.badges.map(b=>`<li>${b}</li>`).join('') : '<li>No badges yet. Start learning!</li>';
}
function renderRecommendation() {
  const scores = Object.keys(careers).map((k) => {
    const lessons = state.completedLessons[k] || 0;
    const quiz = state.quizScores[k] || 0;
    const time = state.timeSpent[k] || 0;
    return { k, total: lessons * 3 + quiz * 0.5 + time * 0.2 };
  }).sort((a,b)=>b.total - a.total);
  const best = scores[0];
  document.getElementById('recommendedCareer').textContent = best.total > 0
    ? `Based on your activity, Grizzly recommends ${careers[best.k].label}. Keep going!`
    : 'Complete your first lesson to unlock personalized recommendations.';
}
function mascot(msg) { document.getElementById('mascotMessage').textContent = msg; }

document.getElementById('upgradeBtn').addEventListener('click', () => {
  state.premium = true;
  save();
  renderPremium();
  mascot('Welcome to Premium! New missions are now unlocked.');
});
function renderPremium() {
  document.getElementById('premiumText').textContent = state.premium
    ? '✅ Premium unlocked: Career mentor stories, bonus quests, and advanced quizzes are available.'
    : 'Premium roleplay mission is locked. Upgrade to unlock exclusive mentor stories and hard-mode quizzes.';
}

document.querySelectorAll('[data-theme]').forEach(btn => btn.addEventListener('click', () => { state.selectedTheme = btn.dataset.theme; save(); applyTheme(); }));
function applyTheme() { document.body.classList.toggle('sunset', state.selectedTheme === 'sunset'); }

document.querySelectorAll('[data-skin]').forEach(btn => btn.addEventListener('click', () => {
  state.mascotSkin = btn.dataset.skin;
  document.querySelector('.bear').textContent = state.mascotSkin === 'pilot' ? '🧸✈️' : '🧸';
  save();
}));

document.getElementById('feedbackForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('feedbackInput').value.trim();
  if (!text) return;
  state.feedback.push({ text, date: new Date().toISOString() });
  save();
  e.target.reset();
  mascot('Thanks for your feedback! You help CareerQuest improve for everyone.');
});
