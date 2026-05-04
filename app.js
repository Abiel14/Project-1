const STORAGE_KEY = 'careerQuestData';
const USERS_KEY = 'careerQuestUsers';
const SESSION_KEY = 'careerQuestSessionUser';

const careers = { technology:{label:'Technology',lessons:[{title:'Web Developer Basics',text:'Web developers build websites and apps using HTML, CSS, and JavaScript.'},{title:'Cybersecurity Analyst',text:'Cybersecurity analysts protect systems and data from attacks and scams.'}],quiz:{q:'Which skill is most essential for web development?',options:['Painting','HTML/CSS','Cooking'],answer:1}}, medicine:{label:'Medicine',lessons:[{title:'Nurse Career Snapshot',text:'Nurses care for patients, administer medicine, and support families.'},{title:'Pediatrician Path',text:'Pediatricians specialize in children\'s health and growth.'}],quiz:{q:'What does a pediatrician focus on?',options:['Cars','Children','Buildings'],answer:1}}, arts:{label:'Arts',lessons:[{title:'Graphic Design',text:'Graphic designers create visual content for brands, games, and media.'},{title:'Animator Role',text:'Animators bring stories to life with motion and creativity.'}],quiz:{q:'Animators mainly work with...',options:['Motion and visual storytelling','Surgical tools','Tax forms'],answer:0}}, engineering:{label:'Engineering',lessons:[{title:'Mechanical Engineer',text:'Mechanical engineers design machines and devices for everyday life.'},{title:'Civil Engineer',text:'Civil engineers plan and build bridges, roads, and public systems.'}],quiz:{q:'Who designs roads and bridges?',options:['Civil engineer','Chef','Musician'],answer:0}}, business:{label:'Business',lessons:[{title:'Entrepreneurship',text:'Entrepreneurs start businesses by solving customer problems.'},{title:'Marketing Specialist',text:'Marketing specialists help products reach the right audience.'}],quiz:{q:'Marketing helps a product by...',options:['Hiding it','Reaching the right audience','Turning it into art'],answer:1}} };

let state = load(); let activeCareer = null; let lessonStart = Date.now();
boot();

function boot(){
  const sessionUser = localStorage.getItem(SESSION_KEY);
  if(!sessionUser){ show('authScreen'); bindAuth(); return; }
  const u = JSON.parse(sessionUser);
  if(!u.role){ show('roleScreen'); bindRole(u.username); return; }
  if(u.role==='admin'){ location.href='admin.html'; return; }
  show('appShell'); startApp();
}
function show(id){['authScreen','roleScreen','appShell'].forEach(x=>document.getElementById(x).classList.add('hidden'));document.getElementById(id).classList.remove('hidden');}
function bindAuth(){
  const msg = document.getElementById('authMsg');
  document.getElementById('signupBtn').onclick=()=>auth('signup',msg);
  document.getElementById('authForm').onsubmit=(e)=>{e.preventDefault();auth('login',msg);};
}
function auth(mode,msg){
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if(!username||!password) return msg.textContent='Enter username and password.';
  const users = JSON.parse(localStorage.getItem(USERS_KEY))||[];
  const existing = users.find(u=>u.username===username);
  if(mode==='signup'){
    if(existing) return msg.textContent='Username already exists.';
    users.push({username,password,role:null}); localStorage.setItem(USERS_KEY,JSON.stringify(users));
    msg.textContent='Sign up successful. Now log in.'; return;
  }
  if(!existing || existing.password!==password) return msg.textContent='Invalid credentials.';
  localStorage.setItem(SESSION_KEY, JSON.stringify(existing));
  if(!existing.role){ show('roleScreen'); bindRole(existing.username); }
  else if(existing.role==='admin'){ location.href='admin.html'; }
  else { show('appShell'); startApp(); }
}
function bindRole(username){
  document.querySelectorAll('[data-role]').forEach(btn=>btn.onclick=()=>{
    const role = btn.dataset.role;
    const users = JSON.parse(localStorage.getItem(USERS_KEY))||[];
    const user = users.find(u=>u.username===username); if(!user) return;
    user.role = role; localStorage.setItem(USERS_KEY,JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    role==='admin' ? location.href='admin.html' : (show('appShell'), startApp());
  });
}
function startApp(){
  dailyStreak(); render();
  document.getElementById('logoutBtn').onclick=()=>{localStorage.removeItem(SESSION_KEY); location.reload();};
  document.getElementById('completeLessonBtn').onclick=()=>{ if(!activeCareer) return mascot('Pick a career path first.'); trackTime(); state.completedLessons[activeCareer]=(state.completedLessons[activeCareer]||0)+1; addXp(20); checkBadges(activeCareer); save(); openCareer(activeCareer); };
  document.getElementById('feedbackForm').onsubmit=(e)=>{e.preventDefault();const text=feedbackInput.value.trim();if(!text) return; state.feedback.push({text,date:new Date().toISOString()}); save(); e.target.reset(); mascot('Thanks for your feedback!');};
  document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{state.selectedTheme=b.dataset.theme;save();applyTheme();});
  document.querySelectorAll('[data-skin]').forEach(b=>b.onclick=()=>{state.mascotSkin=b.dataset.skin;document.querySelector('.bear').textContent=state.mascotSkin==='pilot'?'🧸✈️':'🧸';save();});
}
function load(){ return JSON.parse(localStorage.getItem(STORAGE_KEY))||{xp:0,level:1,streak:0,lastVisit:null,completedLessons:{},quizScores:{},timeSpent:{},badges:[],feedback:[],selectedTheme:'gold',mascotSkin:'classic'}; }
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function levelFromXp(xp){return Math.floor(xp/100)+1;}
function dailyStreak(){const t=new Date().toDateString(), y=new Date(Date.now()-86400000).toDateString(); if(state.lastVisit===t)return; state.streak=state.lastVisit===y?state.streak+1:1; state.lastVisit=t; save();}
function render(){xpValue.textContent=state.xp; state.level=levelFromXp(state.xp); levelValue.textContent=state.level; streakValue.textContent=state.streak; renderCareerButtons(); renderBadges(); renderRecommendation(); applyTheme(); recommendedCareer.textContent ||= 'Complete your first lesson to unlock personalized recommendations.';}
function renderCareerButtons(){careerGrid.innerHTML=''; Object.entries(careers).forEach(([k,c])=>{const b=document.createElement('button'); b.className='career-btn'; b.textContent=c.label; b.onclick=()=>openCareer(k); careerGrid.appendChild(b);});}
function openCareer(k){trackTime(); activeCareer=k; const idx=(state.completedLessons[k]||0); const lesson=careers[k].lessons[Math.min(idx,careers[k].lessons.length-1)]; lessonStart=Date.now(); lessonTitle.textContent=`${careers[k].label}: ${lesson.title}`; lessonText.textContent=lesson.text; showQuiz(k); mascot(`Great choice! ${careers[k].label} explorers are problem-solvers.`);}
function showQuiz(k){const q=careers[k].quiz; quizPanel.innerHTML=`<p><strong>Quiz:</strong> ${q.q}</p>`+q.options.map((o,i)=>`<button class='btn ghost' onclick="submitQuiz('${k}',${i})">${o}</button>`).join(' ');}
window.submitQuiz=(k,i)=>{const ok=careers[k].quiz.answer===i; state.quizScores[k]=ok?100:40; if(ok){addXp(30);mascot('Quiz win! 🎉');} else mascot('Nice try!'); save(); renderRecommendation();};
function addXp(a){state.xp+=a; render();}
function trackTime(){if(!activeCareer)return; const s=Math.floor((Date.now()-lessonStart)/1000); state.timeSpent[activeCareer]=(state.timeSpent[activeCareer]||0)+Math.max(1,s); lessonStart=Date.now();}
function checkBadges(k){const c=state.completedLessons[k]||0; if(c>=careers[k].lessons.length){const b=`${careers[k].label} Mini Degree`; if(!state.badges.includes(b)){state.badges.push(b); mascot(`You earned ${b}!`);} } if(state.xp>=200&&!state.badges.includes('Rising Star'))state.badges.push('Rising Star'); if(state.streak>=3&&!state.badges.includes('Consistency Champ'))state.badges.push('Consistency Champ');}
function renderBadges(){badgeList.innerHTML=state.badges.length?state.badges.map(b=>`<li>${b}</li>`).join(''):'<li>No badges yet. Start learning!</li>';}
function renderRecommendation(){const scores=Object.keys(careers).map(k=>({k,total:(state.completedLessons[k]||0)*3+(state.quizScores[k]||0)*.5+(state.timeSpent[k]||0)*.2})).sort((a,b)=>b.total-a.total); const best=scores[0]; recommendedCareer.textContent=best.total>0?`Based on your activity, Grizzly recommends ${careers[best.k].label}.`:'Complete your first lesson to unlock personalized recommendations.';}
function mascot(m){mascotMessage.textContent=m;}
function applyTheme(){document.body.classList.toggle('sunset',state.selectedTheme==='sunset');}
