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
  leaderboard.push({name: currentUserName || 'Anonymous', score, percentage: Math.round((score / questions.length) * 100), timestamp});
  leaderboard.sort((a,b)=>b.score - a.score);
  localStorage.setItem('cbt_leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
}

function buildLeaderboardPanel(){
  const lb = loadLeaderboard();
  const panel = document.createElement('div');
  panel.className = 'leaderboard-panel';
  panel.innerHTML = '<h3>Recent Attempts</h3>';
  if(lb.length === 0){
    panel.innerHTML += '<div class="muted">No attempts yet.</div>';
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
    secondsLeft -= 1;
    timerEl.textContent = formatTime(secondsLeft);
    if(secondsLeft <= 0){
      clearInterval(timerId);
      submitExam();
    }
  }, 1000);
}

function buildQuestionNav(){
  const nav = document.createElement('div');
  nav.className = 'question-nav';
  questions.forEach((q, idx)=>{
    const button = document.createElement('button');
    button.className = 'nav-number';
    button.textContent = idx + 1;
    if(answers[idx]) button.classList.add('answered');
    if(idx === currentIndex) button.classList.add('active');
    button.addEventListener('click', ()=>{
      currentIndex = idx;
      renderQuestion();
    });
    nav.appendChild(button);
  });
  return nav;
}

function renderQuestion(){
  app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'exam-card';

  const header = document.createElement('div');
  header.className = 'question-header';
  header.innerHTML = `
    <div class='question-count'>Question ${currentIndex + 1} of ${questions.length}</div>
    <div class='question-progress'>Answered ${answers.filter(Boolean).length} / ${questions.length}</div>
  `;

  const questionBox = document.createElement('div');
  questionBox.className = 'question-box';
  questionBox.innerHTML = `<p>${questions[currentIndex].text}</p>`;

  const optionsEl = document.createElement('div');
  optionsEl.className = 'options-grid';

  ['A','B','C','D'].forEach((letter, idx)=>{
    const option = document.createElement('label');
    option.className = 'option-card';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'choice';
    radio.value = letter;
    radio.checked = answers[currentIndex] === letter;
    radio.addEventListener('change', ()=>{
      answers[currentIndex] = letter;
      updateAnswerNav();
    });
    option.innerHTML = `<span class='option-letter'>${letter}</span><span class='option-text'>${questions[currentIndex].options[idx]}</span>`;
    option.prepend(radio);
    optionsEl.appendChild(option);
  });

  const actionBar = document.createElement('div');
  actionBar.className = 'action-bar';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = currentIndex === 0;
  prevBtn.addEventListener('click', ()=>{
    if(currentIndex > 0){
      currentIndex -= 1;
      renderQuestion();
    }
  });

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentIndex === questions.length - 1;
  nextBtn.addEventListener('click', ()=>{
    if(currentIndex < questions.length - 1){
      currentIndex += 1;
      renderQuestion();
    }
  });

  const submitBtn = document.createElement('button');
  submitBtn.className = 'submit-btn';
  submitBtn.textContent = 'Submit Exam';
  submitBtn.addEventListener('click', ()=>{
    if(confirm('Submit your answers now?')) submitExam();
  });

  actionBar.append(prevBtn, nextBtn, submitBtn);

  container.append(header, questionBox, optionsEl, buildSummary(), buildQuestionNav(), actionBar);
  app.appendChild(container);
}

function buildSummary(){
  const summary = document.createElement('div');
  summary.className = 'summary-bar';
  const answeredCount = answers.filter(Boolean).length;
  summary.innerHTML = `
    <div><span class='summary-label'>Answered</span> ${answeredCount}</div>
    <div><span class='summary-label'>Remaining</span> ${questions.length - answeredCount}</div>
    <div><span class='summary-label'>Time</span> ${formatTime(secondsLeft)}</div>
  `;
  return summary;
}

function updateAnswerNav(){
  const navButtons = document.querySelectorAll('.question-nav .nav-number');
  navButtons.forEach((btn, idx)=>{
    btn.classList.toggle('answered', Boolean(answers[idx]));
  });
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
  report.className = 'exam-card results-card';
  report.innerHTML = `
    <h2>Exam Submitted</h2>
    <div class='results-summary'>
      <div><span>Score</span> ${score} / ${questions.length}</div>
      <div><span>Percentage</span> ${Math.round((score / questions.length) * 100)}%</div>
      <div class='results-message'>${score / questions.length >= 0.7 ? 'Great job!' : 'Review the mistakes and try again.'}</div>
    </div>
  `;

  const answersList = document.createElement('div');
  answersList.className = 'review-list';

  questions.forEach((q, idx)=>{
    const card = document.createElement('div');
    card.className = 'review-card';
    const user = answers[idx] || '–';
    const correct = q.answer;
    card.classList.add(user === correct ? 'correct' : 'wrong');
    card.innerHTML = `
      <div class='review-head'>
        <span>Q${idx + 1}</span>
        <span class='review-status'>${user === correct ? 'Correct' : 'Wrong'}</span>
      </div>
      <p>${q.text}</p>
      <div class='review-answers'>
        <div><strong>Your answer:</strong> ${user === '–' ? 'No response' : user + '. ' + q.options[['A','B','C','D'].indexOf(user)]}</div>
        <div><strong>Correct:</strong> ${correct}. ${q.options[['A','B','C','D'].indexOf(correct)]}</div>
      </div>
    `;
    answersList.appendChild(card);
  });

  const restart = document.createElement('button');
  restart.textContent = 'Restart Exam';
  restart.addEventListener('click', ()=>{
    currentIndex = 0;
    answers = Array(questions.length).fill(null);
    secondsLeft = 20 * 60;
    submitted = false;
    startTimer();
    renderQuestion();
  });

  report.appendChild(answersList);
  report.appendChild(buildLeaderboardPanel());
  report.appendChild(restart);
  app.appendChild(report);
}

function showNameInput(){
  app.innerHTML = '';
  const nameScreen = document.createElement('div');
  nameScreen.className = 'exam-card name-input-card';
  nameScreen.innerHTML = `
    <h2>Welcome to Physics CBT</h2>
    <p>Enter your name to start the exam and join the leaderboard.</p>
  `;

  const inputDiv = document.createElement('div');
  inputDiv.className = 'name-input-group';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Your name';
  input.className = 'name-input';
  input.maxLength = '30';

  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start Exam';
  startBtn.className = 'start-exam-btn';
  startBtn.addEventListener('click', ()=>{
    const name = input.value.trim();
    if(!name){
      alert('Please enter your name');
      return;
    }
    currentUserName = name;
    currentIndex = 0;
    answers = Array(questions.length).fill(null);
    secondsLeft = 20 * 60;
    submitted = false;
    startTimer();
    renderQuestion();
  });

  input.addEventListener('keypress', (e)=>{
    if(e.key === 'Enter') startBtn.click();
  });

  inputDiv.append(input, startBtn);
  nameScreen.appendChild(inputDiv);
  app.appendChild(nameScreen);
}

showNameInput();
// Original code goes here

// Add Delete Leaderboard Button
const deleteBtn = document.createElement('button');
deleteBtn.innerText = 'Delete Leaderboard';
deleteBtn.className = 'delete-leaderboard-btn';
deleteBtn.onclick = function() {
  const pin = prompt('Enter PIN to delete leaderboard:');
  if (pin === '2151') {
    localStorage.removeItem('cbt_leaderboard');
    alert('Leaderboard deleted!');
    location.reload();
  } else {
    alert('Incorrect');
  }
};
const adminPanel = document.getElementById('app');
if(adminPanel) adminPanel.appendChild(deleteBtn);
