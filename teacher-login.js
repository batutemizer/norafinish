// Teacher Login JavaScript with Firebase

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('teacherLoginForm');
    
    loginForm.addEventListener('submit', handleTeacherLogin);
    
    // Check if user is already logged in
    checkAuthState();
});

// Check authentication state
function checkAuthState() {
    firebaseAuth.onAuthStateChanged(function(user) {
        if (user && user.email === 'aysebuz@gmail.com') {
            // User is already logged in, redirect to dashboard
            window.location.href = 'teacher-dashboard.html';
        }
    });
}

// Handle teacher login with Firebase
async function handleTeacherLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('teacherEmail').value;
    const password = document.getElementById('teacherPassword').value;
    
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;
    
    try {
        // Firebase authentication
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        if (user.email === 'aysebuz@gmail.com') {
            // Store teacher session
            localStorage.setItem('teacherLoggedIn', 'true');
            localStorage.setItem('teacherEmail', user.email);
            localStorage.setItem('teacherName', 'Ayşe Buz');
            localStorage.setItem('teacherUID', user.uid);
            
            showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            
            // Redirect to teacher dashboard
            setTimeout(() => {
                window.location.href = 'teacher-dashboard.html';
            }, 1500);
        } else {
            throw new Error('Bu email adresi öğretmen hesabı değil!');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Giriş yapılırken hata oluştu!';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Bu email adresi kayıtlı değil!';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Şifre hatalı!';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Geçersiz email adresi!';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
        
        // Reset button state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
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