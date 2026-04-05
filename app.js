const questions = [
  {text:'Work is said to be done when:', options:['Force is applied','Force causes displacement','Energy is present','Motion exists'], answer:'B'},
  {text:'The unit of work is:', options:['Watt','Joule','Newton','Pascal'], answer:'B'},
  {text:'A force of 10 N moves a body 5 m. Work done is:', options:['2 J','15 J','50 J','5 J'], answer:'C'},
  {text:'Power is defined as:', options:['Force × distance','Work × time','Work / time','Force / time'], answer:'C'},
  {text:'A machine does 200 J of work in 10 s. Power is:', options:['20 W','10 W','2000 W','2 W'], answer:'A'},
  {text:'Kinetic energy depends on:', options:['Height only','Mass only','Mass and velocity','Velocity only'], answer:'C'},
  {text:'Potential energy is due to:', options:['Motion','Position','Speed','Force'], answer:'B'},
  {text:'Friction is:', options:['Force aiding motion','Force opposing motion','Energy','Work done'], answer:'B'},
  {text:'Which increases friction?', options:['Smooth surface','Lubrication','Rough surface','Oil'], answer:'C'},
  {text:'Unit of frictional force is:', options:['Joule','Newton','Watt','Pascal'], answer:'B'},
  {text:'Friction can be reduced by:', options:['Increasing roughness','Lubrication','Increasing weight','Increasing area'], answer:'B'},
  {text:'Static friction acts when:', options:['Body is moving','Body is at rest','Body is falling','Body is accelerating'], answer:'B'},
  {text:'Surface tension is due to:', options:['Adhesion','Cohesion','Friction','Gravity'], answer:'B'},
  {text:'Unit of surface tension is:', options:['N/m','J','Pa','W'], answer:'A'},
  {text:'Viscosity is:', options:['Resistance to motion','Resistance to flow','Force','Pressure'], answer:'B'},
  {text:'Which liquid has highest viscosity?', options:['Water','Oil','Honey','Alcohol'], answer:'C'},
  {text:'Terminal velocity occurs when:', options:['Speed is zero','Acceleration is maximum','Forces balance','Gravity is zero'], answer:'C'},
  {text:'Increasing temperature causes viscosity to:', options:['Increase','Decrease','Remain constant','Double'], answer:'B'},
  {text:'Capillary rise occurs when:', options:['Cohesion > adhesion','Adhesion > cohesion','Forces equal','No force acts'], answer:'B'},
  {text:'A body falls slower in oil than in water because:', options:['Oil is lighter','Oil has higher viscosity','Oil has lower density','Oil has no resistance'], answer:'B'}
];

const app = document.getElementById('app');
const timerEl = document.getElementById('timer');

let currentIndex = 0;
let answers = Array(questions.length).fill(null);
let secondsLeft = 20*60;
let timerId = null;
let submitted = false;
let currentUserName = '';

// ---------------- TIMER ----------------
function startTimer(){
  timerEl.textContent = formatTime(secondsLeft);
  timerId = setInterval(()=>{
    secondsLeft--;
    timerEl.textContent = formatTime(secondsLeft);
    if(secondsLeft <=0){
      clearInterval(timerId);
      submitExam();
    }
  },1000);
}

function formatTime(s){ return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

// ---------------- LEADERBOARD ----------------
function loadLeaderboard(){ return JSON.parse(localStorage.getItem('cbt_leaderboard'))||[]; }
function saveScore(score){
  const lb = loadLeaderboard();
  lb.push({name:currentUserName,score,percentage:Math.round(score/questions.length*100),time:new Date().toLocaleDateString()});
  lb.sort((a,b)=>b.score-a.score);
  localStorage.setItem('cbt_leaderboard',JSON.stringify(lb.slice(0,10)));
}

function buildLeaderboard(){
  const lb = loadLeaderboard();
  const div = document.createElement('div');
  div.className='leaderboard-panel';
  div.innerHTML='<h3>Leaderboard</h3>';
  const del = document.createElement('button');
  del.className='delete-leaderboard';
  del.textContent='Delete Leaderboard';
  del.onclick=()=>{ if(prompt('PIN')==='2151'){ localStorage.removeItem('cbt_leaderboard'); location.reload(); } else alert('Wrong PIN'); };
  div.appendChild(del);

  if(lb.length===0){ div.innerHTML+='<p>No scores yet</p>'; return div; }

  lb.forEach((e,i)=>{
    const item = document.createElement('div');
    item.className='leaderboard-item';
    item.textContent=`${i+1}. ${e.name} - ${e.score}/20`;
    div.appendChild(item);
  });

  return div;
}

// ---------------- QUIZ ----------------
function renderQuestion(){
  app.innerHTML='';
  const q = questions[currentIndex];
  const card = document.createElement('div'); card.className='exam-card';
  const h = document.createElement('h3'); h.textContent=`Q${currentIndex+1}`;
  const p = document.createElement('p'); p.textContent=q.text;
  card.append(h,p);

  q.options.forEach((opt,i)=>{
    const btn = document.createElement('button');
    btn.textContent=`${['A','B','C','D'][i]}. ${opt}`;
    if(answers[currentIndex]===['A','B','C','D'][i]) btn.style.background='#4ade80';
    btn.onclick=()=>{
      answers[currentIndex]=['A','B','C','D'][i];
      renderQuestionNav();
      if(currentIndex<questions.length-1){ currentIndex++; renderQuestion(); } else { submitExam(); }
    };
    card.appendChild(btn);
  });

  const navDiv = document.createElement('div'); navDiv.className='question-nav';
  questions.forEach((_,i)=>{
    const navBtn = document.createElement('div'); navBtn.className='nav-number';
    navBtn.textContent=i+1;
    if(answers[i]) navBtn.classList.add('answered');
    if(i===currentIndex) navBtn.classList.add('active');
    navBtn.onclick=()=>{ currentIndex=i; renderQuestion(); };
    navDiv.appendChild(navBtn);
  });
  card.appendChild(navDiv);

  app.appendChild(card);
}

function renderQuestionNav(){
  document.querySelectorAll('.nav-number').forEach((btn,i)=>{
    btn.classList.toggle('answered',answers[i]!=null);
  });
}

// ---------------- SUBMIT ----------------
function submitExam(){
  if(submitted) return; submitted=true;
  clearInterval(timerId);
  const score=answers.reduce((s,a,i)=> s + (a===questions[i].answer),0);
  saveScore(score);
  app.innerHTML=`<div class="exam-card"><h2>Done</h2><p>Score: ${score}/20</p></div>`;
  app.appendChild(buildLeaderboard());
}

// ---------------- START ----------------
function start(){
  app.innerHTML='';
  const div = document.createElement('div'); div.className='name-input-card';
  const input=document.createElement('input'); input.placeholder='Enter Name';
  const btn=document.createElement('button'); btn.textContent='Start';
  btn.onclick=()=>{
    if(!input.value.trim()) return alert('Enter name');
    currentUserName=input.value.trim();
    startTimer();
    renderQuestion();
  };
  div.append(input,btn);
  app.appendChild(div);
}

start();
