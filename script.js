// Utility Functions
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}

function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

function setCurrentUser(email) {
  localStorage.setItem('currentUser', email);
}

// Course Data
const courses = {
  'web-fundamentals': {
    name: 'Web Development Fundamentals',
    modules: ['HTML Basics', 'CSS Basics', 'JavaScript Basics', 'Project: Build a Website']
  },
  'advanced-web-dev': {
    name: 'Advanced Web Development',
    modules: ['Advanced JavaScript', 'ReactJS', 'NodeJS & Express', 'Project: Fullstack App']
  }
};

// On DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('registerForm');
  const logForm = document.getElementById('loginForm');

  // Registration
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;

      const users = getUsers();
      if (users[email]) {
        showMessage('registerMessage', 'Email already registered.', 'red');
        return;
      }

      users[email] = { password, courses: {} };
      setUsers(users);
      showMessage('registerMessage', 'Registration successful!', 'green');
      setTimeout(() => window.location.href = 'login.html', 1500);
    });
  }

  // Login
  if (logForm) {
    logForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('logEmail').value;
      const password = document.getElementById('logPassword').value;

      const users = getUsers();
      if (!users[email] || users[email].password !== password) {
        showMessage('loginMessage', 'Invalid credentials.', 'red');
        return;
      }

      setCurrentUser(email);
      showMessage('loginMessage', 'Login successful!', 'green');
      setTimeout(() => window.location.href = 'courses.html', 1500);
    });
  }

  // Load Course List
  const courseList = document.getElementById('courseList');
  if (courseList) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert('Please log in.');
      window.location.href = 'login.html';
      return;
    }

    for (const id in courses) {
      const course = courses[id];
      const div = document.createElement('div');
      div.className = 'course-entry';
      div.innerHTML = `
        <h3>${course.name}</h3>
        <a class="btn" href="course-details.html?course=${id}">Enroll / View</a>
      `;
      courseList.appendChild(div);
    }
  }

  // Load Course Details
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course');
  const course = courses[courseId];

  const courseTitle = document.getElementById('courseTitle');
  const modulesList = document.getElementById('modulesList');
  const completeBtn = document.getElementById('completeCourseBtn');
  const completionMsg = document.getElementById('completionMessage');
  const certLink = document.getElementById('certificateLink');

  if (courseTitle && modulesList) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert('Please log in.');
      window.location.href = 'login.html';
      return;
    }

    if (!course) {
      alert('Course not found');
      window.location.href = 'courses.html';
      return;
    }

    courseTitle.textContent = course.name;

    const users = getUsers();
    const userData = users[currentUser];
    if (!userData.courses[courseId]) {
      userData.courses[courseId] = {
        completedModules: [],
        completed: false
      };
      setUsers(users);
    }

    const userCourse = userData.courses[courseId];

    // Populate modules
    modulesList.innerHTML = '';
    course.modules.forEach((mod, i) => {
      const li = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `mod${i}`;
      checkbox.checked = userCourse.completedModules.includes(mod);
      checkbox.disabled = userCourse.completed;

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          userCourse.completedModules.push(mod);
        } else {
          userCourse.completedModules = userCourse.completedModules.filter(m => m !== mod);
        }
        userData.courses[courseId] = userCourse;
        setUsers(users);
        updateCompletionButton();
      });

      const label = document.createElement('label');
      label.htmlFor = `mod${i}`;
      label.textContent = mod;
      li.appendChild(checkbox);
      li.appendChild(label);
      modulesList.appendChild(li);
    });

    // Complete button
    function updateCompletionButton() {
      completeBtn.disabled = !(userCourse.completedModules.length === course.modules.length);
      if (!completeBtn.disabled) {
        completionMsg.textContent = '';
        certLink.style.display = 'none';
      }
    }

    completeBtn.addEventListener('click', () => {
      userCourse.completed = true;
      setUsers(users);
      completionMsg.textContent = 'Congratulations! You completed the course.';
      certLink.href = `certificate.html?course=${courseId}`;
      certLink.style.display = 'inline';
      completeBtn.disabled = true;
    });

    if (userCourse.completed) {
      completionMsg.textContent = 'You have already completed this course.';
      certLink.href = `certificate.html?course=${courseId}`;
      certLink.style.display = 'inline';
      completeBtn.disabled = true;
    }

    updateCompletionButton();
  }

  // Certificate Page
  const certUserElem = document.getElementById('certUser');
  const certCourseNameElem = document.getElementById('certCourseName');
  const certDateElem = document.getElementById('certDate');

  if (certCourseNameElem) {
    const currentUser = getCurrentUser();
    const courseId = params.get('course');

    if (!currentUser || !courseId || !courses[courseId]) {
      alert('Invalid certificate access.');
      window.location.href = 'dashboard.html';
    } else {
      certUserElem.textContent = currentUser;
      certCourseNameElem.textContent = courses[courseId].name;
      certDateElem.textContent = new Date().toLocaleDateString();
    }
  }

  // Dashboard Certificates
  const certContainer = document.getElementById('certificatesContainer');
  if (certContainer) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert('Please log in.');
      window.location.href = 'login.html';
      return;
    }

    const users = getUsers();
    const userData = users[currentUser];

    for (const cid in userData.courses) {
      const course = userData.courses[cid];
      if (course.completed) {
        const div = document.createElement('div');
        div.className = 'certificate-entry';
        div.innerHTML = `
          <h3>${courses[cid]?.name || cid}</h3>
          <a class="btn" href="certificate.html?course=${cid}">View Certificate</a>
          <button onclick="downloadCertificate('${cid}', '${courses[cid]?.name || cid}')">Download</button>
        `;
        certContainer.appendChild(div);
      }
    }
  }
});

// Download Certificate
function downloadCertificate(courseId, courseName) {
  const user = getCurrentUser();
  const certWindow = window.open('', '', 'width=800,height=600');
  certWindow.document.write(`
    <html><head><title>Certificate</title><style>
    body { font-family: Arial; text-align: center; padding: 50px; }
    .cert { border: 5px solid #004080; padding: 40px; margin-top: 50px; }
    </style></head>
    <body>
    <div class="cert">
      <h1>Certificate of Completion</h1>
      <p>This certifies that</p>
      <h2>${user}</h2>
      <p>has successfully completed</p>
      <h3>${courseName}</h3>
      <p>Date: ${new Date().toLocaleDateString()}</p>
    </div>
    <script>setTimeout(() => window.print(), 1000);</script>
    </body></html>
  `);
}

// Show messages
function showMessage(id, text, color) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
    el.style.color = color;
  }
}
