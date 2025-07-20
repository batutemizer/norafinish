// Firebase Integrated Teacher Login

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializePasswordToggle();
    initializeFormToggle();
    
    // Check if already logged in
    checkExistingAuth();
});

// Check existing authentication
function checkExistingAuth() {
    firebaseAuth.onAuthStateChanged(function(user) {
        if (user && user.email === 'aysebuz@gmail.com') {
            // Already logged in, redirect to dashboard
            window.location.href = 'teacher-dashboard.html';
        }
    });
}

// Initialize authentication forms
function initializeAuthForms() {
    const loginForm = document.getElementById('teacherLoginForm');
    const registerForm = document.getElementById('teacherRegisterForm');
    
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Register form submission
    registerForm.addEventListener('submit', handleRegister);
}

// Handle login with Firebase
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';
    submitBtn.disabled = true;
    
    try {
        // Firebase authentication
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        if (user.email === 'aysebuz@gmail.com') {
            // Save teacher session
            localStorage.setItem('teacherLoggedIn', 'true');
            localStorage.setItem('teacherEmail', user.email);
            localStorage.setItem('teacherName', 'Ayşe Buz');
            localStorage.setItem('teacherUID', user.uid);
            
            showNotification('Başarıyla giriş yapıldı!', 'success');
            
            setTimeout(() => {
                window.location.href = 'teacher-dashboard.html';
            }, 1000);
        } else {
            // Not authorized teacher
            await firebaseAuth.signOut();
            showNotification('Bu hesap öğretmen hesabı değil!', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Giriş yapılırken hata oluştu!';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Bu email adresi ile kayıtlı hesap bulunamadı!';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Hatalı şifre!';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Geçersiz email adresi!';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Çok fazla başarısız deneme! Lütfen daha sonra tekrar deneyin.';
                break;
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle register with Firebase
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Şifreler eşleşmiyor!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kayıt yapılıyor...';
    submitBtn.disabled = true;
    
    try {
        // Firebase authentication
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Save teacher data to Firestore
        await firebaseDB.collection('teachers').doc(user.uid).set({
            name: name,
            email: email,
            role: 'teacher',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });
        
        // Save teacher session
        localStorage.setItem('teacherLoggedIn', 'true');
        localStorage.setItem('teacherEmail', user.email);
        localStorage.setItem('teacherName', name);
        localStorage.setItem('teacherUID', user.uid);
        
        showNotification('Başarıyla kayıt olundu!', 'success');
        
        setTimeout(() => {
            window.location.href = 'teacher-dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Register error:', error);
        
        let errorMessage = 'Kayıt olurken hata oluştu!';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Bu email adresi zaten kullanılıyor!';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Geçersiz email adresi!';
                break;
            case 'auth/weak-password':
                errorMessage = 'Şifre çok zayıf!';
                break;
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Initialize password visibility toggle
function initializePasswordToggle() {
    const passwordFields = document.querySelectorAll('.password-field');
    
    passwordFields.forEach(field => {
        const input = field.querySelector('input[type="password"]');
        const toggleBtn = field.querySelector('.password-toggle');
        
        if (input && toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        }
    });
}

// Initialize form toggle
function initializeFormToggle() {
    const switchBtn = document.getElementById('switchBtn');
    if (switchBtn) {
        switchBtn.addEventListener('click', toggleForms);
    }
}

// Toggle between login and register forms
function toggleForms(e) {
    e.preventDefault();
    
    const loginForm = document.getElementById('teacherLoginForm');
    const registerForm = document.getElementById('teacherRegisterForm');
    const switchText = document.getElementById('switchText');
    
    if (loginForm.style.display === 'none') {
        // Show login form
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        switchText.innerHTML = 'Hesabınız yok mu? <a href="#" id="switchBtn">Kayıt olun</a>';
    } else {
        // Show register form
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        switchText.innerHTML = 'Zaten hesabınız var mı? <a href="#" id="switchBtn">Giriş yapın</a>';
    }
    
    // Re-attach event listener
    document.getElementById('switchBtn').addEventListener('click', toggleForms);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        font-family: 'Poppins', sans-serif;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
} 