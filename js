function showLoginModal(e) {
    if (e) e.preventDefault();
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    if (loginModal) loginModal.classList.add('show');
    if (signupModal) signupModal.classList.remove('show');
}

function showSignupModal(e) {
    if (e) e.preventDefault();
    const signupModal = document.getElementById('signupModal');
    const loginModal = document.getElementById('loginModal');
    if (signupModal) signupModal.classList.add('show');
    if (loginModal) loginModal.classList.remove('show');
}

function closeAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

function toggleToSignup(e) {
    if (e) e.preventDefault();
    closeAuthModal('loginModal');
    showSignupModal();
}

function toggleToLogin(e) {
    if (e) e.preventDefault();
    closeAuthModal('signupModal');
    showLoginModal();
}

function handleLandingPageLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('landingLoginEmail').value.trim();
    const password = document.getElementById('landingLoginPassword').value.trim();
    const errorDiv = document.getElementById('loginModalError');
    
    if (!email || !password) {
        if (errorDiv) {
            errorDiv.textContent = '❌ Please fill in all fields';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        if (errorDiv) {
            errorDiv.textContent = '❌ Invalid email or password';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert('✅ Logged in!\nWelcome, ' + user.name + '!');
    closeAuthModal('loginModal');
}

function handleLandingPageSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('landingSignupName').value.trim();
    const email = document.getElementById('landingSignupEmail').value.trim();
    const password = document.getElementById('landingSignupPassword').value.trim();
    const confirmPassword = document.getElementById('landingSignupConfirmPassword').value.trim();
    const errorDiv = document.getElementById('signupModalError');
    
    if (errorDiv) errorDiv.style.display = 'none';
    
    if (!name || !email || !password || !confirmPassword) {
        if (errorDiv) {
            errorDiv.textContent = '❌ Please fill in all fields';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    if (password !== confirmPassword) {
        if (errorDiv) {
            errorDiv.textContent = '❌ Passwords do not match';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    if (password.length < 6) {
        if (errorDiv) {
            errorDiv.textContent = '❌ Password must be at least 6 characters';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(u => u.email === email)) {
        if (errorDiv) {
            errorDiv.textContent = '❌ Email already registered';
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('✅ Account created!\nWelcome, ' + name + '!');
    closeAuthModal('signupModal');
}

function goToApp(e) {
    if (e) e.preventDefault();
    alert('🚀 Going to App!\n\n(In your full project, this would load the app)');
}

document.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target === loginModal) closeAuthModal('loginModal');
    if (event.target === signupModal) closeAuthModal('signupModal');
});

console.log('✅ Website Ready!');
