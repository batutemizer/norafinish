// Dashboard JavaScript

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
    
    // Update user name
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement && user.name) {
        userNameElement.textContent = user.name;
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeNavigation();
    initializeCharts();
    initializeNotes();
    initializeGoals();
    initializeModal();
});

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
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
                datasets: [{
                    label: 'Çalışma Saati',
                    data: [2, 3, 1.5, 4, 2.5, 3.5, 1],
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