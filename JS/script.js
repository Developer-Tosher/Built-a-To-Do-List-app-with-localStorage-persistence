let tasks = JSON.parse(localStorage.getItem('tasks_v2') || '[]');
let filter = 'all';
let priority = 'low';

function setPriority(p, el) {
  priority = p;
  document.querySelectorAll('.p-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function setFilter(f, el) {
  filter = f;
  document.querySelectorAll('.f-tab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  render();
}

function save() { localStorage.setItem('tasks_v2', JSON.stringify(tasks)); }

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  tasks.unshift({
    id: Date.now(),
    text,
    done: false,
    priority,
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
  });
  input.value = '';
  input.focus();
  save();
  render();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; save(); render(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save(); render();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  save(); render();
}

function priClass(p) {
  return p === 'high' ? 'pri-high' : p === 'med' ? 'pri-med' : 'pri-low';
}
function priLabel(p) {
  return p === 'high' ? 'High' : p === 'med' ? 'Medium' : 'Low';
}

function render() {
  let visible = tasks;
  if (filter === 'active')    visible = tasks.filter(t => !t.done);
  if (filter === 'completed') visible = tasks.filter(t =>  t.done);
  if (filter === 'high')      visible = tasks.filter(t => t.priority === 'high');

  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  const bulk  = document.getElementById('bulkRow');

  // Stats
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const left  = total - done;
  const pct   = total ? Math.round((done/total)*100) : 0;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statDone').textContent  = done;
  document.getElementById('statLeft').textContent  = left;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '% complete';

  // Bulk
  if (total > 0) {
    bulk.style.display = 'flex';
    document.getElementById('bulkLabel').textContent = left + ' task' + (left !== 1 ? 's' : '') + ' remaining';
  } else { bulk.style.display = 'none'; }

  // Empty
  if (visible.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = visible.map(t => `
    <div class="task-item ${t.done ? 'done' : ''}" id="task-${t.id}">
      <div class="task-check" onclick="toggleTask(${t.id})" title="Mark ${t.done ? 'undone' : 'done'}">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="task-body">
        <div class="task-text">${escHtml(t.text)}</div>
        <div class="task-meta">
          <span class="task-time">${t.time}</span>
          <span class="task-priority ${priClass(t.priority)}">${priLabel(t.priority)}</span>
        </div>
      </div>
      <button class="task-del" onclick="deleteTask(${t.id})" title="Delete">×</button>
    </div>
  `).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Enter key
document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// Seed with a couple of example tasks on first visit
if (tasks.length === 0) {
  tasks = [
    { id: 1, text: 'Add your own tasks here!', done: false, priority: 'low',  time: '9:00 AM' },
    { id: 2, text: 'Build the Weather App project', done: false, priority: 'high', time: '9:01 AM' },
    { id: 3, text: 'Upload portfolio to GitHub Pages', done: true,  priority: 'med',  time: '8:45 AM' },
  ];
  save();
}

render();