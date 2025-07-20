// Teacher Login JavaScript with Firebase

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('teacherLoginForm');
    const registerForm = document.getElementById('teacherRegisterForm');
    const switchBtn = document.getElementById('switchBtn');
    const switchText = document.getElementById('switchText');
    
    loginForm.addEventListener('submit', handleTeacherLogin);
    registerForm.addEventListener('submit', handleTeacherRegister);
    switchBtn.addEventListener('click', toggleForms);
    
    // Initialize password toggles
    initializePasswordToggles();
    
    // Check if user is already logged in
    checkAuthState();
});

// Check authentication state
function checkAuthState() {
    // Check localStorage for existing session
    const isLoggedIn = localStorage.getItem('teacherLoggedIn');
    if (isLoggedIn) {
        window.location.href = 'teacher-dashboard.html';
    }
}

// Toggle between login and register forms
function toggleForms(e) {
    e.preventDefault();
    
    const loginForm = document.getElementById('teacherLoginForm');
    const registerForm = document.getElementById('teacherRegisterForm');
    const switchText = document.getElementById('switchText');
    const switchBtn = document.getElementById('switchBtn');
    
    if (loginForm.style.display === 'none') {
        // Show login form
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        switchText.innerHTML = 'Hesabınız yok mu? <a href="#" id="switchBtn">Kayıt olun</a>';
        document.getElementById('switchBtn').addEventListener('click', toggleForms);
    } else {
        // Show register form
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        switchText.innerHTML = 'Zaten hesabınız var mı? <a href="#" id="switchBtn">Giriş yapın</a>';
        document.getElementById('switchBtn').addEventListener('click', toggleForms);
    }
}

// Initialize password toggle functionality
function initializePasswordToggles() {
    const toggleBtns = document.querySelectorAll('.toggle-password');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.className = 'fas fa-eye-slash toggle-password';
            } else {
                input.type = 'password';
                this.className = 'fas fa-eye toggle-password';
            }
        });
    });
}

// Handle teacher login with Firebase
async function handleTeacherLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('teacherEmail').value;
    const password = document.getElementById('teacherPassword').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const btnIcon = submitBtn.querySelector('.fas');
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    btnIcon.style.display = 'none';
    submitBtn.disabled = true;
    
    // Simulate loading
    setTimeout(() => {
        try {
            // Simple validation for demo
            if (email === 'aysebuz@gmail.com' && password === '123456') {
                // Store teacher session
                localStorage.setItem('teacherLoggedIn', 'true');
                localStorage.setItem('teacherEmail', email);
                localStorage.setItem('teacherName', 'Ayşe Buz');
                localStorage.setItem('teacherUID', 'demo_uid');
                
                showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
                
                // Redirect to teacher dashboard
                setTimeout(() => {
                    window.location.href = 'teacher-dashboard.html';
                }, 1500);
            } else {
                throw new Error('Email veya şifre hatalı!');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showNotification(error.message || 'Giriş yapılırken hata oluştu!', 'error');
            
            // Reset button state
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btnIcon.style.display = 'inline';
            submitBtn.disabled = false;
        }
    }, 1000);
}

// Handle teacher registration with Firebase
async function handleTeacherRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('teacherRegisterName').value;
    const email = document.getElementById('teacherRegisterEmail').value;
    const phone = document.getElementById('teacherRegisterPhone').value;
    const subject = document.getElementById('teacherRegisterSubject').value;
    const password = document.getElementById('teacherRegisterPassword').value;
    const passwordConfirm = document.getElementById('teacherRegisterPasswordConfirm').value;
    
    // Validate passwords match
    if (password !== passwordConfirm) {
        showNotification('Şifreler eşleşmiyor!', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showNotification('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('span');
    const btnIcon = submitBtn.querySelector('.fas');
    
    btnText.textContent = 'Kayıt yapılıyor...';
    btnIcon.className = 'fas fa-spinner fa-spin';
    submitBtn.disabled = true;
    
    // Simulate registration
    setTimeout(() => {
        try {
            // For demo purposes, just show success
            showNotification('Kayıt başarılı! Giriş yapabilirsiniz.', 'success');
            
            // Switch back to login form
            setTimeout(() => {
                toggleForms({ preventDefault: () => {} });
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Kayıt yapılırken hata oluştu!', 'error');
            
            // Reset button state
            btnText.textContent = 'Kayıt Ol';
            btnIcon.className = 'fas fa-user-plus';
            submitBtn.disabled = false;
        }
    }, 1500);
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