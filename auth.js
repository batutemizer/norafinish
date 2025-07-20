// Auth System JavaScript

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchBtn = document.getElementById('switchBtn');
const switchText = document.getElementById('switchText');
const togglePasswordBtns = document.querySelectorAll('.toggle-password');

// Form switching functionality
let isLoginMode = true;

switchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
});

function toggleForms() {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        switchText.innerHTML = 'Hesabınız yok mu? <a href="#" id="switchBtn">Kayıt olun</a>';
        document.querySelector('.auth-header h2').textContent = 'Öğrenci Girişi';
        document.querySelector('.auth-header p').textContent = 'Hesabınıza giriş yapın ve öğrenmeye devam edin';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        switchText.innerHTML = 'Zaten hesabınız var mı? <a href="#" id="switchBtn">Giriş yapın</a>';
        document.querySelector('.auth-header h2').textContent = 'Öğrenci Kaydı';
        document.querySelector('.auth-header p').textContent = 'Yeni hesap oluşturun ve öğrenmeye başlayın';
    }
    
    // Re-attach event listener
    document.getElementById('switchBtn').addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms();
    });
}

// Password toggle functionality
togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        }
    });
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Show loading state
    const submitBtn = loginForm.querySelector('.auth-btn');
    submitBtn.classList.add('loading');
    
    try {
        
        // Firebase Authentication - Sign in
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Get student data from Firestore
        const studentDoc = await firebase.firestore().collection('students').doc(user.uid).get();
        
        if (studentDoc.exists) {
            const studentData = studentDoc.data();
            
            // Update last activity
            await firebase.firestore().collection('students').doc(user.uid).update({
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Store user data in localStorage
            const userData = {
                uid: user.uid,
                email: email,
                name: studentData.name,
                phone: studentData.phone,
                isLoggedIn: true,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('noraUser', JSON.stringify(userData));
            
            showNotification('Giriş başarılı!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            throw new Error('Öğrenci bilgileri bulunamadı!');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.code === 'auth/user-not-found') {
            showNotification('Bu email adresi ile kayıtlı kullanıcı bulunamadı!', 'error');
        } else if (error.code === 'auth/wrong-password') {
            showNotification('Hatalı şifre!', 'error');
        } else {
            showNotification('Giriş sırasında hata oluştu: ' + error.message, 'error');
        }
    } finally {
        submitBtn.classList.remove('loading');
    }
});

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    if (password !== passwordConfirm) {
        showNotification('Şifreler eşleşmiyor!', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('Kullanım şartlarını kabul etmelisiniz!', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = registerForm.querySelector('.auth-btn');
    submitBtn.classList.add('loading');
    
    try {
        // Firebase Authentication - Create user
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Save student data to Firestore
        await firebase.firestore().collection('students').doc(user.uid).set({
            name: name,
            email: email,
            phone: phone,
            registerDate: firebase.firestore.FieldValue.serverTimestamp(),
            lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            completedLessons: 0,
            successRate: 0,
            status: 'active',
            courses: [],
            isNewUser: true
        });
        
        // Store user data locally
        const userData = {
            uid: user.uid,
            name: name,
            email: email,
            phone: phone,
            isLoggedIn: true,
            isNewUser: true,
            registerTime: new Date().toISOString()
        };
        
        localStorage.setItem('noraUser', JSON.stringify(userData));
        
        showNotification('Kayıt başarılı! Giriş yapılıyor...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            showNotification('Bu email adresi zaten kullanımda!', 'error');
        } else if (error.code === 'auth/weak-password') {
            showNotification('Şifre en az 6 karakter olmalıdır!', 'error');
        } else {
            showNotification('Kayıt sırasında hata oluştu: ' + error.message, 'error');
        }
    } finally {
        submitBtn.classList.remove('loading');
    }
});

// Simulate login API call
function simulateLogin(email, password, rememberMe) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simple validation for demo
            if (email && password) {
                if (email.includes('@') && password.length >= 6) {
                    resolve({ success: true, message: 'Giriş başarılı!' });
                } else {
                    reject(new Error('Geçersiz email veya şifre!'));
                }
            } else {
                reject(new Error('Lütfen tüm alanları doldurun!'));
            }
        }, 1500);
    });
}

// Simulate register API call
function simulateRegister(name, email, phone, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simple validation for demo
            if (name && email && phone && password) {
                if (email.includes('@') && password.length >= 6) {
                    resolve({ success: true, message: 'Kayıt başarılı!' });
                } else {
                    reject(new Error('Geçersiz bilgiler!'));
                }
            } else {
                reject(new Error('Lütfen tüm alanları doldurun!'));
            }
        }, 2000);
    });
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

// Check if user is already logged in
function checkAuthStatus() {
    const userData = localStorage.getItem('noraUser');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.isLoggedIn) {
            // Redirect to dashboard if already logged in
            window.location.href = 'dashboard.html';
        }
    }
}

// Initialize auth check
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Mobile navigation toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
} 