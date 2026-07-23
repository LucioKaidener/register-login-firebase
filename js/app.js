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
let firestoreDb = null; // Renamed to avoid conflict with global db
let storage = null; // Keep for now, will remove after confirming no other dependencies
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
  firestoreDb = firebaseSDK.firestore(); // Assign to firestoreDb
  // storage = typeof firebaseSDK.storage === 'function' ? firebaseSDK.storage() : null; // Remove storage initialization
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

function getUsernameFromEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const parts = email.trim().split('@');
  return parts[0] || '';
}

// Hàm chuyển file thành chuỗi Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Sử dụng hàm này để xem trước ảnh, nó cũng sẽ trả về Base64
async function getImagePreviewUrl(file) {
  try {
    return await fileToBase64(file);
  } catch (error) {
    throw new Error('Không thể đọc file ảnh để xem trước.');
  }
}

let selectedAvatarFile = null;
let selectedAvatarPreviewUrl = null;

function setProfileAvatar(url) {
  const profileAvatar = document.getElementById('profileAvatar');
  if (profileAvatar && url) {
    profileAvatar.src = url;
  }
}

function setupAvatarUpload() {
  const avatarInput = document.getElementById('avatarInput');
  const avatarUploadBtn = document.getElementById('avatarUploadBtn');
  if (!avatarInput || !avatarUploadBtn) return;

  avatarUploadBtn.addEventListener('click', () => avatarInput.click());

  avatarInput.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    try {
      selectedAvatarFile = file;
      selectedAvatarPreviewUrl = await getImagePreviewUrl(file);
      setProfileAvatar(selectedAvatarPreviewUrl);
      console.log('Avatar selected and previewed:', selectedAvatarPreviewUrl);

      // Kiểm tra kích thước file
      const MAX_AVATAR_SIZE_KB = 200;
      if (file.size > MAX_AVATAR_SIZE_KB * 1024) {
        showMessage(`Ảnh quá lớn! Vui lòng chọn ảnh dung lượng dưới ${MAX_AVATAR_SIZE_KB}KB.`, 'error');
        selectedAvatarFile = null; // Clear selected file
        selectedAvatarPreviewUrl = null; // Clear preview
        setProfileAvatar(''); // Clear avatar preview
        return;
      }

      // Tự động lưu avatar ngay sau khi chọn
      await autoSaveAvatarBase64();

    } catch (error) {
      console.error('Error setting up avatar preview:', error);
      showMessage('Không thể xem trước ảnh đại diện. Vui lòng thử lại.', 'error');
    }
  });
}

// Hàm mới để tự động lưu avatar dưới dạng Base64
async function autoSaveAvatarBase64() {
  console.log('autoSaveAvatarBase64 called');
  if (!initFirebase()) return;

  const user = auth.currentUser;
  if (!user) {
    console.log('No user logged in for auto-save avatar.');
    showMessage('Vui lòng đăng nhập để lưu ảnh đại diện.', 'error');
    return;
  }

  if (selectedAvatarFile) {
    showMessage('Đang tải lên ảnh đại diện...', 'info');
    try {
      const base64Avatar = await fileToBase64(selectedAvatarFile);

      // Cập nhật photoURL trong Firebase Auth (nếu cần, Firebase Auth có giới hạn kích thước)
      // Tuy nhiên, ưu tiên lưu vào Firestore vì Base64 có thể rất lớn
      // await user.updateProfile({ photoURL: base64Avatar }); // Có thể bỏ qua nếu chỉ lưu vào Firestore

      // Lưu thẳng vào document của User trong Firestore
      await saveUserProfileToFirestore(user.uid, {
        avatar: base64Avatar,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });

      showMessage('Ảnh đại diện đã được lưu thành công.', 'success');
      console.log('Avatar auto-saved (Base64) and Firestore updated.');

      // Cập nhật lại preview URL để đảm bảo hiển thị đúng
      selectedAvatarPreviewUrl = base64Avatar;
      setProfileAvatar(base64Avatar);

    } catch (error) {
      showMessage('Lỗi khi lưu ảnh đại diện.', 'error');
      console.error('autoSaveAvatarBase64 error:', error);
    } finally {
      selectedAvatarFile = null; // Clear after attempt
      // selectedAvatarPreviewUrl = null; // Giữ lại để hiển thị
    }
  } else {
    console.log('No selected avatar file for auto-save.');
  }
}

// Hàm này sẽ được sửa đổi để trả về chuỗi Base64
async function saveSelectedAvatarForUser() {
  const user = auth ? auth.currentUser : null;
  if (useLocalStorageFallback) {
    const currentUser = getCurrentStorageUser();
    if (!currentUser) return null;

    const users = getStorageUsers();
    users[currentUser.id] = {
      ...currentUser,
      avatar: selectedAvatarPreviewUrl || currentUser.avatar || null
    };
    saveStorageUsers(users);
    return selectedAvatarPreviewUrl; // Trả về Base64 đã xem trước
  }

  if (user && selectedAvatarFile) {
    try {
      const base64Avatar = await fileToBase64(selectedAvatarFile);
      // Không cần updateProfile ở đây nếu đã làm trong autoSaveAvatarBase64
      // hoặc nếu chỉ muốn lưu vào Firestore
      return base64Avatar;
    } catch (error) {
      console.error('Error converting avatar to Base64:', error);
      throw error;
    }
  }
  console.log('No user or selected avatar file for saveSelectedAvatarForUser.');
  return null;
}

function setupPasswordToggle(toggleId, inputId, iconId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!toggle || !input || !icon) return;

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    const isPasswordVisible = input.type === 'password';
    input.type = isPasswordVisible ? 'text' : 'password';
    icon.textContent = isPasswordVisible ? 'visibility_off' : 'visibility';
    toggle.setAttribute('aria-label', isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  });
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

async function saveUserProfileToFirestore(uid, data) {
  if (!firestoreDb || !uid) return false; // Use firestoreDb

  try {
    await firestoreDb.collection('users').doc(uid).set(data, { merge: true }); // Use firestoreDb
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu vào Firestore:', error);
    throw error;
  }
}

function redirectToProfile() {
  window.location.href = '/pages/profile.html';
}

function redirectToLogin() {
  window.location.href = '/pages/login.html';
}

  function bindAuthRedirect() {
    const isLoginPage = window.location.pathname.endsWith('login.html');
    const isRegisterPage = window.location.pathname.endsWith('register.html');
    const isAuthPage = isLoginPage || isRegisterPage;

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
        // Only redirect to profile if not on the register page.
        // The register page has its own redirect logic after successful registration.
        if (!isRegisterPage) {
          redirectToProfile();
        }
      } else if (!user && !isAuthPage) {
        // If user is not logged in and not on an auth page, redirect to login
        redirectToLogin();
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
        address: '',
        avatar: null
      };
      saveStorageUsers(users);
      showMessage('Đăng ký thành công! Đang chuyển tới trang đăng nhập...', 'success');
      setTimeout(() => redirectToLogin(), 1000);
      return;
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const username = getUsernameFromEmail(email);

      await userCredential.user.updateProfile({
        displayName: username
      });

      await saveUserProfileToFirestore(userCredential.user.uid, {
        email,
        fullName: username,
        phone: '',
        address: '',
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });

      await auth.signOut();
      showMessage('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.', 'success');
      setTimeout(() => redirectToLogin(), 1000);
    } catch (error) {
      showMessage(getFriendlyError(error), 'error');
    }
  }

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearMessage();

  if (!initFirebase()) return;
  console.log('handleLoginSubmit called');

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
      address,
      avatar: selectedAvatarPreviewUrl || currentUser.avatar || null
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
    // Với logic autoSaveAvatarBase64, avatar đã được lưu ngay khi chọn.
    // Do đó, handleProfileSubmit chỉ cần lưu các thông tin khác.
    // Nếu có selectedAvatarFile, nó đã được xử lý bởi autoSaveAvatarBase64.

    // Prepare other profile data
    const updatedUserData = {
      email,
      fullName,
      phone,
      address,
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    };

    // Nếu avatar đã được cập nhật thông qua autoSaveAvatarBase64,
    // thì selectedAvatarPreviewUrl sẽ chứa Base64 mới nhất.
    // Chúng ta cần đảm bảo rằng avatar trong Firestore được cập nhật với giá trị này.
    // Tuy nhiên, autoSaveAvatarBase64 đã làm điều này.
    // Nếu người dùng chỉ thay đổi thông tin khác mà không thay đổi avatar,
    // thì updatedUserData không cần chứa avatar.
    // Nếu avatar đã được thay đổi, autoSaveAvatarBase64 đã cập nhật Firestore.

    console.log('handleProfileSubmit: Saving updatedUserData to Firestore (excluding avatar, as it\'s auto-saved):', updatedUserData);
    await saveUserProfileToFirestore(user.uid, updatedUserData);

    // Clear selected avatar state after successful save of other data
    // (autoSaveAvatarBase64 đã clear selectedAvatarFile, nhưng giữ selectedAvatarPreviewUrl để hiển thị)
    // selectedAvatarFile = null; // Đã được clear trong autoSaveAvatarBase64
    // selectedAvatarPreviewUrl = null; // Giữ lại để hiển thị

    showMessage('Cập nhật hồ sơ thành công.', 'success');
    console.log('Profile data saved successfully.');
  } catch (error) {
    showMessage(getFriendlyError(error), 'error');
    console.error('Error saving profile data:', error);
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
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileEmail = document.getElementById('profileEmail');

    const email = currentUser.email || '';
    const username = getUsernameFromEmail(email);

    if (profileDisplayName) profileDisplayName.textContent = username || 'user';
    if (profileEmail) profileEmail.textContent = email;

    if (profileDisplayName) profileDisplayName.textContent = username || 'user';
    if (profileEmail) profileEmail.textContent = email;
    if (emailInput) emailInput.value = email;
    if (phoneInput) phoneInput.value = currentUser.phone || '';
    if (addressInput) addressInput.value = currentUser.address || '';
    if (currentUser.avatar) {
      setProfileAvatar(currentUser.avatar);
      selectedAvatarPreviewUrl = currentUser.avatar;
    }

    if (lastNameInput || firstNameInput) {
      const fullName = currentUser.fullName || username;
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
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileEmail = document.getElementById('profileEmail');

    const email = user.email || '';
    const username = getUsernameFromEmail(email);

    if (profileDisplayName) profileDisplayName.textContent = username || 'user';
    if (profileEmail) profileEmail.textContent = email;
    if (emailInput) emailInput.value = email;

    try {
      const snapshot = await firestoreDb.collection('users').doc(user.uid).get(); // Use firestoreDb
      if (snapshot.exists) {
        const data = snapshot.data() || {};
        if (data.avatar) {
          setProfileAvatar(data.avatar);
          selectedAvatarPreviewUrl = data.avatar; // Cập nhật preview URL
        } else if (user.photoURL) {
          setProfileAvatar(user.photoURL);
          selectedAvatarPreviewUrl = user.photoURL; // Cập nhật preview URL
        }
        if (lastNameInput || firstNameInput) {
          const fullName = data.fullName || username;
          const parts = fullName.trim() ? fullName.trim().split(/\s+/) : [];
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ');
          if (firstNameInput) firstNameInput.value = firstName;
          if (lastNameInput) lastNameInput.value = lastName;
        }
        if (phoneInput) phoneInput.value = data.phone || '';
        if (addressInput) addressInput.value = data.address || '';
      } else if (user.photoURL) {
        setProfileAvatar(user.photoURL);
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

function initApp() {
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

    setupPasswordToggle('registerPasswordToggle', 'password', 'registerPasswordToggleIcon');
    setupPasswordToggle('confirmPasswordToggle', 'confirm-password', 'confirmPasswordToggleIcon');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
    setupPasswordToggle('loginPasswordToggle', 'password', 'loginPasswordToggleIcon');
  }

  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSubmit);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }

  setupAvatarUpload();

  if (profileForm) {
    loadProfile();
    setupProfileEditing(); // Add this new function call
  }

  bindAuthRedirect();
}

function setupProfileEditing() {
  const editProfileBtn = document.getElementById('editProfileBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const editableFields = document.querySelectorAll('[data-editable]');

  let initialProfileData = {}; // To store initial data for cancellation

  function setEditMode(isEditing) {
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    editableFields.forEach(field => {
      field.disabled = !isEditing;
      if (isEditing) {
        field.classList.remove('disabled:bg-gray-100', 'disabled:text-gray-600', 'disabled:cursor-not-allowed');
        field.classList.add('input-editable');
      } else {
        field.classList.add('disabled:bg-gray-100', 'disabled:text-gray-600', 'disabled:cursor-not-allowed');
        field.classList.remove('input-editable');
      }
    });

    if (isEditing) {
      editProfileBtn.classList.add('visually-hidden');
      saveProfileBtn.classList.remove('visually-hidden');
      cancelEditBtn.classList.remove('visually-hidden'); // Show cancel button
      // Store current values when entering edit mode
      editableFields.forEach(field => {
        initialProfileData[field.id] = field.value;
      });
    } else {
      editProfileBtn.classList.remove('visually-hidden');
      saveProfileBtn.classList.add('visually-hidden');
      cancelEditBtn.classList.add('visually-hidden'); // Hide cancel button
    }
  }

  function resetProfileFields() {
    editableFields.forEach(field => {
      if (initialProfileData[field.id] !== undefined) {
        field.value = initialProfileData[field.id];
      }
    });
    // Also reset avatar if it was changed but not saved
    if (selectedAvatarPreviewUrl && initialProfileData['profileAvatarSrc'] && selectedAvatarPreviewUrl !== initialProfileData['profileAvatarSrc']) {
      setProfileAvatar(initialProfileData['profileAvatarSrc']);
      selectedAvatarPreviewUrl = initialProfileData['profileAvatarSrc'];
    }
    selectedAvatarFile = null; // Clear any pending avatar file
  }

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      // Store current avatar src
      const profileAvatar = document.getElementById('profileAvatar');
      if (profileAvatar) {
        initialProfileData['profileAvatarSrc'] = profileAvatar.src;
      }
      setEditMode(true);
    });
  }

  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      resetProfileFields(); // Restore initial data
      setEditMode(false); // Exit edit mode
    });
  }

  // When the form is submitted (saveProfileBtn is clicked), disable edit mode
  if (profileForm) {
    profileForm.addEventListener('submit', (event) => {
      // The handleProfileSubmit will be called first, then this.
      // We want to revert to view mode after successful save.
      // For now, we'll just set it back to view mode.
      // The actual saving logic is in handleProfileSubmit.
      setEditMode(false);
    });
  }

  // Initialize in view mode
  setEditMode(false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
