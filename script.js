/* ==========================================================================
   DIARY SMART — FRONTEND LOGIC (CONNECTED TO RENDER BACKEND)
   ========================================================================== */

// Base URL for your live Render Backend
const API_BASE_URL = 'https://diary-smart-backend.onrender.com';

// Global helper for alerts from outside DOMContentLoaded if needed
function triggerAlert(type, title, message, redirectUrl = null) {
  const alertModal = document.getElementById('alertModal');
  const alertTitle = document.getElementById('alertTitle');
  const alertMessage = document.getElementById('alertMessage');
  const statusIcon = document.getElementById('statusIcon');
  const alertBtn = document.getElementById('alertBtn');

  // Ikiwa modal haipo kabisa kwenye HTML, onyo litatolewa kwenye Console badala ya Browser Alert
  if (!alertModal) {
    console.warn("Alert modal element not found in HTML!");
    if (redirectUrl) window.location.href = redirectUrl;
    return;
  }

  window.alertRedirectUrl = redirectUrl;
  
  if (statusIcon) {
    statusIcon.className = 'status-icon-wrapper ' + type;
    if (type === 'success') {
      statusIcon.innerHTML = `
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>`;
    } else {
      statusIcon.innerHTML = `
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>`;
    }
  }

  if (alertTitle) alertTitle.textContent = title;
  if (alertMessage) alertMessage.textContent = message;
  
  alertModal.classList.add('active');
  alertModal.style.display = 'flex';
}

// Global functions for Update & Delete
async function deleteDiary(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/diary/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
      }
    });

    const data = await response.json();
    if (response.ok) {
      triggerAlert('success', 'Deleted!', 'Diary entry has been successfully deleted!', 'tasks.html');
    } else {
      triggerAlert('error', 'Failed', data.message || 'Failed to delete entry.');
    }
  } catch (error) {
    console.error('Delete Error:', error);
    triggerAlert('error', 'Error', 'Network connection error.');
  }
}

function editDiary(id, title, date, mood, details) {
  localStorage.setItem('editId', id);
  localStorage.setItem('editTitle', title);
  localStorage.setItem('editDate', date);
  localStorage.setItem('editMood', mood);
  localStorage.setItem('editDetails', details);

  window.location.href = 'diary.html';
}

document.addEventListener('DOMContentLoaded', () => {

  // Global variables for Alert Modal
  const alertModal = document.getElementById('alertModal');
  const alertBtn = document.getElementById('alertBtn');

  function showAlert(type, title, message, redirectUrl = null) {
    triggerAlert(type, title, message, redirectUrl);
  }

  if (alertBtn && alertModal) {
    alertBtn.addEventListener('click', function () {
      alertModal.classList.remove('active');
      alertModal.style.display = 'none';
      if (window.alertRedirectUrl) {
        window.location.href = window.alertRedirectUrl;
      }
    });
  }

  // ==========================================================================
  // 1. MOOD SELECTOR & CATEGORY PILLS
  // ==========================================================================
  const moodBtns = document.querySelectorAll('.mood-btn');
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  const pillBtns = document.querySelectorAll('.pill-btn');
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ==========================================================================
  // 2. LOGIN FORM HANDLING
  // ==========================================================================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const submitBtn = loginForm.querySelector('button[type="submit"]') || loginForm.querySelector('.login-btn');

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      if (!email || !password) {
        showAlert('error', 'Login Failed!', 'Please fill in both email and password.');
        return;
      }

      let originalBtnText = 'Login';
      if (submitBtn) {
        originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Logging in...';
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          const userId = data.user.id || data.user._id;
          localStorage.setItem('userId', userId);
          localStorage.setItem('username', data.user.username);
          localStorage.setItem('email', data.user.email || email);

          showAlert('success', 'Welcome Back!', 'Login successful.', 'diary.html');
        } else {
          showAlert('error', 'Login Failed!', data.msg || 'Invalid email or password.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }
      } catch (error) {
        console.error('Login Error:', error);
        showAlert('error', 'Network Error!', 'Unable to connect to the server.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // ==========================================================================
  // 3. TERMS & CONDITIONS MODAL
  // ==========================================================================
  const termsModal = document.getElementById('termsModal');
  const openTerms = document.getElementById('openTerms');
  const closeTerms = document.getElementById('closeTerms');
  const agreeBtn = document.getElementById('agreeBtn');
  const termsCheckbox = document.getElementById('terms');

  if (openTerms && termsModal) {
    openTerms.addEventListener('click', () => termsModal.classList.add('active'));
  }

  if (closeTerms && termsModal) {
    closeTerms.addEventListener('click', () => termsModal.classList.remove('active'));
  }

  if (agreeBtn && termsModal) {
    agreeBtn.addEventListener('click', () => {
      if (termsCheckbox) termsCheckbox.checked = true;
      termsModal.classList.remove('active');
    });
  }

  // ==========================================================================
  // 4. REGISTRATION FORM HANDLING
  // ==========================================================================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const usernameInput = document.getElementById('username');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const confirmPasswordInput = document.getElementById('confirmPassword');
      const regSubmitBtn = registerForm.querySelector('button[type="submit"]');

      const username = usernameInput ? usernameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

      if (!username || !email || !password) {
        showAlert('error', 'Registration Failed!', 'Please fill in all required fields.');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('error', 'Registration Failed!', 'Passwords do not match.');
        return;
      }

      let originalRegBtnText = 'Register';
      if (regSubmitBtn) {
        originalRegBtnText = regSubmitBtn.innerHTML;
        regSubmitBtn.disabled = true;
        regSubmitBtn.innerHTML = 'Creating account...';
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
          showAlert('success', 'Registration Complete!', data.msg || 'Account created successfully!', 'index.html');
        } else {
          showAlert('error', 'Registration Failed!', data.msg || data.error || 'Error creating account.');
          if (regSubmitBtn) {
            regSubmitBtn.disabled = false;
            regSubmitBtn.innerHTML = originalRegBtnText;
          }
        }
      } catch (error) {
        console.error('Registration Error:', error);
        showAlert('error', 'Network Error!', 'Unable to connect to the server.');
        if (regSubmitBtn) {
          regSubmitBtn.disabled = false;
          regSubmitBtn.innerHTML = originalRegBtnText;
        }
      }
    });
  }

  // ==========================================================================
  // 5. DIARY FORM & API INTEGRATION (ADD OR UPDATE)
  // ==========================================================================
  const diaryForm = document.getElementById('diaryForm');
  if (diaryForm && window.location.pathname.includes('diary.html')) {
    
    const editId = localStorage.getItem('editId');
    if (editId) {
      document.getElementById('entryTitle').value = localStorage.getItem('editTitle') || '';
      document.getElementById('entryDate').value = localStorage.getItem('editDate') || '';
      document.getElementById('entryMood').value = localStorage.getItem('editMood') || 'Happy';
      document.getElementById('entryDetails').value = localStorage.getItem('editDetails') || '';

      const submitBtn = diaryForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Update Diary';
    }

    diaryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const titleInput = document.getElementById('entryTitle');
      const dateInput = document.getElementById('entryDate');
      const moodInput = document.getElementById('entryMood');
      const contentInput = document.getElementById('entryDetails');
      const diarySubmitBtn = diaryForm.querySelector('button[type="submit"]');

      const title = titleInput ? titleInput.value.trim() : '';
      const date = dateInput ? dateInput.value : '';
      const mood = moodInput ? moodInput.value : 'Happy';
      const details = contentInput ? contentInput.value.trim() : '';
      const userId = localStorage.getItem('userId');

      if (!userId) {
        showAlert('error', 'Session Expired!', 'Please login to save your entries.', 'login.html');
        return;
      }

      if (!title || !details) {
        showAlert('error', 'Validation Error', 'Please fill in both title and memory details.');
        return;
      }

      let originalDiaryBtnText = 'Keep a Diary';
      if (diarySubmitBtn) {
        originalDiaryBtnText = diarySubmitBtn.innerHTML;
        diarySubmitBtn.disabled = true;
        diarySubmitBtn.innerHTML = 'Saving...';
      }

      try {
        const currentEditId = localStorage.getItem('editId');
        const url = currentEditId ? `${API_BASE_URL}/api/diary/update/${currentEditId}` : `${API_BASE_URL}/api/diary/add`;
        const method = currentEditId ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
          },
          body: JSON.stringify({ userId, title, date, mood, details })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.removeItem('editId');
          localStorage.removeItem('editTitle');
          localStorage.removeItem('editDate');
          localStorage.removeItem('editMood');
          localStorage.removeItem('editDetails');

          showAlert('success', 'Saved!', 'Your diary entry has been successfully saved!', 'tasks.html');
        } else {
          showAlert('error', 'Error!', data.message || data.error || 'Failed to save entry.');
          if (diarySubmitBtn) {
            diarySubmitBtn.disabled = false;
            diarySubmitBtn.innerHTML = originalDiaryBtnText;
          }
        }
      } catch (error) {
        console.error('Diary Save/Update Error:', error);
        showAlert('error', 'Network Error!', 'Failed to connect to backend database.');
        if (diarySubmitBtn) {
          diarySubmitBtn.disabled = false;
          diarySubmitBtn.innerHTML = originalDiaryBtnText;
        }
      }
    });
  }
// ==========================================================================
  // 6. FETCH & DISPLAY TASKS (FULL CONTAINER GRID LAYOUT)
  // ==========================================================================
  const taskGrid = document.querySelector('.grid-dashboard') || document.querySelector('main') || document.body;
  if (window.location.pathname.includes('tasks.html')) {
    async function fetchTasks() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/diary/my-entries`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
          }
        });

        const tasks = await response.json();

        if (response.ok && Array.isArray(tasks)) {
          // Tafuta eneo sahihi la kuweka taarifa au tengeneza moja kwa moja kama halipo
          let containerArea = document.getElementById('dynamicTasksContainer');
          if (!containerArea) {
            containerArea = document.createElement('div');
            containerArea.id = 'dynamicTasksContainer';
            containerArea.style.cssText = 'max-width: 1100px; margin: 20px auto; padding: 0 20px;';
            
            if (taskGrid && taskGrid !== document.body) {
              taskGrid.innerHTML = '';
              taskGrid.appendChild(containerArea);
            } else {
              document.body.appendChild(containerArea);
            }
          }

          containerArea.innerHTML = '';

          if (tasks.length > 0) {
            // Kupanga tarehe kuanzia mpya kwenda ya zamani
            tasks.sort((a, b) => new Date(b.date) - new Date(a.date));

            const groupsMap = new Map();
            tasks.forEach(task => {
              const taskDate = task.date ? task.date.split('T')[0] : 'No Date';
              if (!groupsMap.has(taskDate)) {
                groupsMap.set(taskDate, []);
              }
              groupsMap.get(taskDate).push(task);
            });

            groupsMap.forEach((dateTasks, dateStr) => {
              const dateSection = document.createElement('div');
              dateSection.style.marginBottom = '30px';

              const dateHeader = document.createElement('div');
              dateHeader.style.cssText = 'font-weight: bold; font-size: 1rem; margin-bottom: 15px; color: #1e293b; background: #f1f5f9; padding: 10px 15px; border-radius: 8px;';
              
              let displayDateText = dateStr;
              const todayStr = new Date().toISOString().split('T')[0];
              if (dateStr === todayStr) {
                displayDateText = `Today - ${dateStr}`;
              }

              dateHeader.textContent = `📅 ${displayDateText}`;
              dateSection.appendChild(dateHeader);

              // Grid inayoweka kadi zikae kushoto na kulia (Responsive Cards Grid)
              const cardsGrid = document.createElement('div');
              cardsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;';

              dateTasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.className = 'card';
                taskCard.style.cssText = 'background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;';

                taskCard.innerHTML = `
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <strong style="font-size: 1.1rem; color: #0f172a;">${task.title}</strong>
                      <span style="font-size: 0.75rem; background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 6px; font-weight: 600;">Mood: ${task.mood || 'Happy'}</span>
                    </div>
                    <p style="font-size: 0.9rem; color: #475569; line-height: 1.5; margin-bottom: 15px; word-break: break-word;">${task.details || task.content || ''}</p>
                  </div>
                  
                  <div style="display: flex; gap: 10px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                    <button class="update-btn" style="flex: 1; padding: 8px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">Update</button>
                    <button class="delete-btn" style="flex: 1; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">Delete</button>
                  </div>
                `;

                taskCard.querySelector('.update-btn').addEventListener('click', () => {
                  editDiary(task._id, task.title, task.date, task.mood, task.details || task.content || '');
                });

                taskCard.querySelector('.delete-btn').addEventListener('click', () => {
                  deleteDiary(task._id);
                });

                cardsGrid.appendChild(taskCard);
              });

              dateSection.appendChild(cardsGrid);
              containerArea.appendChild(dateSection);
            });
          } else {
            containerArea.innerHTML = '<p style="text-align:center; color:#64748b; padding: 40px;">No diary entries found. Create one!</p>';
          }
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    }

    fetchTasks();
  }
  // ==========================================================================
  // 7. PROFILE MODAL & USER INFO HANDLING
  // ==========================================================================
  const profileIcon = document.getElementById('profileIcon');
  const profileModal = document.getElementById('profileModal');
  const closeProfile = document.getElementById('closeProfile');
  const logoutBtn = document.getElementById('logoutBtn');
  
  const profileUsername = document.getElementById('profileUsername');
  const profileEmail = document.getElementById('profileEmail');

  if (profileIcon && profileModal) {
    profileIcon.addEventListener('click', () => {
      const storedUsername = localStorage.getItem('username') || 'Guest User';
      const storedEmail = localStorage.getItem('email') || 'No email saved';

      if (profileUsername) profileUsername.textContent = storedUsername;
      if (profileEmail) profileEmail.textContent = storedEmail;

      profileModal.classList.add('active');
    });
  }

  if (closeProfile && profileModal) {
    closeProfile.addEventListener('click', () => {
      profileModal.classList.remove('active');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }

  // ==========================================================================
  // 8. GOALS TRACKER LOGIC (100% ENGLISH MODAL)
  // ==========================================================================
  if (window.location.pathname.includes('goals.html')) {
    
    let customModal = document.getElementById('customGoalModal');
    if (!customModal) {
      customModal = document.createElement('div');
      customModal.id = 'customGoalModal';
      customModal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center;';
      
      customModal.innerHTML = `
        <div style="background:#fff; width:90%; max-width:400px; padding:30px; border-radius:20px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.15); font-family:'Outfit', sans-serif; position:relative;">
          
          <div style="width:60px; height:60px; background:#fff7ed; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px auto;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          </div>

          <h3 id="goalModalTitle" style="margin:0 0 10px 0; font-size:1.4rem; color:#1e293b; font-weight:700;">Add New Goal</h3>
          <p id="goalModalDesc" style="margin:0 0 20px 0; font-size:0.9rem; color:#64748b;">Please enter your goal details below.</p>
          
          <input type="text" id="modalGoalInput" placeholder="Type your goal here..." style="width:100%; padding:12px 15px; border:1px solid #cbd5e1; border-radius:10px; font-size:0.95rem; margin-bottom:20px; outline:none; box-sizing:border-box;">
          
          <div style="display:flex; gap:10px; justify-content:center;">
            <button id="modalCancelBtn" style="flex:1; padding:12px; background:#e2e8f0; color:#475569; border:none; border-radius:12px; font-weight:600; cursor:pointer;">Cancel</button>
            <button id="modalOkBtn" style="flex:1; padding:12px; background:#d97706; color:white; border:none; border-radius:12px; font-weight:600; cursor:pointer;">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(customModal);
    }

    let targetArea = document.getElementById('goalsListArea');
    if (!targetArea) {
      targetArea = document.createElement('div');
      targetArea.id = 'goalsListArea';
      targetArea.style.cssText = 'max-width: 800px; margin: 20px auto; padding: 0 20px;';
      document.querySelector('main')?.appendChild(targetArea) || document.body.appendChild(targetArea);
    }

    // Kuunganisha kitufe cha "Add Goal" kupitia ID yake sahihi kutoka HTML
    const addGoalTriggerBtn = document.getElementById('addGoalBtn');
    
    if (addGoalTriggerBtn) {
      addGoalTriggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openGoalModal('Add New Goal', '', async (newTitle, okBtn) => {
          if (newTitle && newTitle.trim() !== '') {
            const userId = localStorage.getItem('userId');
            const currentDate = new Date().toISOString().split('T')[0];

            let originalOkText = 'OK';
            if (okBtn) {
              originalOkText = okBtn.textContent;
              okBtn.disabled = true;
              okBtn.textContent = 'Adding...';
            }

            try {
              const response = await fetch(`${API_BASE_URL}/api/goals/add`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
                },
                body: JSON.stringify({ userId, title: newTitle.trim(), date: currentDate, completed: false })
              });

              if (response.ok) {
                customModal.style.display = 'none';
                await fetchGoals();
              } else {
                const errData = await response.json();
                triggerAlert('error', 'Failed', errData.message || 'Failed to add goal.');
              }
            } catch (error) {
              console.error('Add Goal Error:', error);
              triggerAlert('error', 'Error', 'Network connection error.');
            } finally {
              if (okBtn) {
                okBtn.disabled = false;
                okBtn.textContent = originalOkText;
              }
            }
          }
        });
      });
    }

    async function fetchGoals() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/goals/my-goals`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
          }
        });

        const goals = await response.json();

        if (response.ok && Array.isArray(goals)) {
          targetArea.innerHTML = '';

          goals.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

          const groupsMap = new Map();
          goals.forEach(goal => {
            const rawDate = goal.date || goal.createdAt;
            const goalDate = rawDate ? rawDate.split('T')[0] : 'No Date';
            if (!groupsMap.has(goalDate)) {
              groupsMap.set(goalDate, []);
            }
            groupsMap.get(goalDate).push(goal);
          });

          groupsMap.forEach((dateGoals, dateStr) => {
            const dateSection = document.createElement('div');
            dateSection.style.marginBottom = '20px';

            const dateHeader = document.createElement('div');
            dateHeader.style.cssText = 'font-weight: bold; font-size: 0.95rem; margin-bottom: 8px; color: #333; background: #f1f5f9; padding: 8px 12px; border-radius: 6px;';
            
            let displayDateText = dateStr;
            const todayStr = new Date().toISOString().split('T')[0];
            if (dateStr === todayStr) {
              displayDateText = `Today - ${dateStr}`;
            }

            dateHeader.textContent = `📅 ${displayDateText}`;
            dateSection.appendChild(dateHeader);

            dateGoals.forEach(goal => {
              const goalCard = document.createElement('div');
              goalCard.className = 'card';
              goalCard.style.cssText = `margin-bottom: 10px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; ${goal.completed ? 'opacity: 0.6; background: #f8fafc;' : ''}`;

              goalCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                  <input type="checkbox" class="complete-checkbox" ${goal.completed ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                  <div>
                    <h4 style="margin: 0; font-size: 1rem; ${goal.completed ? 'text-decoration: line-through; color: #888;' : 'color: #1e293b;'}">${goal.title || goal.goalText}</h4>
                    <span style="font-size: 0.75rem; color: #64748b;">Saved on: ${goal.date || 'Today'}</span>
                  </div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="update-goal-btn" style="padding: 4px 8px; background: #ffc107; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Edit</button>
                  <button class="delete-goal-btn" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Delete</button>
                </div>
              `;

              const checkbox = goalCard.querySelector('.complete-checkbox');
              checkbox.addEventListener('change', async () => {
                try {
                  await fetch(`${API_BASE_URL}/api/goals/update/${goal._id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
                    },
                    body: JSON.stringify({ completed: checkbox.checked })
                  });
                  fetchGoals();
                } catch (err) {
                  console.error('Error updating status:', err);
                }
              });

              goalCard.querySelector('.delete-goal-btn').addEventListener('click', async () => {
                try {
                  const res = await fetch(`${API_BASE_URL}/api/goals/delete/${goal._id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
                  });
                  if (res.ok) fetchGoals();
                } catch (err) {
                  console.error('Delete Goal Error:', err);
                }
              });

              goalCard.querySelector('.update-goal-btn').addEventListener('click', () => {
                openGoalModal('Edit Goal', goal.title || goal.goalText, async (newTitle) => {
                  if (newTitle && newTitle.trim() !== '') {
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/goals/update/${goal._id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
                        },
                        body: JSON.stringify({ title: newTitle.trim() })
                      });
                      if (res.ok) {
                        customModal.style.display = 'none';
                        fetchGoals();
                      }
                    } catch (err) {
                      console.error('Update Goal Error:', err);
                    }
                  }
                });
              });

              dateSection.appendChild(goalCard);
            });

            targetArea.appendChild(dateSection);
          });
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    }

    function openGoalModal(titleText, initialValue = '', callback) {
      document.getElementById('goalModalTitle').textContent = titleText;
      const inputField = document.getElementById('modalGoalInput');
      inputField.value = initialValue;
      customModal.style.display = 'flex';
      inputField.focus();

      const okBtn = document.getElementById('modalOkBtn');
      const cancelBtn = document.getElementById('modalCancelBtn');

      const newOkBtn = okBtn.cloneNode(true);
      const newCancelBtn = cancelBtn.cloneNode(true);
      okBtn.parentNode.replaceChild(newOkBtn, okBtn);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

      newOkBtn.addEventListener('click', () => {
        const val = inputField.value;
        if (callback) callback(val, newOkBtn);
      });

      newCancelBtn.addEventListener('click', () => {
        customModal.style.display = 'none';
      });
    }

    fetchGoals();
  }
});