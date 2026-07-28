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
  // 6. FETCH & DISPLAY TASKS (ON TASKS PAGE WITH UPDATE & DELETE BUTTONS)
  // ==========================================================================
  const taskGrid = document.querySelector('.grid-dashboard');
  if (taskGrid && window.location.pathname.includes('tasks.html')) {
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
          const targetColumn = taskGrid.querySelector('.col-4');
          
          if (targetColumn && tasks.length > 0) {
            targetColumn.innerHTML = ''; 
            tasks.forEach(task => {
              const taskCard = document.createElement('div');
              taskCard.className = 'card';
              taskCard.style.marginBottom = '12px';
              taskCard.style.padding = '15px';
              taskCard.style.border = '1px solid #ddd';
              taskCard.style.borderRadius = '8px';

              taskCard.innerHTML = `
                <strong>${task.title}</strong>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-top:6px;">Mood: ${task.mood || 'Happy'} | Date: ${task.date || 'Today'}</p>
                <p style="font-size:0.85rem; color:#444; margin-top:6px;">${task.details || task.content || ''}</p>
                
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                  <button class="update-btn" style="padding: 5px 10px; background: #ffc107; border: none; border-radius: 4px; cursor: pointer;">Update</button>
                  <button class="delete-btn" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                </div>
              `;

              taskCard.querySelector('.update-btn').addEventListener('click', () => {
                editDiary(task._id, task.title, task.date, task.mood, task.details || task.content || '');
              });

              taskCard.querySelector('.delete-btn').addEventListener('click', () => {
                deleteDiary(task._id);
              });

              targetColumn.appendChild(taskCard);
            });
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

});
// ==========================================================================
  // 6. FETCH & DISPLAY TASKS (STRICT DESCENDING DATE GROUPS)
  // ==========================================================================
  const taskGrid = document.querySelector('.grid-dashboard');
  if (taskGrid && window.location.pathname.includes('tasks.html')) {
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
          const targetColumn = taskGrid.querySelector('.col-4');
          
          if (targetColumn && tasks.length > 0) {
            targetColumn.innerHTML = ''; 

            // 1. Panga entries zote kuanzia tarehe ya hivi karibuni kwenda nyuma (Descending)
            tasks.sort((a, b) => new Date(b.date) - new Date(a.date));

            // 2. Tumia Map / Array ili kulinda mtiririko wa tarehe jinsi ulivyopangwa
            const groupsMap = new Map();
            
            tasks.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(task => {
              const taskDate = task.date ? task.date.split('T')[0] : 'No Date';
              if (!groupsMap.has(taskDate)) {
                groupsMap.set(taskDate, []);
              }
              groupsMap.get(taskDate).push(task);
            });

            // 3. Kuchora makundi kwenye ukurasa kwa kufuata ule mpangilio wa Map (Descending)
            groupsMap.forEach((dateTasks, dateStr) => {
              const dateSection = document.createElement('div');
              dateSection.style.marginBottom = '20px';

              // Lebo ya tarehe
              const dateHeader = document.createElement('div');
              dateHeader.style.cssText = 'font-weight: bold; font-size: 0.95rem; margin-bottom: 8px; color: #333; background: #f1f5f9; padding: 8px 12px; border-radius: 6px;';
              
              let displayDateText = dateStr;
              const todayStr = new Date().toISOString().split('T')[0];
              if (dateStr === todayStr) {
                displayDateText = `Today - ${dateStr}`;
              }

              dateHeader.textContent = `📅 ${displayDateText}`;
              dateSection.appendChild(dateHeader);

              // Kuweka kadi za diary chini ya tarehe husika
              dateTasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.className = 'card';
                taskCard.style.cssText = 'margin-bottom: 10px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);';

                taskCard.innerHTML = `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>${task.title}</strong>
                    <span style="font-size: 0.75rem; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Mood: ${task.mood || 'Happy'}</span>
                  </div>
                  <p style="font-size:0.85rem; color:#444; margin-top:8px;">${task.details || task.content || ''}</p>
                  
                  <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <button class="update-btn" style="padding: 4px 10px; background: #ffc107; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Update</button>
                    <button class="delete-btn" style="padding: 4px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Delete</button>
                  </div>
                `;

                taskCard.querySelector('.update-btn').addEventListener('click', () => {
                  editDiary(task._id, task.title, task.date, task.mood, task.details || task.content || '');
                });

                taskCard.querySelector('.delete-btn').addEventListener('click', () => {
                  deleteDiary(task._id);
                });

                dateSection.appendChild(taskCard);
              });

              targetColumn.appendChild(dateSection);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    }

    fetchTasks();
  }
  // ==========================================================================
  // 8. GOALS TRACKER LOGIC (INLINE FORM INSTEAD OF BROWSER PROMPT)
  // ==========================================================================
  const goalsContainer = document.querySelector('.grid-dashboard') || document.body;
  if (window.location.pathname.includes('goals.html')) {
    
    // 1. Kutengeneza fomu ya kuandikia goal hapo hapo kwenye ukurasa (kama haipo tayari)
    let targetArea = document.getElementById('goalsListArea');
    if (!targetArea) {
      targetArea = document.createElement('div');
      targetArea.id = 'goalsListArea';
      targetArea.style.cssText = 'max-width: 800px; margin: 20px auto; padding: 0 20px;';
      document.querySelector('main')?.appendChild(targetArea) || document.body.appendChild(targetArea);
    }

    // Weka eneo la fomu ya kuongezea goal chini ya kitufe cha Add Goal
    const dashboardGrid = document.querySelector('.grid-dashboard');
    let formWrapper = document.getElementById('inlineGoalForm');
    if (!formWrapper && dashboardGrid) {
      formWrapper = document.createElement('div');
      formWrapper.id = 'inlineGoalForm';
      formWrapper.style.cssText = 'grid-column: 1 / -1; margin-top: 15px; display: none; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05);';
      formWrapper.innerHTML = `
        <input type="text" id="goalInputText" placeholder="Andika lengo lako jipya hapa..." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; margin-bottom: 10px; outline: none;">
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button id="cancelGoalBtn" style="padding: 6px 14px; background: #94a3b8; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button id="saveGoalBtn" style="padding: 6px 14px; background: var(--brand-primary, #d97706); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Save Goal</button>
        </div>
      `;
      dashboardGrid.appendChild(formWrapper);
    }

    // Kitendakazi cha kuleta malengo kutoka Backend
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

          // Panga malengo kuanzia tarehe ya hivi karibuni (Descending Order)
          goals.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

          // Panga kimakundi kulingana na tarehe
          const groupsMap = new Map();
          goals.forEach(goal => {
            const rawDate = goal.date || goal.createdAt;
            const goalDate = rawDate ? rawDate.split('T')[0] : 'No Date';
            if (!groupsMap.has(goalDate)) {
              groupsMap.set(goalDate, []);
            }
            groupsMap.get(goalDate).push(goal);
          });

          // Kuchora makundi ya tarehe na malengo yake
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

              // Kitufe cha kuweka tiki (Complete / Uncomplete)
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

              // Kifutio cha Lengo (Delete) - Hapa tumetumia custom confirm badala ya popup ya browser kama iliwezekana, au tunafuta moja kwa moja
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

              // Kitufe cha Edit / Update Lengo (Hapa tunatumia inline input badala ya prompt)
              goalCard.querySelector('.update-goal-btn').addEventListener('click', () => {
                const currentTitle = goal.title || goal.goalText;
                const newTitle = prompt('Update your goal:', currentTitle); // Unaweza kubadilisha hii pia kama hutaki kabisa prompt
                if (newTitle !== null && newTitle.trim() !== '') {
                  updateGoalText(goal._id, newTitle.trim());
                }
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

    async function updateGoalText(id, title) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/goals/update/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
          },
          body: JSON.stringify({ title })
        });
        if (res.ok) fetchGoals();
      } catch (err) {
        console.error('Update Goal Error:', err);
      }
    }

    // Kusimamia kitufe cha "Add Goal" kufungua fomu ya ndani
    const addGoalBtn = document.getElementById('addGoalBtn');
    const goalInputText = document.getElementById('goalInputText');
    const saveGoalBtn = document.getElementById('saveGoalBtn');
    const cancelGoalBtn = document.getElementById('cancelGoalBtn');

    if (addGoalBtn && formWrapper) {
      addGoalBtn.addEventListener('click', () => {
        formWrapper.style.display = formWrapper.style.display === 'none' ? 'block' : 'none';
        if (goalInputText) goalInputText.focus();
      });
    }

    if (cancelGoalBtn && formWrapper) {
      cancelGoalBtn.addEventListener('click', () => {
        formWrapper.style.display = 'none';
        if (goalInputText) goalInputText.value = '';
      });
    }

    if (saveGoalBtn && goalInputText) {
      saveGoalBtn.addEventListener('click', async () => {
        const goalTitle = goalInputText.value.trim();
        if (!goalTitle) return;

        const userId = localStorage.getItem('userId');
        const currentDate = new Date().toISOString().split('T')[0];

        try {
          const response = await fetch(`${API_BASE_URL}/api/goals/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
            },
            body: JSON.stringify({ userId, title: goalTitle, date: currentDate, completed: false })
          });

          if (response.ok) {
            goalInputText.value = '';
            formWrapper.style.display = 'none';
            fetchGoals();
          } else {
            alert('Failed to add goal.');
          }
        } catch (err) {
          console.error('Add Goal Error:', err);
        }
      });
    }

    fetchGoals();
  }