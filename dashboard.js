// Dashboard JavaScript with Firebase Integration

let currentStudent = null;
let studentContent = {
    videos: [],
    quizzes: [],
    assignments: [],
    materials: []
};

// Check authentication
function checkAuth() {
    const userData = localStorage.getItem('noraUser');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userData);
    if (!user.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    currentStudent = user;
    
    // Update user name
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement && user.name) {
        userNameElement.textContent = user.name;
    }
    
    // Load student content from Firebase
    loadStudentContent();
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeNavigation();
    initializeCharts();
    initializeNotes();
    initializeGoals();
    initializeModal();
    initializeContentSections();
});

// Load student content from Firebase
async function loadStudentContent() {
    try {
        if (!currentStudent || !currentStudent.uid) {
            console.log('Demo mode: Loading demo content');
            loadDemoContent();
            return;
        }
        
        // Load content sent to this student from Firestore
        const contentSnapshot = await firebase.firestore().collection('studentContent')
            .where('studentId', '==', currentStudent.uid)
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
            
            const contentKey = `${content.contentType}s`;
            if (studentContent[contentKey]) {
                studentContent[contentKey].push(content);
            }
        });
        
        // If no content found, show empty state
        if (studentContent.videos.length === 0 && 
            studentContent.quizzes.length === 0 && 
            studentContent.assignments.length === 0 && 
            studentContent.materials.length === 0) {
            console.log('No content sent to this student');
        }
        
        // Render content in appropriate sections
        renderStudentContent();
        
    } catch (error) {
        console.error('Error loading student content:', error);
        showNotification('İçerik yüklenirken hata oluştu!', 'error');
    }
}



// Render student content in dashboard sections
function renderStudentContent() {
    // Render videos in courses section
    renderContentSection('videos', 'coursesGrid', 'video');
    
    // Render assignments in assignments section
    renderContentSection('assignments', 'assignmentsGrid', 'assignment');
    
    // Render materials in notes section
    renderContentSection('materials', 'notesGrid', 'material');
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Update recent activities
    updateRecentActivities();
    
    // Update pending content
    updatePendingContent();
}

// Render content in specific section
function renderContentSection(contentType, gridId, iconType) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    const contentArray = studentContent[contentType] || [];
    
    if (contentArray.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-${getContentIcon(iconType)}"></i>
                <h3>Henüz ${getContentTypeName(iconType)} gönderilmemiş</h3>
                <p>Öğretmeniniz size ${getContentTypeName(iconType).toLowerCase()} gönderdiğinde burada görünecek</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    contentArray.forEach(content => {
        const card = createContentCard(content);
        grid.appendChild(card);
    });
}

// Create content card
function createContentCard(content) {
    const card = document.createElement('div');
    card.className = 'content-card';
    
    const statusClass = content.completed ? 'completed' : 'pending';
    const statusText = content.completed ? 'Tamamlandı' : 'Bekliyor';
    
    card.innerHTML = `
        <div class="content-header">
            <h4 class="content-title">${content.contentTitle}</h4>
            <span class="content-status ${statusClass}">${statusText}</span>
        </div>
        <div class="content-description">${content.contentDescription}</div>
        <div class="content-meta">
            <span>${formatDate(content.sentAt)}</span>
        </div>
        <div class="content-actions">
            <button class="view-btn" onclick="viewContent('${content.id}', '${content.contentType}')">
                <i class="fas fa-eye"></i> Görüntüle
            </button>
            ${!content.completed ? `
                <button class="complete-btn" onclick="markAsCompleted('${content.id}', '${content.contentType}')">
                    <i class="fas fa-check"></i> Tamamla
                </button>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Helper functions
function getContentIcon(type) {
    const icons = {
        video: 'play-circle',
        quiz: 'question-circle',
        assignment: 'file-alt',
        material: 'file-pdf'
    };
    return icons[type] || 'file';
}

function getContentTypeName(type) {
    const names = {
        video: 'Video',
        quiz: 'Quiz',
        assignment: 'Ödev',
        material: 'Materyal'
    };
    return names[type] || 'İçerik';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

// View content
function viewContent(contentId, contentType) {
    const content = studentContent[`${contentType}s`].find(c => c.id === contentId);
    if (!content) return;
    
    // For demo, just show a notification
    showNotification(`${content.contentTitle} görüntüleniyor...`, 'info');
}

// Mark content as completed
async function markAsCompleted(contentId, contentType) {
    try {
        const content = studentContent[`${contentType}s`].find(c => c.id === contentId);
        if (!content) return;
        
        content.completed = true;
        content.completedAt = new Date().toISOString();
        
        // Update in Firebase if real student
        if (currentStudent && currentStudent.uid !== 'demo_student_uid') {
            await firebase.firestore().collection('studentContent').doc(contentId).update({
                completed: true,
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Re-render content
        renderStudentContent();
        
        showNotification(`${content.contentTitle} tamamlandı!`, 'success');
        
    } catch (error) {
        console.error('Error marking content as completed:', error);
        showNotification('İçerik tamamlanırken hata oluştu!', 'error');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const allContent = [
        ...studentContent.videos,
        ...studentContent.quizzes,
        ...studentContent.assignments,
        ...studentContent.materials
    ];
    
    const completedContent = allContent.filter(content => content.completed);
    const totalContent = allContent.length;
    const successRate = totalContent > 0 ? Math.round((completedContent.length / totalContent) * 100) : 0;
    
    // Update stats in DOM
    const completedLessonsElement = document.getElementById('completedLessons');
    const totalContentElement = document.getElementById('totalContent');
    const successRateElement = document.getElementById('successRate');
    const activeStreakElement = document.getElementById('activeStreak');
    
    if (completedLessonsElement) completedLessonsElement.textContent = completedContent.length;
    if (totalContentElement) totalContentElement.textContent = totalContent;
    if (successRateElement) successRateElement.textContent = successRate + '%';
    
    // Calculate active streak (consecutive days with activity)
    const activeStreak = calculateActiveStreak(allContent);
    if (activeStreakElement) activeStreakElement.textContent = activeStreak;
}

// Calculate active streak
function calculateActiveStreak(allContent) {
    if (allContent.length === 0) return 0;
    
    const today = new Date();
    const todayStr = today.toDateString();
    let streak = 0;
    let currentDate = new Date();
    
    // Check last 30 days for activity
    for (let i = 0; i < 30; i++) {
        const dateStr = currentDate.toDateString();
        const hasActivity = allContent.some(content => {
            const contentDate = new Date(content.sentAt || content.completedAt);
            return contentDate.toDateString() === dateStr;
        });
        
        if (hasActivity) {
            streak++;
        } else {
            break;
        }
        
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
}

// Update recent activities
function updateRecentActivities() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Get recent activities from content
    const allContent = [
        ...studentContent.videos,
        ...studentContent.quizzes,
        ...studentContent.assignments,
        ...studentContent.materials
    ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).slice(0, 5);
    
    if (allContent.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <h3>Henüz aktivite yok</h3>
                <p>Öğretmeninizden içerik geldiğinde burada görünecek</p>
            </div>
        `;
        return;
    }
    
    const recentActivities = allContent.map(content => {
        const icon = getActivityIcon(content.contentType, content.completed);
        const text = getActivityText(content);
        const timeAgo = getTimeAgo(content.sentAt);
        
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${content.contentTitle}</h4>
                    <p>${text} - ${timeAgo}</p>
                </div>
            </div>
        `;
    }).join('');
    
    activityList.innerHTML = recentActivities;
}

// Update pending content
function updatePendingContent() {
    const pendingList = document.getElementById('pendingContentList');
    if (!pendingList) return;
    
    const pendingContent = [
        ...studentContent.videos,
        ...studentContent.quizzes,
        ...studentContent.assignments,
        ...studentContent.materials
    ].filter(content => !content.completed).slice(0, 3);
    
    if (pendingContent.length === 0) {
        pendingList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Bekleyen içerik yok</h3>
                <p>Öğretmeninizden yeni içerik geldiğinde burada görünecek</p>
            </div>
        `;
        return;
    }
    
    const pendingItems = pendingContent.map(content => {
        const icon = getContentIcon(content.contentType);
        const typeName = getContentTypeName(content.contentType);
        
        return `
            <div class="pending-item">
                <div class="pending-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="pending-content">
                    <h4>${content.contentTitle}</h4>
                    <p>${typeName} - ${getTimeAgo(content.sentAt)}</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="viewContent('${content.id}', '${content.contentType}')">
                    Görüntüle
                </button>
            </div>
        `;
    }).join('');
    
    pendingList.innerHTML = pendingItems;
}

// Helper functions for activities
function getActivityIcon(contentType, completed) {
    if (completed) {
        return 'fa-check-circle';
    }
    
    const icons = {
        video: 'fa-play-circle',
        quiz: 'fa-question-circle',
        assignment: 'fa-file-alt',
        material: 'fa-file-pdf'
    };
    return icons[contentType] || 'fa-file';
}

function getActivityText(content) {
    if (content.completed) {
        return 'tamamlandı';
    }
    
    const typeNames = {
        video: 'video gönderildi',
        quiz: 'quiz gönderildi',
        assignment: 'ödev gönderildi',
        material: 'materyal gönderildi'
    };
    return typeNames[content.contentType] || 'içerik gönderildi';
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
        return `${diffInDays} gün önce`;
    } else if (diffInHours > 0) {
        return `${diffInHours} saat önce`;
    } else {
        return 'Az önce';
    }
}

// Initialize content sections
function initializeContentSections() {
    // This will be called after content is loaded
}

// Navigation functionality
function initializeNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            sidebarLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            navLinks.forEach(n => n.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const sectionId = link.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
            }
            
            // Update nav link
            const navLink = document.querySelector(`[href="#${sectionId}"]`);
            if (navLink) {
                navLink.classList.add('active');
            }
        });
    });
    
    // Nav link navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            sidebarLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            navLinks.forEach(n => n.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                const sectionId = href.substring(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    section.classList.add('active');
                }
                
                // Update sidebar link
                const sidebarLink = document.querySelector(`[data-section="${sectionId}"]`);
                if (sidebarLink) {
                    sidebarLink.classList.add('active');
                }
            }
        });
    });
}

// Initialize charts
function initializeCharts() {
    const ctx = document.getElementById('weeklyChart');
    if (ctx) {
        window.weeklyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
                datasets: [{
                    label: 'Çalışma Saati',
                    data: [0, 0, 0, 0, 0, 0, 0], // Başlangıçta boş
                    borderColor: '#1e3a8a',
                    backgroundColor: 'rgba(30, 58, 138, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// Notes functionality
function initializeNotes() {
    const notesGrid = document.getElementById('notesGrid');
    const addNoteBtn = document.getElementById('addNoteBtn');
    
    // Load existing notes
    loadNotes();
    
    // Add note button
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => {
            openNoteModal();
        });
    }
}

function loadNotes() {
    const notesGrid = document.getElementById('notesGrid');
    const notes = JSON.parse(localStorage.getItem('noraNotes') || '[]');
    
    if (notesGrid) {
        notesGrid.innerHTML = '';
        
        if (notes.length === 0) {
            notesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sticky-note"></i>
                    <h3>Henüz not eklenmemiş</h3>
                    <p>İlk notunuzu eklemek için "Yeni Not" butonuna tıklayın</p>
                </div>
            `;
            return;
        }
        
        notes.forEach((note, index) => {
            const noteCard = createNoteCard(note, index);
            notesGrid.appendChild(noteCard);
        });
    }
}

function createNoteCard(note, index) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
        <div class="note-header">
            <h4 class="note-title">${note.title}</h4>
            <span class="note-category ${note.category}">${getCategoryName(note.category)}</span>
        </div>
        <div class="note-content">${note.content}</div>
        <div class="note-actions">
            <button class="edit-btn" onclick="editNote(${index})">
                <i class="fas fa-edit"></i> Düzenle
            </button>
            <button class="delete-btn" onclick="deleteNote(${index})">
                <i class="fas fa-trash"></i> Sil
            </button>
        </div>
    `;
    return card;
}

function getCategoryName(category) {
    const categories = {
        'general': 'Genel',
        'formulas': 'Formüller',
        'examples': 'Örnekler',
        'tips': 'İpuçları'
    };
    return categories[category] || 'Genel';
}

function editNote(index) {
    const notes = JSON.parse(localStorage.getItem('noraNotes') || '[]');
    const note = notes[index];
    
    if (note) {
        openNoteModal(note, index);
    }
}

function deleteNote(index) {
    if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
        const notes = JSON.parse(localStorage.getItem('noraNotes') || '[]');
        notes.splice(index, 1);
        localStorage.setItem('noraNotes', JSON.stringify(notes));
        loadNotes();
        showNotification('Not başarıyla silindi!', 'success');
    }
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('noteModal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelNote');
    const noteForm = document.getElementById('noteForm');
    
    // Close modal
    closeBtn.addEventListener('click', closeNoteModal);
    cancelBtn.addEventListener('click', closeNoteModal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeNoteModal();
        }
    });
    
    // Form submission
    noteForm.addEventListener('submit', handleNoteSubmit);
}

let editingNoteIndex = -1;

function openNoteModal(note = null, index = -1) {
    const modal = document.getElementById('noteModal');
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');
    const categoryInput = document.getElementById('noteCategory');
    
    editingNoteIndex = index;
    
    if (note) {
        // Edit mode
        titleInput.value = note.title;
        contentInput.value = note.content;
        categoryInput.value = note.category;
        modal.querySelector('.modal-header h3').textContent = 'Notu Düzenle';
    } else {
        // Add mode
        titleInput.value = '';
        contentInput.value = '';
        categoryInput.value = 'general';
        modal.querySelector('.modal-header h3').textContent = 'Yeni Not Ekle';
    }
    
    modal.classList.add('active');
}

function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    modal.classList.remove('active');
    editingNoteIndex = -1;
}

function handleNoteSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const category = document.getElementById('noteCategory').value;
    
    const notes = JSON.parse(localStorage.getItem('noraNotes') || '[]');
    
    if (editingNoteIndex >= 0) {
        // Edit existing note
        notes[editingNoteIndex] = {
            title,
            content,
            category,
            updatedAt: new Date().toISOString()
        };
        showNotification('Not başarıyla güncellendi!', 'success');
    } else {
        // Add new note
        notes.push({
            title,
            content,
            category,
            createdAt: new Date().toISOString()
        });
        showNotification('Not başarıyla eklendi!', 'success');
    }
    
    localStorage.setItem('noraNotes', JSON.stringify(notes));
    loadNotes();
    closeNoteModal();
}

// Goals functionality
function initializeGoals() {
    const goalCheckboxes = document.querySelectorAll('.goal-checkbox input');
    
    goalCheckboxes.forEach((checkbox, index) => {
        checkbox.addEventListener('change', () => {
            const goals = JSON.parse(localStorage.getItem('noraGoals') || '[]');
            
            if (checkbox.checked) {
                goals[index] = { completed: true, completedAt: new Date().toISOString() };
            } else {
                goals[index] = { completed: false };
            }
            
            localStorage.setItem('noraGoals', JSON.stringify(goals));
            
            if (checkbox.checked) {
                showNotification('Hedef tamamlandı! 🎉', 'success');
            }
        });
        
        // Load saved state
        const goals = JSON.parse(localStorage.getItem('noraGoals') || '[]');
        if (goals[index] && goals[index].completed) {
            checkbox.checked = true;
        }
    });
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        localStorage.removeItem('noraUser');
        window.location.href = 'login.html';
    }
});

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

// Mobile navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const sidebar = document.querySelector('.sidebar');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Toggle sidebar on mobile
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }));
}

// Auto-save functionality
setInterval(() => {
    // Auto-save user data every 5 minutes
    const userData = localStorage.getItem('noraUser');
    if (userData) {
        const user = JSON.parse(userData);
        user.lastActivity = new Date().toISOString();
        localStorage.setItem('noraUser', JSON.stringify(user));
    }
}, 300000); // 5 minutes

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N to add new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openNoteModal();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('noteModal');
        if (modal.classList.contains('active')) {
            closeNoteModal();
        }
    }
}); 