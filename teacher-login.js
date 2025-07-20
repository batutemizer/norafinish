// Firebase Integrated Teacher Login

document.addEventListener('DOMContentLoaded', function() {
    initializeAuthForms();
    initializePasswordToggle();
    
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
    
    if (loginForm) {
        // Login form submission
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('Login form not found!');
    }
}

// Handle login with Firebase and demo fallback
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
        // Check for demo credentials first
        if (email === 'aysebuz@gmail.com' && password === '123456') {
            // Demo login successful
            localStorage.setItem('teacherLoggedIn', 'true');
            localStorage.setItem('teacherEmail', email);
            localStorage.setItem('teacherName', 'Ayşe Buz');
            localStorage.setItem('teacherUID', 'demo_teacher_uid');
            
            showNotification('Demo hesabı ile giriş yapıldı!', 'success');
            
            setTimeout(() => {
                window.location.href = 'teacher-dashboard.html';
            }, 1000);
            return;
        }
        
        // Try Firebase authentication
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
            case 'auth/invalid-login-credentials':
                errorMessage = 'Email veya şifre hatalı! Demo hesap: aysebuz@gmail.com / 123456';
                break;
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Register functionality removed - teacher accounts are created by admin only

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

// Form toggle functionality removed - no registration needed

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