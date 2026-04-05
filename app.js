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
let secondsLeft = 20 * 60;
let timerId = null;
let submitted = false;
let currentUserName = '';

function loadLeaderboard(){
  const stored = localStorage.getItem('cbt_leaderboard');
  return stored ? JSON.parse(stored) : [];
}

function saveScore(score){
  const leaderboard = loadLeaderboard();
  const timestamp = new Date().toLocaleString();

  leaderboard.push({
    name: currentUserName || 'Anonymous',
    score,
    percentage: Math.round((score / questions.length) * 100),
    timestamp
  });

  leaderboard.sort((a,b)=>b.score - a.score);

  localStorage.setItem('cbt_leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
}

function buildLeaderboardPanel(){
  const lb = loadLeaderboard();
  const panel = document.createElement('div');
  panel.className = 'leaderboard-panel';

  panel.innerHTML = '<h3>Recent Attempts</h3>';

  // ✅ DELETE BUTTON FIXED
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete Leaderboard';
  deleteBtn.className = 'delete-leaderboard-btn';

  deleteBtn.onclick = function() {
    const pin = prompt('Enter PIN to delete leaderboard:');
    if (pin && pin.trim() === '2151') {
      localStorage.removeItem('cbt_leaderboard');
      alert('Leaderboard deleted!');
      location.reload();
    } else {
      alert('Incorrect PIN');
    }
  };

  panel.appendChild(deleteBtn);

  if(lb.length === 0){
    const empty = document.createElement('div');
    empty.className = 'muted';
    empty.textContent = 'No attempts yet.';
    panel.appendChild(empty);
    return panel;
  }

  const list = document.createElement('div');
  list.className = 'leaderboard-list';

  lb.slice(0, 5).forEach((entry, idx)=>{
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    item.innerHTML = `
      <span class='lb-rank'>#${idx + 1}</span>
      <span class='lb-name'>${entry.name}</span>
      <span class='lb-score'>${entry.score}/20</span>
      <span class='lb-pct'>${entry.percentage}%</span>
      <span class='lb-time'>${entry.timestamp.split(',')[0]}</span>
    `;
    list.appendChild(item);
  });

  panel.appendChild(list);
  return panel;
}

function formatTime(seconds){
  const m = String(Math.floor(seconds / 60)).padStart(2,'0');
  const s = String(seconds % 60).padStart(2,'0');
  return `${m}:${s}`;
}

function startTimer(){
  timerEl.textContent = formatTime(secondsLeft);
  timerId = setInterval(()=>{
    secondsLeft--;
    timerEl.textContent = formatTime(secondsLeft);

    if(secondsLeft <= 0){
      clearInterval(timerId);
      submitExam();
    }
  }, 1000);
}

function submitExam(){
  if(submitted) return;
  submitted = true;
  clearInterval(timerId);

  const score = answers.reduce((sum, answer, idx)=>{
    return sum + (answer === questions[idx].answer ? 1 : 0);
  }, 0);

  saveScore(score);

  app.innerHTML = '';

  const report = document.createElement('div');
  report.className = 'exam-card';

  report.innerHTML = `
    <h2>Exam Submitted</h2>
    <p>Score: ${score} / ${questions.length}</p>
    <p>Percentage: ${Math.round((score / questions.length) * 100)}%</p>
  `;

  const restart = document.createElement('button');
  restart.textContent = 'Restart Exam';

  restart.onclick = ()=>{
    currentIndex = 0;
    answers = Array(questions.length).fill(null);
    secondsLeft = 20 * 60;
    submitted = false;
    startTimer();
    renderQuestion();
  };

  report.appendChild(buildLeaderboardPanel());
  report.appendChild(restart);

  app.appendChild(report);
}

function renderQuestion(){
  app.innerHTML = '';

  const q = questions[currentIndex];

  const container = document.createElement('div');
  container.className = 'exam-card';

  const title = document.createElement('h3');
  title.textContent = `Question ${currentIndex + 1}`;

  const text = document.createElement('p');
  text.textContent = q.text;

  const optionsDiv = document.createElement('div');

  ['A','B','C','D'].forEach((letter, i)=>{
    const btn = document.createElement('button');
    btn.textContent = `${letter}. ${q.options[i]}`;

    btn.onclick = ()=>{
      answers[currentIndex] = letter;
      currentIndex++;

      if(currentIndex < questions.length){
        renderQuestion();
      } else {
        submitExam();
      }
    };

    optionsDiv.appendChild(btn);
  });

  container.append(title, text, optionsDiv);
  app.appendChild(container);
}

function showNameInput(){
  app.innerHTML = '';

  const input = document.createElement('input');
  input.placeholder = 'Enter your name';

  const btn = document.createElement('button');
  btn.textContent = 'Start';

  btn.onclick = ()=>{
    if(!input.value.trim()){
      alert('Enter your name');
      return;
    }

    currentUserName = input.value.trim();
    startTimer();
    renderQuestion();
  };

  app.append(input, btn);
}

showNameInput();
