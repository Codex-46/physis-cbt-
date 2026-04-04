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