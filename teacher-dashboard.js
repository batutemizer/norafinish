// Teacher Dashboard JavaScript

// Global variables
let currentUploadType = '';
let teacherContent = {
    videos: [],
    quizzes: [],
    assignments: [],
    materials: []
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeContentTabs();
    initializeUploadModal();
    initializeAnalytics();
    loadTeacherContent();
    loadStudents();
});

// Navigation functionality
function initializeNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
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
}

// Content tabs functionality
function initializeContentTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            const content = document.getElementById(tabName);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

// Upload modal functionality
function initializeUploadModal() {
    const modal = document.getElementById('uploadModal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelUpload');
    const uploadForm = document.getElementById('uploadForm');
    
    // Close modal
    closeBtn.addEventListener('click', closeUploadModal);
    cancelBtn.addEventListener('click', closeUploadModal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeUploadModal();
        }
    });
    
    // Form submission
    uploadForm.addEventListener('submit', handleUploadSubmit);
}

// Open upload modal
function openUploadModal(type) {
    currentUploadType = type;
    const modal = document.getElementById('uploadModal');
    const title = document.getElementById('uploadModalTitle');
    
    // Set modal title
    const titles = {
        'video': 'Video Yükle',
        'quiz': 'Quiz Oluştur',
        'assignment': 'Ödev Ekle',
        'material': 'Materyal Yükle'
    };
    title.textContent = titles[type] || 'İçerik Yükle';
    
    // Show/hide specific fields
    hideAllContentFields();
    const fieldsDiv = document.getElementById(`${type}Fields`);
    if (fieldsDiv) {
        fieldsDiv.style.display = 'block';
    }
    
    // Reset form
    document.getElementById('uploadForm').reset();
    
    modal.classList.add('active');
}

// Close upload modal
function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.classList.remove('active');
    currentUploadType = '';
    hideAllContentFields();
}

// Hide all content fields
function hideAllContentFields() {
    const fields = ['videoFields', 'quizFields', 'assignmentFields', 'materialFields'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Handle upload form submission
function handleUploadSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    const title = document.getElementById('contentTitle').value;
    const description = document.getElementById('contentDescription').value;
    const course = document.getElementById('contentCourse').value;
    
    // Validate required fields
    if (!title || !course) {
        showNotification('Lütfen gerekli alanları doldurun!', 'error');
        return;
    }
    
    // Create content object
    const content = {
        id: generateId(),
        title: title,
        description: description,
        course: course,
        type: currentUploadType,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    // Add type-specific data
    switch (currentUploadType) {
        case 'video':
            const videoFile = document.getElementById('videoFile').files[0];
            const videoDuration = document.getElementById('videoDuration').value;
            if (!videoFile) {
                showNotification('Lütfen video dosyası seçin!', 'error');
                return;
            }
            content.file = videoFile;
            content.duration = parseInt(videoDuration) || 0;
            content.fileName = videoFile.name;
            content.fileSize = videoFile.size;
            break;
            
        case 'quiz':
            const quizQuestions = document.getElementById('quizQuestions').value;
            const quizDuration = document.getElementById('quizDuration').value;
            content.questions = parseInt(quizQuestions) || 0;
            content.duration = parseInt(quizDuration) || 0;
            break;
            
        case 'assignment':
            const assignmentFile = document.getElementById('assignmentFile').files[0];
            const assignmentDeadline = document.getElementById('assignmentDeadline').value;
            if (!assignmentFile) {
                showNotification('Lütfen ödev dosyası seçin!', 'error');
                return;
            }
            content.file = assignmentFile;
            content.deadline = assignmentDeadline;
            content.fileName = assignmentFile.name;
            content.fileSize = assignmentFile.size;
            break;
            
        case 'material':
            const materialFile = document.getElementById('materialFile').files[0];
            const materialType = document.getElementById('materialType').value;
            if (!materialFile) {
                showNotification('Lütfen materyal dosyası seçin!', 'error');
                return;
            }
            content.file = materialFile;
            content.materialType = materialType;
            content.fileName = materialFile.name;
            content.fileSize = materialFile.size;
            break;
    }
    
    // Simulate upload process
    simulateUpload(content);
}

// Simulate upload process
function simulateUpload(content) {
    const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Yükleniyor...';
    submitBtn.disabled = true;
    
    // Show progress
    showUploadProgress();
    
    setTimeout(() => {
        // Save content
        saveContent(content);
        
        // Update UI
        loadTeacherContent();
        
        // Close modal
        closeUploadModal();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        showNotification(`${content.type === 'video' ? 'Video' : content.type === 'quiz' ? 'Quiz' : content.type === 'assignment' ? 'Ödev' : 'Materyal'} başarıyla yüklendi!`, 'success');
    }, 2000);
}

// Show upload progress
function showUploadProgress() {
    const modal = document.getElementById('uploadModal');
    const progressHtml = `
        <div class="upload-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-text">Yükleniyor... 0%</div>
        </div>
    `;
    
    const form = document.getElementById('uploadForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.insertAdjacentHTML('beforebegin', progressHtml);
    
    // Animate progress
    let progress = 0;
    const progressFill = modal.querySelector('.progress-fill');
    const progressText = modal.querySelector('.progress-text');
    
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Yükleniyor... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 200);
}

// Save content
function saveContent(content) {
    const contentKey = `${content.type}s`;
    if (teacherContent[contentKey]) {
        teacherContent[contentKey].push(content);
    }
    
    // Save to localStorage
    localStorage.setItem('teacherContent', JSON.stringify(teacherContent));
}

// Load teacher content
function loadTeacherContent() {
    const savedContent = localStorage.getItem('teacherContent');
    if (savedContent) {
        teacherContent = JSON.parse(savedContent);
    }
    
    // Load demo content if empty
    if (teacherContent.videos.length === 0) {
        loadDemoContent();
    }
    
    // Render content
    renderContent('videos', teacherContent.videos);
    renderContent('quizzes', teacherContent.quizzes);
    renderContent('assignments', teacherContent.assignments);
    renderContent('materials', teacherContent.materials);
}

// Load demo content
function loadDemoContent() {
    teacherContent = {
        videos: [
            {
                id: 'v1',
                title: 'Doğal Sayılar',
                description: 'Doğal sayılar konusunu detaylı olarak ele alıyoruz.',
                course: 'course-1',
                type: 'video',
                duration: 45,
                fileName: 'dogal_sayilar.mp4',
                fileSize: 125000000,
                createdAt: '2024-01-15T10:30:00Z',
                status: 'active',
                views: 156
            },
            {
                id: 'v2',
                title: 'Kesirlerde Toplama',
                description: 'Kesirlerde toplama işlemi nasıl yapılır?',
                course: 'course-2',
                type: 'video',
                duration: 38,
                fileName: 'kesirlerde_toplama.mp4',
                fileSize: 98000000,
                createdAt: '2024-01-20T14:20:00Z',
                status: 'active',
                views: 89
            }
        ],
        quizzes: [
            {
                id: 'q1',
                title: 'Sayılar Quiz',
                description: 'Doğal sayılar konusu için hazırlanmış quiz.',
                course: 'course-1',
                type: 'quiz',
                questions: 10,
                duration: 15,
                createdAt: '2024-01-16T15:30:00Z',
                status: 'active',
                attempts: 45
            }
        ],
        assignments: [
            {
                id: 'a1',
                title: 'Sayı Problemleri Ödevi',
                description: 'Sayı problemleri konusunda ödev.',
                course: 'course-1',
                type: 'assignment',
                deadline: '2024-01-25T23:59:00Z',
                fileName: 'sayi_problemleri_odev.pdf',
                fileSize: 2500000,
                createdAt: '2024-01-18T10:00:00Z',
                status: 'active',
                submissions: 23
            }
        ],
        materials: [
            {
                id: 'm1',
                title: 'Matematik Formülleri',
                description: 'Temel matematik formülleri listesi.',
                course: 'course-1',
                type: 'material',
                materialType: 'pdf',
                fileName: 'matematik_formulleri.pdf',
                fileSize: 1500000,
                createdAt: '2024-01-17T09:15:00Z',
                status: 'active',
                downloads: 67
            }
        ]
    };
    
    localStorage.setItem('teacherContent', JSON.stringify(teacherContent));
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
                <h3>Henüz ${getTypeName(type)} eklenmemiş</h3>
                <p>İlk ${getTypeName(type).toLowerCase()}nizi eklemek için "Yeni ${getTypeName(type)}" butonuna tıklayın</p>
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
    
    const stats = getContentStats(content);
    
    card.innerHTML = `
        <div class="content-card-header">
            <div>
                <h4 class="content-title">${content.title}</h4>
                <span class="content-type ${content.type}">${getTypeName(content.type)}</span>
            </div>
        </div>
        <div class="content-description">${content.description}</div>
        <div class="content-meta">
            <span>${formatDate(content.createdAt)}</span>
            <span>${stats}</span>
        </div>
        <div class="content-actions">
            <button class="view-btn" onclick="viewContent('${content.id}', '${content.type}')">
                <i class="fas fa-eye"></i> Görüntüle
            </button>
            <button class="edit-btn" onclick="editContent('${content.id}', '${content.type}')">
                <i class="fas fa-edit"></i> Düzenle
            </button>
            <button class="delete-btn" onclick="deleteContent('${content.id}', '${content.type}')">
                <i class="fas fa-trash"></i> Sil
            </button>
        </div>
    `;
    
    return card;
}

// Get content stats
function getContentStats(content) {
    switch (content.type) {
        case 'video':
            return `${content.views || 0} görüntüleme`;
        case 'quiz':
            return `${content.attempts || 0} deneme`;
        case 'assignment':
            return `${content.submissions || 0} teslim`;
        case 'material':
            return `${content.downloads || 0} indirme`;
        default:
            return '';
    }
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

// Generate ID
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Content actions
function viewContent(id, type) {
    showNotification(`${getTypeName(type)} görüntüleniyor...`, 'info');
}

function editContent(id, type) {
    showNotification(`${getTypeName(type)} düzenleniyor...`, 'info');
}

function deleteContent(id, type) {
    if (confirm(`${getTypeName(type)}yi silmek istediğinizden emin misiniz?`)) {
        const contentKey = `${type}s`;
        teacherContent[contentKey] = teacherContent[contentKey].filter(item => item.id !== id);
        localStorage.setItem('teacherContent', JSON.stringify(teacherContent));
        loadTeacherContent();
        showNotification(`${getTypeName(type)} başarıyla silindi!`, 'success');
    }
}

// Load students
function loadStudents() {
    const students = [
        {
            id: 's1',
            name: 'Ahmet Yılmaz',
            email: 'ahmet@example.com',
            registerDate: '2024-01-10T09:00:00Z',
            completedLessons: 15,
            successRate: 85,
            status: 'active'
        },
        {
            id: 's2',
            name: 'Ayşe Demir',
            email: 'ayse@example.com',
            registerDate: '2024-01-12T14:30:00Z',
            completedLessons: 12,
            successRate: 92,
            status: 'active'
        },
        {
            id: 's3',
            name: 'Mehmet Kaya',
            email: 'mehmet@example.com',
            registerDate: '2024-01-15T11:20:00Z',
            completedLessons: 8,
            successRate: 78,
            status: 'active'
        }
    ];
    
    renderStudents(students);
}

// Render students
function renderStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="student-info">
                    <div class="student-avatar">${student.name.charAt(0)}</div>
                    <div>
                        <div class="student-name">${student.name}</div>
                        <div class="student-email">${student.email}</div>
                    </div>
                </div>
            </td>
            <td>${student.email}</td>
            <td>${formatDate(student.registerDate)}</td>
            <td>${student.completedLessons}</td>
            <td>${student.successRate}%</td>
            <td><span class="student-status ${student.status}">${student.status === 'active' ? 'Aktif' : 'Pasif'}</span></td>
            <td>
                <div class="student-actions">
                    <button class="view-btn" onclick="viewStudent('${student.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="message-btn" onclick="messageStudent('${student.id}')">
                        <i class="fas fa-envelope"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Student actions
function viewStudent(id) {
    showNotification('Öğrenci profili görüntüleniyor...', 'info');
}

function messageStudent(id) {
    showNotification('Mesaj gönderiliyor...', 'info');
}

// Initialize analytics
function initializeAnalytics() {
    // Student progress chart
    const studentProgressCtx = document.getElementById('studentProgressChart');
    if (studentProgressCtx) {
        new Chart(studentProgressCtx, {
            type: 'line',
            data: {
                labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
                datasets: [{
                    label: 'Aktif Öğrenci',
                    data: [45, 67, 89, 112, 134, 156],
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
                }
            }
        });
    }
    
    // Course success chart
    const courseSuccessCtx = document.getElementById('courseSuccessChart');
    if (courseSuccessCtx) {
        new Chart(courseSuccessCtx, {
            type: 'doughnut',
            data: {
                labels: ['Sayılar', 'Kesirler', 'Yüzde'],
                datasets: [{
                    data: [85, 78, 92],
                    backgroundColor: ['#1e3a8a', '#d97706', '#059669'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Monthly students chart
    const monthlyStudentsCtx = document.getElementById('monthlyStudentsChart');
    if (monthlyStudentsCtx) {
        new Chart(monthlyStudentsCtx, {
            type: 'bar',
            data: {
                labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
                datasets: [{
                    label: 'Yeni Öğrenci',
                    data: [12, 19, 15, 25, 22, 30],
                    backgroundColor: 'rgba(30, 58, 138, 0.8)',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
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

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        window.location.href = 'index.html';
    }
}); 