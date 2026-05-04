const data = JSON.parse(localStorage.getItem('careerQuestData')) || {};
const users = Math.max(1, Math.floor((data.xp || 0) / 50) + 7);
const completed = data.completedLessons || {};
const feedback = data.feedback || [];
const careers = ['technology', 'medicine', 'arts', 'engineering', 'business'];

let popularCareer = 'N/A';
let max = -1;
careers.forEach(c => {
  const val = completed[c] || 0;
  if (val > max) { max = val; popularCareer = c; }
});

document.getElementById('totalUsers').textContent = users;
document.getElementById('popularCareer').textContent = popularCareer[0].toUpperCase() + popularCareer.slice(1);
document.getElementById('feedbackCount').textContent = feedback.length;

document.getElementById('feedbackList').innerHTML = feedback.length
  ? feedback.map(f => `<li>${new Date(f.date).toLocaleString()}: ${f.text}</li>`).join('')
  : '<li>No feedback submitted yet.</li>';

const chart = document.getElementById('chart');
chart.innerHTML = careers.map(c => {
  const h = ((completed[c] || 0) * 20) + 12;
  return `<div style="display:inline-block;width:18%;margin-right:1%;vertical-align:bottom;text-align:center;">
    <div style="height:${h}px;background:#f4b400;border-radius:8px 8px 0 0;"></div>
    <small>${c}</small>
  </div>`;
}).join('');
