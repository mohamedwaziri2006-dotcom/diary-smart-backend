/* ==========================================================================
   DIARY SMART — FRONTEND LOGIC (CONNECTED TO RENDER BACKEND)
   ========================================================================== */

// Base URL for your live Render Backend
const API_BASE_URL = 'https://diary-smart-backend.onrender.com';

// Global helper for alerts matching the Modal IDs
function triggerAlert(type, title, message, redirectUrl = null) {
  const alertModal = document.getElementById('diaryAlertModal');
  const alertTitle = document.getElementById('diaryAlertTitle');
  const alertMessage = document.getElementById('diaryAlertMessage');
  const statusIconCircle = alertModal ? alertModal.querySelector('.status-icon-circle') : null;

  if (!alertModal) {
    console.warn("Alert modal element not found in HTML!");
    if (redirectUrl) window.location.href = redirectUrl;
    return;
  }

  window.alertRedirectUrl = redirectUrl;
  
  if (statusIconCircle) {
    if (type === 'success') {
      statusIconCircle.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>`;
    } else {
      statusIconCircle.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>`;
    }
  }

  if (alertTitle) alertTitle.textContent = title;
  if (alertMessage) alertMessage.textContent = message;
  
  alertModal.classList.add('active');
}

// Global functions for Update & Delete (Diary)
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
  const alertModal = document.getElementById('diaryAlertModal');
  const alertBtn = document.getElementById('diaryAlertCloseBtn');

  if (alertBtn && alertModal) {
    // Remove any existing listeners by cloning or direct handling
    alertBtn.replaceWith(alertBtn.cloneNode(true));
    const freshAlertBtn = document.getElementById('diaryAlertCloseBtn');

    freshAlertBtn.addEventListener('click', function (e) {
      e.preventDefault();
      alertModal.classList.remove('active');
      if (window.alertRedirectUrl) {
        const targetUrl = window.alertRedirectUrl;
        window.alertRedirectUrl = null;
        window.location.href = targetUrl;
      }
    });

    alertModal.addEventListener('click', (e) => {
      if (e.target === alertModal) {
        alertModal.classList.remove('active');
        if (window.alertRedirectUrl) {
          const targetUrl = window.alertRedirectUrl;
          window.alertRedirectUrl = null;
          window.location.href = targetUrl;
        }
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
        triggerAlert('error', 'Login Failed!', 'Please fill in both email and password.');
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

          triggerAlert('success', 'Welcome Back!', 'Login successful.', 'diary.html');
        } else {
          triggerAlert('error', 'Login Failed!', data.msg || data.message || 'Invalid email or password.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }
      } catch (error) {
        console.error('Login Error:', error);
        triggerAlert('error', 'Network Error!', 'Unable to connect to the server.');
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
        triggerAlert('error', 'Registration Failed!', 'Please fill in all required fields.');
        return;
      }

      if (password !== confirmPassword) {
        triggerAlert('error', 'Registration Failed!', 'Passwords do not match.');
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
          triggerAlert('success', 'Registration Complete!', data.msg || data.message || 'Account created successfully!', 'index.html');
        } else {
          triggerAlert('error', 'Registration Failed!', data.msg || data.message || 'Error creating account.');
          if (regSubmitBtn) {
            regSubmitBtn.disabled = false;
            regSubmitBtn.innerHTML = originalRegBtnText;
          }
        }
      } catch (error) {
        console.error('Registration Error:', error);
        triggerAlert('error', 'Network Error!', 'Unable to connect to the server.');
        if (regSubmitBtn) {
          regSubmitBtn.disabled = false;
          regSubmitBtn.innerHTML = originalRegBtnText;
        }
      }
    });
  }

  // ==========================================================================
  // 5. SETTINGS PAGE LOGIC
  // ==========================================================================
  if (window.location.pathname.includes('settings.html')) {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'index.html';
      return;
    }

    const nameInput = document.getElementById('name') || document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword') || document.getElementById('confirm-password');
    const settingsForm = document.getElementById('settingsForm');

    async function fetchUserProfile() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
        const userData = await response.json();
        if (response.ok) {
          if (nameInput) nameInput.value = userData.username || '';
          if (emailInput) emailInput.value = userData.email || '';
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }

    fetchUserProfile();

    if (settingsForm) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        if (password && password !== confirmPassword) {
          triggerAlert('error', 'Validation Error', 'New passwords do not match.');
          return;
        }

        const saveChangesBtn = settingsForm.querySelector('button[type="submit"]');
        let originalSaveBtnText = saveChangesBtn ? saveChangesBtn.innerHTML : 'Save Changes';
        if (saveChangesBtn) {
          saveChangesBtn.disabled = true;
          saveChangesBtn.innerHTML = password ? 'Updating...' : 'Saving...';
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ username, email, password })
          });

          const data = await response.json();
          if (response.ok) {
            if (username) localStorage.setItem('username', username);
            if (email) localStorage.setItem('email', email);
            
            if (password) {
              triggerAlert('success', 'Password Updated!', 'Your password has been changed successfully.');
            } else {
              triggerAlert('success', 'Profile Updated!', data.message || 'Profile updated successfully!');
            }

            if (passwordInput) passwordInput.value = '';
            if (confirmPasswordInput) confirmPasswordInput.value = '';
          } else {
            triggerAlert('error', 'Update Failed', data.message || 'Failed to update profile.');
          }
        } catch (err) {
          console.error('Profile Update Error:', err);
          triggerAlert('error', 'Error', 'Network connection error.');
        } finally {
          if (saveChangesBtn) {
            saveChangesBtn.disabled = false;
            saveChangesBtn.innerHTML = originalSaveBtnText;
          }
        }
      });
    }
  }

  // ==========================================================================
  // 6. DIARY FORM & API INTEGRATION (ADD OR UPDATE)
  // ==========================================================================
  const diaryForm = document.getElementById('diaryForm');
  if (diaryForm && window.location.pathname.includes('diary.html')) {
    
    const entryDateInput = document.getElementById('entryDate');
    const todayStr = new Date().toISOString().split('T')[0];

    const editId = localStorage.getItem('editId');
    if (editId) {
      document.getElementById('entryTitle').value = localStorage.getItem('editTitle') || '';
      if (entryDateInput) entryDateInput.value = localStorage.getItem('editDate') ? localStorage.getItem('editDate').split('T')[0] : todayStr;
      document.getElementById('entryMood').value = localStorage.getItem('editMood') || 'Happy';
      document.getElementById('entryDetails').value = localStorage.getItem('editDetails') || '';

      const submitBtn = diaryForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Update Diary';
    } else {
      if (entryDateInput) {
        entryDateInput.value = todayStr;
      }
    }

    diaryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const titleInput = document.getElementById('entryTitle');
      const dateInput = document.getElementById('entryDate');
      const moodInput = document.getElementById('entryMood');
      const contentInput = document.getElementById('entryDetails');
      const diarySubmitBtn = diaryForm.querySelector('button[type="submit"]');

      const title = titleInput ? titleInput.value.trim() : '';
      const date = dateInput ? dateInput.value : todayStr;
      const mood = moodInput ? moodInput.value : 'Happy';
      const details = contentInput ? contentInput.value.trim() : '';
      const userId = localStorage.getItem('userId');

      if (!userId) {
        triggerAlert('error', 'Session Expired!', 'Please login to save your entries.', 'index.html');
        return;
      }

      if (!title || !details) {
        triggerAlert('error', 'Validation Error', 'Please fill in both title and memory details.');
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

          triggerAlert('success', 'Saved!', 'Your diary entry has been successfully saved!', 'tasks.html');
        } else {
          triggerAlert('error', 'Error!', data.message || data.error || 'Failed to save entry.');
          if (diarySubmitBtn) {
            diarySubmitBtn.disabled = false;
            diarySubmitBtn.innerHTML = originalDiaryBtnText;
          }
        }
      } catch (error) {
        console.error('Diary Save/Update Error:', error);
        triggerAlert('error', 'Network Error!', 'Failed to connect to backend database.');
        if (diarySubmitBtn) {
          diarySubmitBtn.disabled = false;
          diarySubmitBtn.innerHTML = originalDiaryBtnText;
        }
      }
    });
  }

  // ==========================================================================
  // 7. FETCH & DISPLAY TASKS (FULL CONTAINER GRID LAYOUT)
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
  // 8. PROFILE MODAL & USER INFO HANDLING
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
  // 9. GOALS TRACKER LOGIC
  // ==========================================================================
  if (window.location.pathname.includes('goals.html')) {
    
    const goalEntryForm = document.getElementById('goalEntryForm');
    const goalTitleInput = document.getElementById('goalTitleInput');
    const goalDateInput = document.getElementById('goalDateInput');
    const goalDetailsInput = document.getElementById('goalDetailsInput');
    const editGoalIdField = document.getElementById('editGoalId');
    const goalSubmitBtn = document.getElementById('goalSubmitBtn');
    const goalCancelEditBtn = document.getElementById('goalCancelEditBtn');
    const goalFormHeading = document.getElementById('goalFormHeading');
    const targetArea = document.getElementById('goalsListArea');

    const todayFormatted = new Date().toISOString().split('T')[0];
    if (goalDateInput && !goalDateInput.value) {
      goalDateInput.value = todayFormatted;
    }

    if (goalEntryForm) {
      goalEntryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = goalTitleInput.value.trim();
        const date = goalDateInput.value;
        const details = goalDetailsInput.value.trim();
        const editId = editGoalIdField.value;
        const userId = localStorage.getItem('userId');

        if (!userId) {
          triggerAlert('error', 'Session Expired!', 'Please login to save goals.', 'index.html');
          return;
        }

        if (!title) {
          triggerAlert('error', 'Validation Error', 'Please enter a goal title.');
          return;
        }

        let originalBtnText = goalSubmitBtn.textContent;
        goalSubmitBtn.disabled = true;
        goalSubmitBtn.textContent = 'Saving...';

        try {
          const url = editId ? `${API_BASE_URL}/api/goals/update/${editId}` : `${API_BASE_URL}/api/goals/add`;
          const method = editId ? 'PUT' : 'POST';

          const response = await fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
            },
            body: JSON.stringify({ userId, title, date, details })
          });

          if (response.ok) {
            goalEntryForm.reset();
            editGoalIdField.value = '';
            goalSubmitBtn.textContent = 'Save Goal';
            goalFormHeading.textContent = 'Set New Goal.';
            if (goalCancelEditBtn) goalCancelEditBtn.style.display = 'none';
            goalDateInput.value = new Date().toISOString().split('T')[0];

            fetchGoals();
          } else {
            const errData = await response.json();
            triggerAlert('error', 'Failed', errData.message || 'Failed to save goal.');
          }
        } catch (error) {
          console.error('Goal Save Error:', error);
          triggerAlert('error', 'Error', 'Network connection error.');
        } finally {
          goalSubmitBtn.disabled = false;
          goalSubmitBtn.textContent = originalBtnText;
        }
      });
    }

    if (goalCancelEditBtn) {
      goalCancelEditBtn.addEventListener('click', () => {
        goalEntryForm.reset();
        editGoalIdField.value = '';
        goalSubmitBtn.textContent = 'Save Goal';
        goalFormHeading.textContent = 'Set New Goal.';
        goalCancelEditBtn.style.display = 'none';
        goalDateInput.value = new Date().toISOString().split('T')[0];
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
          if (!targetArea) return;
          targetArea.innerHTML = '';

          if (goals.length === 0) {
            targetArea.innerHTML = '<p style="color:#64748b; text-align:center; padding: 20px;">No goals found. Set one above!</p>';
            return;
          }

          goals.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

          goals.forEach(goal => {
            const goalCard = document.createElement('div');
            goalCard.className = 'card';
            goalCard.style.cssText = `margin-bottom: 12px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: flex-start; ${goal.completed ? 'opacity: 0.6; background: #f8fafc;' : ''}`;

            goalCard.innerHTML = `
              <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1;">
                <input type="checkbox" class="complete-checkbox" ${goal.completed ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer; margin-top: 3px;">
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 4px 0; font-size: 1rem; ${goal.completed ? 'text-decoration: line-through; color: #888;' : 'color: #1e293b;'}">${goal.title || goal.goalText}</h4>
                  ${goal.details ? `<p style="margin: 0 0 6px 0; font-size: 0.85rem; color: #475569; word-break: break-word;">${goal.details}</p>` : ''}
                  <span style="font-size: 0.75rem; color: #64748b;">Target: ${goal.date ? goal.date.split('T')[0] : 'Today'}</span>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="update-goal-btn" style="padding: 6px 12px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">Edit</button>
                <button class="delete-goal-btn" style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">Delete</button>
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
              editGoalIdField.value = goal._id;
              goalTitleInput.value = goal.title || goal.goalText || '';
              goalDateInput.value = goal.date ? goal.date.split('T')[0] : todayFormatted;
              goalDetailsInput.value = goal.details || '';
              goalSubmitBtn.textContent = 'Update Goal';
              goalFormHeading.textContent = 'Update Goal.';
              if (goalCancelEditBtn) goalCancelEditBtn.style.display = 'inline-block';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            targetArea.appendChild(goalCard);
          });
        }
      } catch (err) {
        console.error('Error fetching goals:', err);
      }
    }

    fetchGoals();
  }

});