// Firebase Integrated Student Dashboard

// Global variables
let currentStudent = null;
let studentContent = {
    videos: [],
    quizzes: [],
    assignments: [],
    materials: []
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if student is logged in
    checkStudentAuth();
    
    initializeNavigation();
    loadStudentContent();
    updateDashboardStats();
});

// Check student authentication with Firebase
function checkStudentAuth() {
    firebaseAuth.onAuthStateChanged(function(user) {
        if (user) {
            // Student is authenticated
            currentStudent = {
                email: user.email,
                uid: user.uid
            };
            
            // Load student data from Firestore
            loadStudentData();
        } else {
            // Check localStorage as fallback
            const isLoggedIn = localStorage.getItem('studentLoggedIn');
            const studentEmail = localStorage.getItem('studentEmail');
            
            if (isLoggedIn && studentEmail) {
                currentStudent = {
                    email: studentEmail,
                    name: localStorage.getItem('studentName') || 'Öğrenci',
                    uid: localStorage.getItem('studentUID') || 'demo_uid'
                };
                updateStudentInfo();
            } else {
                // Not authenticated, redirect to login
                window.location.href = 'login.html';
            }
        }
    });
}

// Load student data from Firestore
async function loadStudentData() {
    try {
        const studentDoc = await firebaseDB.collection('students')
            .doc(currentStudent.uid)
            .get();
        
        if (studentDoc.exists) {
            const studentData = studentDoc.data();
            currentStudent = {
                ...currentStudent,
                name: studentData.name,
                registerDate: studentData.registerDate,
                lastActivity: studentData.lastActivity,
                completedLessons: studentData.completedLessons || 0,
                successRate: studentData.successRate || 0
            };
        } else {
            // Create student document if doesn't exist
            await firebaseDB.collection('students').doc(currentStudent.uid).set({
                email: currentStudent.email,
                name: currentStudent.email.split('@')[0],
                registerDate: firebase.firestore.FieldValue.serverTimestamp(),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
                completedLessons: 0,
                successRate: 0,
                status: 'active'
            });
            
            currentStudent.name = currentStudent.email.split('@')[0];
        }
        
        updateStudentInfo();
        
    } catch (error) {
        console.error('Error loading student data:', error);
        // Use fallback data
        currentStudent.name = currentStudent.email.split('@')[0];
        updateStudentInfo();
    }
}

// Update student info in UI
function updateStudentInfo() {
    const studentName = document.getElementById('studentName');
    const studentEmail = document.getElementById('studentEmail');
    const studentAvatar = document.getElementById('studentAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (currentStudent) {
        const name = currentStudent.name || 'Öğrenci';
        const email = currentStudent.email || 'ogrenci@example.com';
        const initial = name.charAt(0).toUpperCase();
        
        if (studentName) studentName.textContent = name;
        if (studentEmail) studentEmail.textContent = email;
        if (studentAvatar) studentAvatar.textContent = initial;
        if (profileName) profileName.textContent = name;
        if (profileEmail) profileEmail.textContent = email;
        if (profileAvatar) profileAvatar.textContent = initial;
        
        if (currentStudent.registerDate) {
            const joinDate = document.getElementById('profileJoinDate');
            if (joinDate) {
                const date = currentStudent.registerDate.toDate ? 
                    currentStudent.registerDate.toDate() : 
                    new Date(currentStudent.registerDate);
                joinDate.textContent = `Katılım: ${date.toLocaleDateString('tr-TR')}`;
            }
        }
    }
}

// Firebase: Load student content
async function loadStudentContent() {
    try {
        // Load content sent to this student from Firestore
        const contentSnapshot = await firebaseDB.collection('studentContent')
            .where('studentId', '==', currentStudent.uid)
            .orderBy('sentAt', 'desc')
            .get();
        
        // Reset content arrays
        studentContent = {
            videos: [],
            quizzes: [],
            assignments: [],
            materials: []
        };
        
        // Process Firebase documents
        contentSnapshot.forEach(doc => {
            const content = {
                id: doc.id,
                ...doc.data()
            };
            
            // Convert timestamp to string
            if (content.sentAt) {
                content.sentAt = content.sentAt.toDate().toISOString();
            }
            if (content.completedAt) {
                content.completedAt = content.completedAt.toDate().toISOString();
            }
            
            const contentKey = `${content.contentType}s`;
            if (studentContent[contentKey]) {
                studentContent[contentKey].push(content);
            }
        });
        
        // If no content found, load demo content
        if (studentContent.videos.length === 0 && 
            studentContent.quizzes.length === 0 && 
            studentContent.assignments.length === 0 && 
            studentContent.materials.length === 0) {
            loadDemoContent();
        }
        
        // Render content
        renderContent('videos', studentContent.videos);
        renderContent('quizzes', studentContent.quizzes);
        renderContent('assignments', studentContent.assignments);
        renderContent('materials', studentContent.materials);
        
        // Update dashboard stats
        updateDashboardStats();
        
    } catch (error) {
        console.error('Error loading student content:', error);
        
        // Load demo content if error
        loadDemoContent();
        
        // Render content
        renderContent('videos', studentContent.videos);
        renderContent('quizzes', studentContent.quizzes);
        renderContent('assignments', studentContent.assignments);
        renderContent('materials', studentContent.materials);
        
        updateDashboardStats();
        
        showNotification('İçerik yüklenirken hata oluştu! Demo içerikler yüklendi.', 'warning');
    }
}

// Load demo content for testing
function loadDemoContent() {
    studentContent = {
        videos: [
            {
                id: 'v1',
                contentTitle: 'Doğal Sayılar',
                contentDescription: 'Doğal sayılar konusunu detaylı olarak ele alıyoruz.',
                contentType: 'video',
                fileUrl: 'https://example.com/video1.mp4',
                sentAt: '2024-01-15T10:30:00Z',
                status: 'sent',
                completed: false,
                completedAt: null
            },
            {
                id: 'v2',
                contentTitle: 'Kesirlerde Toplama',
                contentDescription: 'Kesirlerde toplama işlemi nasıl yapılır?',
                contentType: 'video',
                fileUrl: 'https://example.com/video2.mp4',
                sentAt: '2024-01-20T14:20:00Z',
                status: 'sent',
                completed: true,
                completedAt: '2024-01-21T16:45:00Z'
            }
        ],
        quizzes: [
            {
                id: 'q1',
                contentTitle: 'Sayılar Quiz',
                contentDescription: 'Doğal sayılar konusu için hazırlanmış quiz.',
                contentType: 'quiz',
                sentAt: '2024-01-16T15:30:00Z',
                status: 'sent',
                completed: false,
                completedAt: null
            }
        ],
        assignments: [
            {
                id: 'a1',
                contentTitle: 'Sayı Problemleri Ödevi',
                contentDescription: 'Sayı problemleri konusunda ödev.',
                contentType: 'assignment',
                fileUrl: 'https://example.com/assignment1.pdf',
                sentAt: '2024-01-18T10:00:00Z',
                status: 'sent',
                completed: false,
                completedAt: null
            }
        ],
        materials: [
            {
                id: 'm1',
                contentTitle: 'Matematik Formülleri',
                contentDescription: 'Temel matematik formülleri listesi.',
                contentType: 'material',
                fileUrl: 'https://example.com/formulas.pdf',
                sentAt: '2024-01-17T09:15:00Z',
                status: 'sent',
                completed: true,
                completedAt: '2024-01-18T11:30:00Z'
            }
        ]
    };
}

// Render content
function renderContent(type, contentArray) {
    const grid = document.getElementById(`${type}Grid`);
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (contentArray.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-${getTypeIcon(type)}"></i>
                <h3>Henüz ${getTypeName(type)} gönderilmemiş</h3>
                <p>Öğretmeniniz size ${getTypeName(type).toLowerCase()} gönderdiğinde burada görünecek</p>
            </div>
        `;
        return;
    }
    
    contentArray.forEach(content => {
        const card = createContentCard(content);
        grid.appendChild(card);
    });
}

// Create content card
function createContentCard(content) {
    const card = document.createElement('div');
    card.className = 'content-card';
    
    const status = content.completed ? 'completed' : 'pending';
    const statusText = content.completed ? 'Tamamlandı' : 'Bekliyor';
    const statusIcon = content.completed ? 'fa-check-circle' : 'fa-clock';
    
    card.innerHTML = `
        <div class="content-card-header">
            <div>
                <h4 class="content-title">${content.contentTitle}</h4>
                <span class="content-type ${content.contentType}">${getTypeName(content.contentType)}</span>
            </div>
            <div class="content-status ${status}">
                <i class="fas ${statusIcon}"></i>
                <span>${statusText}</span>
            </div>
        </div>
        <div class="content-description">${content.contentDescription}</div>
        <div class="content-meta">
            <span>Gönderildi: ${formatDate(content.sentAt)}</span>
            ${content.completedAt ? `<span>Tamamlandı: ${formatDate(content.completedAt)}</span>` : ''}
        </div>
        <div class="content-actions">
            ${content.fileUrl ? `
                <a href="${content.fileUrl}" target="_blank" class="btn btn-primary">
                    <i class="fas fa-download"></i> İndir
                </a>
            ` : ''}
            ${!content.completed ? `
                <button class="btn btn-success" onclick="markAsCompleted('${content.id}', '${content.contentType}')">
                    <i class="fas fa-check"></i> Tamamlandı
                </button>
            ` : `
                <button class="btn btn-secondary" disabled>
                    <i class="fas fa-check"></i> Tamamlandı
                </button>
            `}
        </div>
    `;
    
    return card;
}

// Mark content as completed
async function markAsCompleted(contentId, contentType) {
    try {
        // Update in Firebase
        await firebaseDB.collection('studentContent').doc(contentId).update({
            completed: true,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update local data
        const contentKey = `${contentType}s`;
        const content = studentContent[contentKey].find(c => c.id === contentId);
        if (content) {
            content.completed = true;
            content.completedAt = new Date().toISOString();
        }
        
        // Re-render content
        renderContent(contentType, studentContent[contentKey]);
        updateDashboardStats();
        
        showNotification('İçerik tamamlandı olarak işaretlendi!', 'success');
        
    } catch (error) {
        console.error('Error marking content as completed:', error);
        showNotification('İçerik işaretlenirken hata oluştu!', 'error');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const stats = {
        totalVideos: studentContent.videos.length,
        completedVideos: studentContent.videos.filter(v => v.completed).length,
        totalQuizzes: studentContent.quizzes.length,
        completedQuizzes: studentContent.quizzes.filter(q => q.completed).length,
        totalAssignments: studentContent.assignments.length,
        completedAssignments: studentContent.assignments.filter(a => a.completed).length,
        totalMaterials: studentContent.materials.length,
        completedMaterials: studentContent.materials.filter(m => m.completed).length
    };
    
    // Update stats display
    document.getElementById('totalVideos').textContent = stats.totalVideos;
    document.getElementById('completedVideos').textContent = stats.completedVideos;
    document.getElementById('totalQuizzes').textContent = stats.totalQuizzes;
    document.getElementById('completedQuizzes').textContent = stats.completedQuizzes;
    document.getElementById('totalAssignments').textContent = stats.totalAssignments;
    document.getElementById('completedAssignments').textContent = stats.completedAssignments;
    
    // Calculate progress percentages
    const videoProgress = stats.totalVideos > 0 ? Math.round((stats.completedVideos / stats.totalVideos) * 100) : 0;
    const quizProgress = stats.totalQuizzes > 0 ? Math.round((stats.completedQuizzes / stats.totalQuizzes) * 100) : 0;
    const assignmentProgress = stats.totalAssignments > 0 ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100) : 0;
    const materialProgress = stats.totalMaterials > 0 ? Math.round((stats.completedMaterials / stats.totalMaterials) * 100) : 0;
    
    const totalContent = stats.totalVideos + stats.totalQuizzes + stats.totalAssignments + stats.totalMaterials;
    const totalCompleted = stats.completedVideos + stats.completedQuizzes + stats.completedAssignments + stats.completedMaterials;
    const overallProgress = totalContent > 0 ? Math.round((totalCompleted / totalContent) * 100) : 0;
    
    // Update progress bars
    document.getElementById('overallProgress').textContent = `${overallProgress}%`;
    document.getElementById('overallProgressBar').style.width = `${overallProgress}%`;
    
    document.getElementById('videoProgress').textContent = `${videoProgress}%`;
    document.getElementById('videoProgressBar').style.width = `${videoProgress}%`;
    
    document.getElementById('quizProgress').textContent = `${quizProgress}%`;
    document.getElementById('quizProgressBar').style.width = `${quizProgress}%`;
    
    document.getElementById('assignmentProgress').textContent = `${assignmentProgress}%`;
    document.getElementById('assignmentProgressBar').style.width = `${assignmentProgress}%`;
    
    // Update recent activities
    updateRecentActivities();
}

// Update recent activities
function updateRecentActivities() {
    const activitiesGrid = document.getElementById('recentActivities');
    if (!activitiesGrid) return;
    
    // Get all content and sort by date
    const allContent = [
        ...studentContent.videos.map(v => ({ ...v, type: 'video' })),
        ...studentContent.quizzes.map(q => ({ ...q, type: 'quiz' })),
        ...studentContent.assignments.map(a => ({ ...a, type: 'assignment' })),
        ...studentContent.materials.map(m => ({ ...m, type: 'material' }))
    ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).slice(0, 6);
    
    activitiesGrid.innerHTML = '';
    
    if (allContent.length === 0) {
        activitiesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <h3>Henüz aktivite yok</h3>
                <p>Öğretmeniniz size içerik gönderdiğinde burada görünecek</p>
            </div>
        `;
        return;
    }
    
    allContent.forEach(content => {
        const card = document.createElement('div');
        card.className = 'content-card';
        
        const status = content.completed ? 'completed' : 'pending';
        const statusText = content.completed ? 'Tamamlandı' : 'Bekliyor';
        const statusIcon = content.completed ? 'fa-check-circle' : 'fa-clock';
        
        card.innerHTML = `
            <div class="content-card-header">
                <div>
                    <h4 class="content-title">${content.contentTitle}</h4>
                    <span class="content-type ${content.contentType}">${getTypeName(content.contentType)}</span>
                </div>
                <div class="content-status ${status}">
                    <i class="fas ${statusIcon}"></i>
                    <span>${statusText}</span>
                </div>
            </div>
            <div class="content-description">${content.contentDescription}</div>
            <div class="content-meta">
                <span>${formatDate(content.sentAt)}</span>
            </div>
        `;
        
        activitiesGrid.appendChild(card);
    });
}

// Navigation functionality
function initializeNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            sidebarLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const sectionId = link.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
            }
        });
    });
}

// Get type name
function getTypeName(type) {
    const names = {
        'video': 'Video',
        'quiz': 'Quiz',
        'assignment': 'Ödev',
        'material': 'Materyal'
    };
    return names[type] || type;
}

// Get type icon
function getTypeIcon(type) {
    const icons = {
        'video': 'video',
        'quiz': 'question-circle',
        'assignment': 'file-alt',
        'material': 'file-pdf'
    };
    return icons[type] || 'file';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
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
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
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

// Logout functionality with Firebase
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        try {
            // Firebase sign out
            await firebaseAuth.signOut();
            
            // Clear student session
            localStorage.removeItem('studentLoggedIn');
            localStorage.removeItem('studentEmail');
            localStorage.removeItem('studentName');
            localStorage.removeItem('studentUID');
            
            showNotification('Başarıyla çıkış yapıldı!', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Çıkış yapılırken hata oluştu!', 'error');
        }
    }
}); 