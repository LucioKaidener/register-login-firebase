// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_6lb5pvB3MUvyHXtKXL7wBIhS-9bOLyg",
  authDomain: "register-login-firebase-d5f28.firebaseapp.com",
  projectId: "register-login-firebase-d5f28",
  storageBucket: "register-login-firebase-d5f28.firebasestorage.app",
  messagingSenderId: "1056853569953",
  appId: "1:1056853569953:web:f2349a17133fd33fad1be0",
  measurementId: "G-P60EM3ST2H"
};

let auth = null;
let db = null;
let useLocalStorageFallback = false;

function hasPlaceholderFirebaseConfig() {
  return Object.values(firebaseConfig).some((value) => typeof value === 'string' && value.includes('YOUR_'));
}

function initFirebase() {
  if (hasPlaceholderFirebaseConfig()) {
    useLocalStorageFallback = true;
    return true;
  }

  const firebaseSDK = window.firebase;
  if (!firebaseSDK || typeof firebaseSDK.apps === 'undefined') {
    showMessage('Firebase SDK chưa được tải. Vui lòng kiểm tra kết nối mạng.', 'error');
    return false;
  }

  if (!firebaseSDK.apps.length) {
    firebaseSDK.initializeApp(firebaseConfig);
  }

  auth = firebaseSDK.auth();
  db = firebaseSDK.firestore();
  useLocalStorageFallback = false;
  return true;
}

function getStorageUsers() {
  try {
    return JSON.parse(localStorage.getItem('loginAppUsers') || '{}');
  } catch (error) {
    return {};
  }
}

function saveStorageUsers(users) {
  localStorage.setItem('loginAppUsers', JSON.stringify(users));
}

function getCurrentStorageUserId() {
  return localStorage.getItem('loginAppCurrentUser');
}

function setCurrentStorageUserId(userId) {
  localStorage.setItem('loginAppCurrentUser', userId);
}

function clearCurrentStorageUserId() {
  localStorage.removeItem('loginAppCurrentUser');
}

function getCurrentStorageUser() {
  const userId = getCurrentStorageUserId();
  const users = getStorageUsers();
  return userId ? users[userId] || null : null;
}

function showMessage(message, type = 'info') {
  const messageBox = document.getElementById('messageBox');
  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
}

function clearMessage() {
  const messageBox = document.getElementById('messageBox');
  if (messageBox) {
    messageBox.textContent = '';
    messageBox.className = 'message';
  }
}

function setFieldMessage(fieldId, message, type = 'error', inputId = null, statusId = null) {
  const fieldMessage = document.getElementById(fieldId);
  if (fieldMessage) {
    fieldMessage.textContent = message;
    fieldMessage.className = `field-message ${type}`;
  }

  if (inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      input.classList.remove('error', 'success');
      if (type === 'error') {
        input.classList.add('error');
      } else if (type === 'success') {
        input.classList.add('success');
      }
    }
  }

  if (statusId) {
    const status = document.getElementById(statusId);
    if (status) {
      status.textContent = type === 'error' ? '!' : type === 'success' ? '✔' : '';
      status.className = `field-status ${type}`;
    }
  }
}

function clearFieldMessages() {
  ['emailMessage', 'passwordMessage', 'confirmPasswordMessage'].forEach((id) => {
    const fieldMessage = document.getElementById(id);
    if (fieldMessage) {
      fieldMessage.textContent = '';
      fieldMessage.className = 'field-message';
    }
  });
  ['email', 'password', 'confirm-password'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.classList.remove('error', 'success');
    }
  });
  ['emailStatus', 'passwordStatus', 'confirmPasswordStatus'].forEach((id) => {
    const status = document.getElementById(id);
    if (status) {
      status.textContent = '';
      status.className = 'field-status';
    }
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function doPasswordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}

let registerValidationTimer = null;

function scheduleRegisterValidation() {
  if (registerValidationTimer) {
    clearTimeout(registerValidationTimer);
  }
  registerValidationTimer = setTimeout(validateRegisterInputs, 350);
}

async function checkEmailExists(email) {
  if (!validateEmail(email)) return false;

  if (useLocalStorageFallback) {
    const users = getStorageUsers();
    return Object.values(users).some((user) => user.email === email);
  }

  if (!auth && !initFirebase()) {
    return false;
  }

  try {
    const methods = await auth.fetchSignInMethodsForEmail(email);
    return Array.isArray(methods) && methods.length > 0;
  } catch (error) {
    return false;
  }
}

async function validateRegisterInputs() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  const email = emailInput?.value.trim() || '';
  const password = passwordInput?.value || '';
  const confirmPassword = confirmPasswordInput?.value || '';

  // 1. Validate Email
  if (!email) {
    setFieldMessage('emailMessage', 'Vui lòng nhập email.', 'error', 'email', 'emailStatus');
  } else if (!validateEmail(email)) {
    setFieldMessage('emailMessage', 'Vui lòng nhập email hợp lệ (vd: user@domain.com).', 'error', 'email', 'emailStatus');
  } else {
    // Nếu email đúng định dạng mới check trùng trong Firebase/Storage
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      setFieldMessage('emailMessage', 'Email này đã được sử dụng.', 'error', 'email', 'emailStatus');
    } else {
      setFieldMessage('emailMessage', 'Email hợp lệ.', 'success', 'email', 'emailStatus');
    }
  }

  // 2. Validate Password (Chạy độc lập, không bị dừng bởi Email)
  if (!password) {
    setFieldMessage('passwordMessage', 'Vui lòng nhập mật khẩu.', 'error', 'password', 'passwordStatus');
  } else if (!validatePassword(password)) {
    // Sửa message cho khớp 100% với hình mẫu
    setFieldMessage('passwordMessage', 'Mật khẩu chưa đủ mạnh.', 'error', 'password', 'passwordStatus');
  } else {
    setFieldMessage('passwordMessage', '', 'success', 'password', 'passwordStatus');
  }

  // 3. Validate Confirm Password (Chạy độc lập)
  if (!confirmPassword) {
    setFieldMessage('confirmPasswordMessage', 'Vui lòng nhập lại mật khẩu.', 'error', 'confirm-password', 'confirmPasswordStatus');
  } else if (!doPasswordsMatch(password, confirmPassword)) {
    // Sửa message cho khớp 100% với hình mẫu
    setFieldMessage('confirmPasswordMessage', 'Mật khẩu không khớp.', 'error', 'confirm-password', 'confirmPasswordStatus');
  } else {
    setFieldMessage('confirmPasswordMessage', '', 'success', 'confirm-password', 'confirmPasswordStatus');
  }
}

function getFriendlyError(error) {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Email không hợp lệ.';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu. Cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này.';
    case 'auth/wrong-password':
      return 'Mật khẩu không đúng.';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử. Vui lòng thử lại sau.';
    default:
      return error.message || 'Đã xảy ra lỗi.';
  }
}

function redirectToProfile() {
  window.location.href = '/pages/profile.html';
}

function redirectToLogin() {
  window.location.href = '/pages/login.html';
}

function bindAuthRedirect() {
  const isAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');

  if (useLocalStorageFallback) {
    const currentUser = getCurrentStorageUser();
    if (currentUser && isAuthPage) {
      redirectToProfile();
    }
    return;
  }

  if (!auth) return;

  auth.onAuthStateChanged((user) => {
    if (user && isAuthPage) {
      redirectToProfile();
    }
  });
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  clearMessage();

  if (!initFirebase()) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  const email = emailInput?.value.trim() || '';
  const password = passwordInput?.value || '';
  const confirmPassword = confirmPasswordInput?.value || '';

  if (!validateEmail(email)) {
    showMessage('Email không hợp lệ.', 'error');
    return;
  }

  if (!validatePassword(password)) {
    showMessage('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Mật khẩu xác nhận không khớp.', 'error');
    return;
  }

  if (useLocalStorageFallback) {
    const users = getStorageUsers();
    const existingUser = Object.values(users).find((user) => user.email === email);
    if (existingUser) {
      showMessage('Email này đã được sử dụng.', 'error');
      return;
    }

    const userId = `local-${Date.now()}`;
    users[userId] = {
      id: userId,
      email,
      password,
      fullName: '',
      phone: '',
      address: ''
    };
    saveStorageUsers(users);
    showMessage('Đăng ký thành công! Đang chuyển tới trang đăng nhập...', 'success');
    setTimeout(() => redirectToLogin(), 1000);
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('users').doc(userCredential.user.uid).set({
      email,
      fullName: '',
      phone: '',
      address: '',
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    showMessage('Đăng ký thành công! Đang chuyển tới trang đăng nhập...', 'success');
    setTimeout(() => redirectToLogin(), 1000);
  } catch (error) {
    showMessage(getFriendlyError(error), 'error');
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearMessage();

  if (!initFirebase()) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  const email = emailInput?.value.trim() || '';
  const password = passwordInput?.value || '';

  if (!validateEmail(email)) {
    showMessage('Email không hợp lệ.', 'error');
    return;
  }

  if (useLocalStorageFallback) {
    const users = getStorageUsers();
    const matchedUser = Object.values(users).find((user) => user.email === email && user.password === password);
    if (!matchedUser) {
      showMessage('Email hoặc mật khẩu không đúng.', 'error');
      return;
    }

    setCurrentStorageUserId(matchedUser.id);
    showMessage('Đăng nhập thành công! Đang chuyển tới hồ sơ...', 'success');
    setTimeout(() => redirectToProfile(), 800);
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    showMessage('Đăng nhập thành công! Đang chuyển tới hồ sơ...', 'success');
    setTimeout(() => redirectToProfile(), 800);
  } catch (error) {
    showMessage(getFriendlyError(error), 'error');
  }
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  clearMessage();

  if (!initFirebase()) return;

  if (useLocalStorageFallback) {
    const currentUser = getCurrentStorageUser();
    if (!currentUser) {
      redirectToLogin();
      return;
    }

    const fullNameInput = document.getElementById('last-name');
    const firstNameInput = document.getElementById('first-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

    const fullName = `${(firstNameInput?.value || '').trim()} ${(fullNameInput?.value || '').trim()}`.trim();
    const phone = phoneInput?.value.trim() || '';
    const address = addressInput?.value.trim() || '';
    const email = emailInput?.value.trim() || currentUser.email || '';

    const users = getStorageUsers();
    users[currentUser.id] = {
      ...currentUser,
      email,
      fullName,
      phone,
      address
    };
    saveStorageUsers(users);
    showMessage('Cập nhật hồ sơ thành công.', 'success');
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    redirectToLogin();
    return;
  }

  const fullNameInput = document.getElementById('last-name');
  const firstNameInput = document.getElementById('first-name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const addressInput = document.getElementById('address');

  const fullName = `${(firstNameInput?.value || '').trim()} ${(fullNameInput?.value || '').trim()}`.trim();
  const phone = phoneInput?.value.trim() || '';
  const address = addressInput?.value.trim() || '';
  const email = emailInput?.value.trim() || user.email || '';

  try {
    await db.collection('users').doc(user.uid).set({
      email,
      fullName,
      phone,
      address,
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    showMessage('Cập nhật hồ sơ thành công.', 'success');
  } catch (error) {
    showMessage(getFriendlyError(error), 'error');
  }
}

async function loadProfile() {
  if (!initFirebase()) return;

  if (useLocalStorageFallback) {
    const currentUser = getCurrentStorageUser();
    if (!currentUser) {
      redirectToLogin();
      return;
    }

    const emailInput = document.getElementById('email');
    const lastNameInput = document.getElementById('last-name');
    const firstNameInput = document.getElementById('first-name');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

    if (emailInput) emailInput.value = currentUser.email || '';
    if (phoneInput) phoneInput.value = currentUser.phone || '';
    if (addressInput) addressInput.value = currentUser.address || '';

    if (lastNameInput || firstNameInput) {
      const fullName = currentUser.fullName || '';
      const parts = fullName.trim() ? fullName.trim().split(/\s+/) : [];
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ');
      if (firstNameInput) firstNameInput.value = firstName;
      if (lastNameInput) lastNameInput.value = lastName;
    }
    return;
  }

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      redirectToLogin();
      return;
    }

    const emailInput = document.getElementById('email');
    const lastNameInput = document.getElementById('last-name');
    const firstNameInput = document.getElementById('first-name');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

    if (emailInput) emailInput.value = user.email || '';

    try {
      const snapshot = await db.collection('users').doc(user.uid).get();
      if (snapshot.exists) {
        const data = snapshot.data() || {};
        if (lastNameInput || firstNameInput) {
          const fullName = data.fullName || '';
          const parts = fullName.trim() ? fullName.trim().split(/\s+/) : [];
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ');
          if (firstNameInput) firstNameInput.value = firstName;
          if (lastNameInput) lastNameInput.value = lastName;
        }
        if (phoneInput) phoneInput.value = data.phone || '';
        if (addressInput) addressInput.value = data.address || '';
      }
    } catch (error) {
      showMessage(getFriendlyError(error), 'error');
    }
  });
}

async function logout() {
  if (!initFirebase()) return;

  if (useLocalStorageFallback) {
    clearCurrentStorageUserId();
    redirectToLogin();
    return;
  }

  await auth.signOut();
  redirectToLogin();
}

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const profileForm = document.getElementById('profileForm');
  const logoutButton = document.getElementById('logoutBtn');

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    if (emailInput) {
      emailInput.addEventListener('input', scheduleRegisterValidation);
      emailInput.addEventListener('blur', scheduleRegisterValidation);
    }
    if (passwordInput) {
      passwordInput.addEventListener('input', scheduleRegisterValidation);
    }
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', scheduleRegisterValidation);
    }
  }

  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }

  if (document.getElementById('profileForm')) {
    loadProfile();
  }

  bindAuthRedirect();
});
