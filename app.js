// BiasBounty Application JavaScript

// Mock Data
const mockData = {
  sampleUsers: [
    {"id": 1, "name": "Alex Chen", "email": "alex@example.com", "points": 2450, "rank": 1, "joinDate": "2024-01-15", "contributions": 47},
    {"id": 2, "name": "Sarah Johnson", "email": "sarah@example.com", "points": 2180, "rank": 2, "joinDate": "2024-02-03", "contributions": 39},
    {"id": 3, "name": "Michael Rodriguez", "email": "michael@example.com", "points": 1920, "rank": 3, "joinDate": "2024-01-28", "contributions": 34},
    {"id": 4, "name": "Emily Watson", "email": "emily@example.com", "points": 1750, "rank": 4, "joinDate": "2024-02-15", "contributions": 28},
    {"id": 5, "name": "David Kim", "email": "david@example.com", "points": 1680, "rank": 5, "joinDate": "2024-03-01", "contributions": 25}
  ],
  sampleDatasets: [
    {"id": 1, "name": "Hiring Algorithm Dataset", "type": "Classification Model", "uploadDate": "2024-08-15", "biasScore": 73, "status": "Analyzed", "uploader": "Community Member", "description": "Resume screening algorithm showing gender bias patterns"},
    {"id": 2, "name": "Loan Approval Model", "type": "ML Model", "uploadDate": "2024-08-20", "biasScore": 45, "status": "Under Review", "uploader": "Anonymous User", "description": "Credit scoring model with moderate bias indicators"},
    {"id": 3, "name": "Job Recommendation System", "type": "Recommendation Engine", "uploadDate": "2024-08-18", "biasScore": 82, "status": "Flagged", "uploader": "Research Team", "description": "Career platform showing age discrimination patterns"}
  ],
  biasTypes: ["Gender Bias", "Racial Bias", "Age Bias", "Socioeconomic Bias", "Geographic Bias", "Educational Bias"],
  recentReports: [
    {"id": 1, "datasetId": 1, "reporterId": 2, "biasType": "Gender Bias", "severity": "High", "description": "Algorithm shows 68% preference for male candidates in technical roles", "date": "2024-08-21", "points": 150},
    {"id": 2, "datasetId": 3, "reporterId": 1, "biasType": "Age Bias", "severity": "Medium", "description": "System under-represents opportunities for candidates over 45", "date": "2024-08-20", "points": 100}
  ],
  platformStats: {
    totalDatasets: 147,
    totalReports: 389,
    activeUsers: 523,
    biasFound: 67,
    accuracy: 94
  },
  sampleBiasAnalysis: {
    datasetName: "Sample Resume Screening Data",
    biasScore: 73,
    biasTypes: ["Gender Bias", "Age Bias"],
    details: [
      "68% preference for male candidates in technical positions",
      "15% lower selection rate for candidates over 45 years",
      "Salary predictions vary by 23% based on gender indicators"
    ],
    recommendations: [
      "Implement gender-blind resume screening",
      "Add age bias detection in preprocessing",
      "Use fairness constraints during model training"
    ]
  }
};

// Application State
let currentUser = null;
let currentSection = 'landing';
let uploadedFiles = [];
let pendingNavigation = null;

// DOM Elements - will be initialized after DOM loads
let sections = {};
let authModal, loginForm, signupForm, guestNav, userNav, publicNav, toast, guestNotice;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing app...');
  initializeApp();
  setupEventListeners();
});

function initializeApp() {
  console.log('Initializing application...');
  
  // Initialize DOM elements after DOM is loaded
  sections = {
    landing: document.getElementById('landing'),
    demo: document.getElementById('demo'),
    about: document.getElementById('about'),
    dashboard: document.getElementById('dashboard'),
    upload: document.getElementById('upload'),
    leaderboard: document.getElementById('leaderboard'),
    profile: document.getElementById('profile')
  };

  authModal = document.getElementById('authModal');
  loginForm = document.getElementById('loginForm');
  signupForm = document.getElementById('signupForm');
  guestNav = document.getElementById('guestNav');
  userNav = document.getElementById('userNav');
  publicNav = document.getElementById('publicNav');
  toast = document.getElementById('toast');
  guestNotice = document.getElementById('guestNotice');

  console.log('DOM elements initialized:', {
    sections: Object.keys(sections).filter(key => sections[key]),
    authModal: !!authModal,
    guestNav: !!guestNav,
    userNav: !!userNav
  });

  // Check for saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-color-scheme', savedTheme);
    updateThemeToggle(savedTheme);
  }

  // Check for saved user session
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    console.log('Found saved user:', currentUser.name);
    showUserInterface();
  } else {
    console.log('No saved user found - showing guest interface');
    showGuestInterface();
  }

  // Start with landing page
  showSection('landing');
}

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // File upload
  const fileInput = document.getElementById('fileInput');
  const fileUpload = document.getElementById('fileUpload');
  
  if (fileInput && fileUpload) {
    fileInput.addEventListener('change', handleFileSelect);
    fileUpload.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });
    fileUpload.addEventListener('dragover', handleDragOver);
    fileUpload.addEventListener('dragleave', handleDragLeave);
    fileUpload.addEventListener('drop', handleFileDrop);
  }

  // Forms
  const uploadForm = document.getElementById('uploadForm');
  
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleUploadSubmit);
  }

  // Leaderboard filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', handleLeaderboardFilter);
  });

  // Modal backdrop click
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        hideAuth();
      }
    });
  }

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal && !authModal.classList.contains('hidden')) {
      hideAuth();
    }
  });

  console.log('Event listeners setup complete');
}

// Authentication Functions
function requireAuth(sectionName) {
  console.log('Checking auth for section:', sectionName);
  if (currentUser) {
    console.log('User authenticated, navigating to:', sectionName);
    showSection(sectionName);
  } else {
    console.log('User not authenticated, showing auth modal');
    pendingNavigation = sectionName;
    showAuth('login');
  }
}

function showSection(sectionName) {
  console.log('Navigating to section:', sectionName);
  
  // Validate section exists
  if (!sections[sectionName] || !sections[sectionName]) {
    console.error('Section not found:', sectionName);
    return;
  }
  
  // Hide all sections
  Object.values(sections).forEach(section => {
    if (section) {
      section.classList.add('hidden');
    }
  });

  // Show requested section
  sections[sectionName].classList.remove('hidden');
  currentSection = sectionName;
  
  console.log('Successfully navigated to:', sectionName);

  // Update navigation highlights
  updateNavHighlight(sectionName);

  // Load section-specific content
  switch(sectionName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'leaderboard':
      loadLeaderboard();
      break;
    case 'profile':
      loadProfile();
      break;
    case 'demo':
      loadDemo();
      break;
    case 'about':
      loadAbout();
      break;
  }
}

function updateNavHighlight(sectionName) {
  // Remove active class from all navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Add active class to current section's nav link based on onclick attribute
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const onclick = link.getAttribute('onclick');
    if (onclick && onclick.includes(`'${sectionName}'`)) {
      link.classList.add('active');
    }
  });
}

function showAuth(type) {
  console.log('Showing auth modal:', type);
  if (!authModal || !loginForm || !signupForm) {
    console.error('Auth modal elements not found');
    return;
  }
  
  authModal.classList.remove('hidden');
  
  if (type === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  } else {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
  
  // Clear any existing form data
  const forms = authModal.querySelectorAll('form');
  forms.forEach(form => form.reset());
  
  console.log('Auth modal displayed');
}

function hideAuth() {
  console.log('Hiding auth modal');
  if (authModal) {
    authModal.classList.add('hidden');
    // Also hide both forms
    if (loginForm) loginForm.classList.add('hidden');
    if (signupForm) signupForm.classList.add('hidden');
  }
  
  // Clear pending navigation if user cancels
  pendingNavigation = null;
}

function handleLogin(event) {
  event.preventDefault();
  console.log('Handling login...');
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Mock authentication - in real app, this would validate against backend
  if (email && password) {
    currentUser = {
      id: 1,
      name: "Alex Chen",
      email: email,
      points: 2450,
      rank: 1,
      joinDate: "2024-01-15",
      contributions: 47
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log('Login successful for user:', currentUser.name);
    
    // Hide modal first, then show user interface
    hideAuth();
    showUserInterface();
    
    // Navigate to pending section or dashboard
    if (pendingNavigation) {
      console.log('Navigating to pending section:', pendingNavigation);
      showSection(pendingNavigation);
      pendingNavigation = null;
    } else {
      showSection('dashboard');
    }
    
    setTimeout(() => {
      showToast('Welcome back!');
    }, 100);
  }
}

function handleSignup(event) {
  event.preventDefault();
  console.log('Handling signup...');
  
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  // Mock user creation
  if (name && email && password) {
    currentUser = {
      id: Date.now(),
      name: name,
      email: email,
      points: 0,
      rank: mockData.sampleUsers.length + 1,
      joinDate: new Date().toISOString().split('T')[0],
      contributions: 0
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log('Signup successful for user:', currentUser.name);
    
    // Hide modal first, then show user interface
    hideAuth();
    showUserInterface();
    
    // Navigate to pending section or dashboard
    if (pendingNavigation) {
      console.log('Navigating to pending section:', pendingNavigation);
      showSection(pendingNavigation);
      pendingNavigation = null;
    } else {
      showSection('dashboard');
    }
    
    setTimeout(() => {
      showToast('Account created successfully! Welcome to BiasBounty!');
    }, 100);
  }
}

function logout() {
  console.log('Logging out...');
  currentUser = null;
  localStorage.removeItem('currentUser');
  showGuestInterface();
  showSection('landing');
  setTimeout(() => {
    showToast('Logged out successfully');
  }, 100);
}

function showUserInterface() {
  console.log('Showing user interface');
  if (guestNav) guestNav.classList.add('hidden');
  if (userNav) userNav.classList.remove('hidden');
  if (guestNotice) guestNotice.classList.add('hidden');
}

function showGuestInterface() {
  console.log('Showing guest interface');
  if (userNav) userNav.classList.add('hidden');
  if (guestNav) guestNav.classList.remove('hidden');
  if (guestNotice) guestNotice.classList.remove('hidden');
}

// Content Loading Functions
function loadDemo() {
  console.log('Demo section loaded - content is static HTML');
}

function loadAbout() {
  console.log('About section loaded - content is static HTML');
}

// Dashboard Functions
function loadDashboard() {
  console.log('Loading dashboard for user:', currentUser?.name);
  if (!currentUser) return;

  // Update user info
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userPoints = document.getElementById('userPoints');
  const userRank = document.getElementById('userRank');
  const userContributions = document.getElementById('userContributions');
  
  if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
  if (userPoints) userPoints.textContent = currentUser.points.toLocaleString();
  if (userRank) userRank.textContent = `#${currentUser.rank}`;
  if (userContributions) userContributions.textContent = currentUser.contributions;

  // Load user datasets
  loadUserDatasets();
  loadRecentActivity();
}

function loadUserDatasets() {
  const container = document.getElementById('userDatasets');
  if (!container) return;
  
  container.innerHTML = '';

  mockData.sampleDatasets.forEach(dataset => {
    const card = createDatasetCard(dataset);
    container.appendChild(card);
  });
}

function createDatasetCard(dataset) {
  const card = document.createElement('div');
  card.className = 'dataset-card';

  const biasLevel = dataset.biasScore > 70 ? 'high' : dataset.biasScore > 40 ? 'medium' : 'low';
  
  card.innerHTML = `
    <div class="dataset-info">
      <h3>${dataset.name}</h3>
      <p>${dataset.type} • Uploaded ${formatDate(dataset.uploadDate)}</p>
    </div>
    <div class="dataset-meta">
      <span class="bias-score bias-score--${biasLevel}">${dataset.biasScore}% bias</span>
      <span class="status status--${dataset.status.toLowerCase().replace(' ', '-')}">${dataset.status}</span>
    </div>
  `;

  return card;
}

function loadRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;
  
  container.innerHTML = '';

  const activities = [
    { type: 'upload', text: 'Uploaded new dataset "Hiring Algorithm Dataset"', time: '2 hours ago', icon: '📊' },
    { type: 'report', text: 'Submitted bias report for "Job Recommendation System"', time: '1 day ago', icon: '🔍' },
    { type: 'upload', text: 'Analysis completed for "Loan Approval Model"', time: '2 days ago', icon: '✅' }
  ];

  activities.forEach(activity => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <div class="activity-icon activity-icon--${activity.type}">
        ${activity.icon}
      </div>
      <div class="activity-content">
        <p class="activity-text">${activity.text}</p>
        <span class="activity-time">${activity.time}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

// Upload Functions
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  addFiles(files);
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('dragover');
}

function handleFileDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('dragover');
  const files = Array.from(event.dataTransfer.files);
  addFiles(files);
}

function addFiles(files) {
  files.forEach(file => {
    if (!uploadedFiles.find(f => f.name === file.name)) {
      uploadedFiles.push(file);
    }
  });
  updateFilesList();
}

function updateFilesList() {
  const container = document.getElementById('uploadedFiles');
  if (!container) return;
  
  container.innerHTML = '';

  uploadedFiles.forEach((file, index) => {
    const fileElement = document.createElement('div');
    fileElement.className = 'uploaded-file';
    fileElement.innerHTML = `
      <span>${file.name} (${formatFileSize(file.size)})</span>
      <button type="button" class="file-remove" onclick="removeFile(${index})">Remove</button>
    `;
    container.appendChild(fileElement);
  });
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  updateFilesList();
}

function handleUploadSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('datasetName')?.value;
  const type = document.getElementById('datasetType')?.value;
  const description = document.getElementById('datasetDescription')?.value;

  if (!name || !type || uploadedFiles.length === 0) {
    showToast('Please fill all required fields and upload at least one file', 'error');
    return;
  }

  // Simulate upload process
  showToast('Uploading dataset...');
  
  setTimeout(() => {
    // Mock dataset creation
    const newDataset = {
      id: Date.now(),
      name: name,
      type: type,
      uploadDate: new Date().toISOString().split('T')[0],
      biasScore: Math.floor(Math.random() * 100),
      status: 'Analyzing',
      uploader: currentUser.name,
      description: description
    };

    mockData.sampleDatasets.unshift(newDataset);
    
    // Update user stats
    if (currentUser) {
      currentUser.contributions += 1;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Reset form
    const form = document.getElementById('uploadForm');
    if (form) form.reset();
    uploadedFiles = [];
    updateFilesList();
    
    showToast('Dataset uploaded successfully! Analysis in progress...');
    
    // Simulate analysis completion
    setTimeout(() => {
      newDataset.status = 'Analyzed';
      showToast('Analysis completed! View results in your dashboard.');
    }, 5000);

  }, 2000);
}

// Leaderboard Functions
function loadLeaderboard() {
  console.log('Loading leaderboard...');
  const container = document.getElementById('leaderboardBody');
  if (!container) return;
  
  container.innerHTML = '';

  mockData.sampleUsers.forEach(user => {
    const row = document.createElement('div');
    row.className = 'leaderboard-row';
    
    const initials = user.name.split(' ').map(n => n[0]).join('');
    
    row.innerHTML = `
      <span class="rank-number">#${user.rank}</span>
      <div class="user-info">
        <div class="user-avatar">${initials}</div>
        <div>
          <div class="user-name">${user.name}</div>
        </div>
      </div>
      <span>${user.points.toLocaleString()}</span>
      <span>${user.contributions}</span>
      <span>${formatDate(user.joinDate)}</span>
    `;
    
    container.appendChild(row);
  });

  // Show/hide guest notice based on auth state
  if (guestNotice) {
    if (currentUser) {
      guestNotice.classList.add('hidden');
    } else {
      guestNotice.classList.remove('hidden');
    }
  }
}

function handleLeaderboardFilter(event) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // In a real app, this would filter the data
  loadLeaderboard();
}

// Profile Functions
function loadProfile() {
  console.log('Loading profile for user:', currentUser?.name);
  if (!currentUser) return;

  const initials = currentUser.name.split(' ').map(n => n[0]).join('');
  
  const userAvatar = document.getElementById('userAvatar');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profilePoints = document.getElementById('profilePoints');
  const profileRank = document.getElementById('profileRank');
  const profileContributions = document.getElementById('profileContributions');
  
  if (userAvatar) userAvatar.textContent = initials;
  if (profileName) profileName.textContent = currentUser.name;
  if (profileEmail) profileEmail.textContent = currentUser.email;
  if (profilePoints) profilePoints.textContent = currentUser.points.toLocaleString();
  if (profileRank) profileRank.textContent = `#${currentUser.rank}`;
  if (profileContributions) profileContributions.textContent = currentUser.contributions;
}

// Theme Functions
function toggleTheme() {
  console.log('Toggling theme...');
  const current = document.documentElement.getAttribute('data-color-scheme') || 'light';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  
  console.log('Current theme:', current, 'New theme:', newTheme);
  
  document.documentElement.setAttribute('data-color-scheme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    toggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
}

// Utility Functions
function showToast(message, type = 'success') {
  if (!toast) return;
  
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.querySelector('.toast-icon');
  
  if (toastMessage) toastMessage.textContent = message;
  
  if (type === 'error') {
    toast.style.background = 'var(--color-error)';
    if (toastIcon) toastIcon.textContent = '❌';
  } else {
    toast.style.background = 'var(--color-success)';
    if (toastIcon) toastIcon.textContent = '✅';
  }
  
  toast.classList.remove('hidden');
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 300);
  }, 3000);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export functions for global access
window.showSection = showSection;
window.requireAuth = requireAuth;
window.showAuth = showAuth;
window.hideAuth = hideAuth;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.logout = logout;
window.toggleTheme = toggleTheme;
window.removeFile = removeFile;