// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.16.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.16.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDTbZl9waOHVBJji1tXsBX1I8-L1-A7sPU",
  authDomain: "physics-cbt.firebaseapp.com",
  projectId: "physics-cbt",
  storageBucket: "physics-cbt.firebasestorage.app",
  messagingSenderId: "409298097753",
  appId: "1:409298097753:web:2b2be75a6aadcdcbc78348"
};

// Initialize Firebase & Firestore
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

// ----- QUESTIONS -----
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

// ----- APP VARIABLES -----
const appEl = document.getElementById('app');
const timerEl = document.getElementById('timer');
let currentIndex = 0;
let answers = Array(questions.length).fill(null);
let secondsLeft = 20*60;
let timerId = null;
let submitted = false;
let currentUserName = '';

// ----- TIMER -----
function startTimer() {
  timerEl.textContent = formatTime(secondsLeft);
  timerId = setInterval(() => {
    secondsLeft--;
    timerEl.textContent = formatTime(secondsLeft);
    if (secondsLeft <= 0) {
      clearInterval(timerId);
      submitExam();
    }
  }, 1000);
}
function formatTime(s){ return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

// ----- FIRESTORE LEADERBOARD -----
async function saveScoreFirestore(score) {
  try {
    await addDoc(collection(db, 'leaderboard'), {
      name: currentUserName,
      score,
      answers,
      timestamp: new Date()
    });
  } catch(e) { console.error(e); }
}

async function getLeaderboardFirestore() {
  const q = query(collection(db, 'leaderboard'), orderBy('score','desc'), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({id:d.id, ...d.data()}));
}

async function deleteLeaderboardFirestore() {
  const confirmPIN = prompt('Enter PIN to delete leaderboard');
  if(confirmPIN!=='2151') return alert('Wrong PIN');
  const snapshot = await getDocs(collection(db,'leaderboard'));
  snapshot.forEach(async d => await deleteDoc(doc(db,'leaderboard',d.id)));
  location.reload();
}

// ----- RENDER LEADERBOARD -----
async function buildLeaderboard() {
  const lb = await getLeaderboardFirestore();
  const div = document.createElement('div');
  div.className = 'leaderboard-panel';
  div.innerHTML = '<h3>Leaderboard</h3>';

  const del = document.createElement('button');
  del.className = 'delete-leaderboard';
  del.textContent = 'Delete Leaderboard';
  del.onclick = deleteLeaderboardFirestore;
  div.appendChild(del);

  if(lb.length===0){ div.innerHTML+='<p>No scores yet</p>'; return div; }

  lb.forEach((e,i)=>{
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    item.textContent = `${i+1}. ${e.name} - ${e.score}/20`;
    div.appendChild(item);
  });
  return div;
}

// ----- QUIZ RENDER -----
function renderQuestion() {
  appEl.innerHTML = '';
  const q = questions[currentIndex];

  const card = document.createElement('div');
  card.className = 'exam-card';
  card.innerHTML = `<h3>Q${currentIndex+1}</h3><p>${q.text}</p>`;

  q.options.forEach((opt,i)=>{
    const btn = document.createElement('button');
    const letter = ['A','B','C','D'][i];
    btn.textContent = `${letter}. ${opt}`;
    if(answers[currentIndex]===letter) btn.style.background='#4ade80';
    btn.onclick = ()=>{
      answers[currentIndex]=letter;
      if(currentIndex<questions.length-1){ currentIndex++; renderQuestion(); }
      else submitExam();
    };
    card.appendChild(btn);
  });

  const nav = document.createElement('div');
  nav.className = 'question-nav';
  questions.forEach((_,i)=>{
    const b=document.createElement('div');
    b.className='nav-number';
    b.textContent=i+1;
    if(answers[i]) b.classList.add('answered');
    if(i===currentIndex) b.classList.add('active');
    b.onclick=()=>{ currentIndex=i; renderQuestion(); };
    nav.appendChild(b);
  });

  card.appendChild(nav);
  appEl.appendChild(card);
}

// ----- REVIEW -----
function showReview(data) {
  appEl.innerHTML='';
  const card = document.createElement('div');
  card.className='exam-card';
  card.innerHTML=`<h2>${data.name}'s Result</h2><p>${data.score}/20</p>`;

  data.answers.forEach((ans,i)=>{
    const q=questions[i];
    const div=document.createElement('div');
    div.className='review-card';
    div.classList.add(ans===q.answer?'correct':'wrong');
    div.innerHTML=`
      <p>${q.text}</p>
      <div class="review-answers">
        <div><strong>Your:</strong> ${ans||'None'}</div>
        <div><strong>Correct:</strong> ${q.answer}</div>
      </div>
    `;
    card.appendChild(div);
  });

  const back = document.createElement('button');
  back.textContent='Back';
  back.onclick = start;
  card.appendChild(back);

  appEl.appendChild(card);
}

// ----- SUBMIT -----
async function submitExam() {
  if(submitted) return;
  submitted=true;
  clearInterval(timerId);

  const score = answers.reduce((s,a,i)=> s + (a===questions[i].answer),0);
  await saveScoreFirestore(score);

  showReview({name: currentUserName, score, answers});
  appEl.appendChild(await buildLeaderboard());
}

// ----- START -----
function start() {
  appEl.innerHTML='';
  const div = document.createElement('div');
  div.className='name-input-card';

  const input = document.createElement('input');
  input.placeholder='Enter Name';

  const btn = document.createElement('button');
  btn.textContent='Continue';

  const options = document.createElement('div');
  options.style.display='flex';
  options.style.gap='10px';
  options.style.marginTop='10px';

  btn.onclick=async ()=>{
    const name = input.value.trim();
    if(!name) return alert('Enter name');
    currentUserName=name;

    currentIndex=0; answers=Array(questions.length).fill(null); submitted=false; secondsLeft=20*60;
    startTimer();
    renderQuestion();
    options.innerHTML='';
  };

  div.append(input,btn,options);
  appEl.appendChild(div);

  buildLeaderboard().then(lbDiv=> appEl.appendChild(lbDiv));
}

start();
