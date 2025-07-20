// Firebase Integrated Teacher Dashboard

// Global variables
let currentUploadType = '';
let teacherContent = {
    videos: [],
    quizzes: [],
    assignments: [],
    materials: []
};
let students = [];
let currentTeacher = null;

// Initialize dashboard with Firebase
document.addEventListener('DOMContentLoaded', function() {
    // Check if teacher is logged in
    checkTeacherAuth();
    
    initializeNavigation();
    initializeContentTabs();
    initializeUploadModal();
    initializeAnalytics();
    loadTeacherContent();
    loadStudents();
});

// Check teacher authentication with Firebase
function checkTeacherAuth() {
    firebaseAuth.onAuthStateChanged(function(user) {
        if (user && user.email === 'aysebuz@gmail.com') {
            // Teacher is authenticated
            currentTeacher = {
                email: user.email,
                name: 'Ayşe Buz',
                uid: user.uid
            };
            
            // Update UI with teacher info
            updateTeacherInfo();
        } else {
            // Not authenticated, redirect to login
            window.location.href = 'teacher-login.html';
        }
    });
}

// Update teacher info in UI
function updateTeacherInfo() {
    const userName = document.querySelector('.user-name');
    if (userName && currentTeacher) {
        userName.textContent = currentTeacher.name;
    }
}

// Firebase: Load teacher content
async function loadTeacherContent() {
    try {
        // Load from Firebase Firestore
        const contentSnapshot = await firebaseDB.collection('content')
            .where('teacherId', '==', currentTeacher.email)
            .orderBy('createdAt', 'desc')
            .get();
        
        // Reset content arrays
        teacherContent = {
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
            
            // Convert timestamp to string for localStorage
            if (content.createdAt) {
                content.createdAt = content.createdAt.toDate().toISOString();
            }
            
            const contentKey = `${content.type}s`;
            if (teacherContent[contentKey]) {
                teacherContent[contentKey].push(content);
            }
        });
        
        // If no content found, load demo content
        if (teacherContent.videos.length === 0 && 
            teacherContent.quizzes.length === 0 && 
            teacherContent.assignments.length === 0 && 
            teacherContent.materials.length === 0) {
            loadDemoContent();
        }
        
        // Save to localStorage for offline access
        localStorage.setItem('teacherContent', JSON.stringify(teacherContent));
        
        // Render content
        renderContent('videos', teacherContent.videos);
        renderContent('quizzes', teacherContent.quizzes);
        renderContent('assignments', teacherContent.assignments);
        renderContent('materials', teacherContent.materials);
        
    } catch (error) {
        console.error('Error loading content:', error);
        
        // Fallback to localStorage
        const savedContent = localStorage.getItem('teacherContent');
        if (savedContent) {
            teacherContent = JSON.parse(savedContent);
        }
        
        // Load demo content if still empty
        if (teacherContent.videos.length === 0) {
            loadDemoContent();
        }
        
        // Render content
        renderContent('videos', teacherContent.videos);
        renderContent('quizzes', teacherContent.quizzes);
        renderContent('assignments', teacherContent.assignments);
        renderContent('materials', teacherContent.materials);
        
        showNotification('İçerik yüklenirken hata oluştu! Offline modda çalışıyor.', 'warning');
    }
}

// Firebase: Load students
async function loadStudents() {
    try {
        // Demo students data - in real implementation, fetch from Firebase
        students = [
            {
                id: 's1',
                name: 'Ahmet Yılmaz',
                email: 'ahmet@example.com',
                registerDate: '2024-01-10T09:00:00Z',
                completedLessons: 15,
                successRate: 85,
                status: 'active',
                courses: ['course-1', 'course-2'],
                lastActivity: '2024-01-20T14:30:00Z'
            },
            {
                id: 's2',
                name: 'Ayşe Demir',
                email: 'ayse@example.com',
                registerDate: '2024-01-12T14:30:00Z',
                completedLessons: 12,
                successRate: 92,
                status: 'active',
                courses: ['course-1'],
                lastActivity: '2024-01-20T16:45:00Z'
            },
            {
                id: 's3',
                name: 'Mehmet Kaya',
                email: 'mehmet@example.com',
                registerDate: '2024-01-15T11:20:00Z',
                completedLessons: 8,
                successRate: 78,
                status: 'active',
                courses: ['course-2', 'course-3'],
                lastActivity: '2024-01-19T10:15:00Z'
            },
            {
                id: 's4',
                name: 'Fatma Özkan',
                email: 'fatma@example.com',
                registerDate: '2024-01-18T09:45:00Z',
                completedLessons: 20,
                successRate: 95,
                status: 'active',
                courses: ['course-1', 'course-2', 'course-3'],
                lastActivity: '2024-01-20T18:20:00Z'
            }
        ];
        
        renderStudents(students);
        
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Öğrenci listesi yüklenirken hata oluştu!', 'error');
    }
}

// Firebase: Save content
async function saveContent(content) {
    try {
        // Add teacher info to content
        const contentWithTeacher = {
            ...content,
            teacherId: currentTeacher.email,
            teacherUID: currentTeacher.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };
        
        // Save to Firebase Firestore
        const docRef = await firebaseDB.collection('content').add(contentWithTeacher);
        
        // Add Firebase document ID to content
        content.id = docRef.id;
        
        // Update local array
        const contentKey = `${content.type}s`;
        if (teacherContent[contentKey]) {
            teacherContent[contentKey].push(content);
        }
        
        // Save to localStorage for offline access
        localStorage.setItem('teacherContent', JSON.stringify(teacherContent));
        
        showNotification(`${getTypeName(content.type)} başarıyla kaydedildi!`, 'success');
        
    } catch (error) {
        console.error('Error saving content:', error);
        showNotification('İçerik kaydedilirken hata oluştu!', 'error');
    }
}

// Firebase: Send content to specific student
async function sendContentToStudent(contentId, studentId, contentType) {
    try {
        const content = teacherContent[`${contentType}s`].find(c => c.id === contentId);
        const student = students.find(s => s.id === studentId);
        
        if (!content || !student) {
            showNotification('İçerik veya öğrenci bulunamadı!', 'error');
            return;
        }
        
        // In real Firebase implementation:
        // await db.collection('studentContent').add({
        //     contentId: contentId,
        //     studentId: studentId,
        //     contentType: contentType,
        //     teacherId: currentTeacher.email,
        //     sentAt: firebase.firestore.FieldValue.serverTimestamp(),
        //     status: 'sent'
        // });
        
        showNotification(`${student.name} adlı öğrenciye ${getTypeName(contentType)} gönderildi!`, 'success');
        
    } catch (error) {
        console.error('Error sending content:', error);
        showNotification('İçerik gönderilirken hata oluştu!', 'error');
    }
}

// Enhanced student rendering with individual content sending
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
                    <button class="view-btn" onclick="viewStudent('${student.id}')" title="Öğrenci Profili">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="message-btn" onclick="messageStudent('${student.id}')" title="Mesaj Gönder">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="send-content-btn" onclick="openSendContentModal('${student.id}')" title="İçerik Gönder">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Open send content modal
function openSendContentModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Create modal for sending content
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${student.name} için İçerik Gönder</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="content-selection">
                    <h4>Gönderilecek İçerik Türü:</h4>
                    <div class="content-type-buttons">
                        <button class="content-type-btn" onclick="showContentList('video', '${studentId}')">
                            <i class="fas fa-video"></i> Video
                        </button>
                        <button class="content-type-btn" onclick="showContentList('quiz', '${studentId}')">
                            <i class="fas fa-question-circle"></i> Quiz
                        </button>
                        <button class="content-type-btn" onclick="showContentList('assignment', '${studentId}')">
                            <i class="fas fa-file-alt"></i> Ödev
                        </button>
                        <button class="content-type-btn" onclick="showContentList('material', '${studentId}')">
                            <i class="fas fa-file-pdf"></i> Materyal
                        </button>
                    </div>
                </div>
                <div id="contentList" class="content-list" style="display: none;">
                    <!-- Content list will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Show content list for sending
function showContentList(contentType, studentId) {
    const contentList = document.getElementById('contentList');
    const contentArray = teacherContent[`${contentType}s`] || [];
    
    if (contentArray.length === 0) {
        contentList.innerHTML = `
            <div class="empty-content">
                <p>Henüz ${getTypeName(contentType)} eklenmemiş.</p>
                <button class="btn btn-primary" onclick="openUploadModal('${contentType}')">
                    Yeni ${getTypeName(contentType)} Ekle
                </button>
            </div>
        `;
    } else {
        contentList.innerHTML = `
            <h4>${getTypeName(contentType)} Listesi:</h4>
            <div class="content-items">
                ${contentArray.map(content => `
                    <div class="content-item">
                        <div class="content-item-info">
                            <h5>${content.title}</h5>
                            <p>${content.description}</p>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="sendContentToStudent('${content.id}', '${studentId}', '${contentType}')">
                            <i class="fas fa-paper-plane"></i> Gönder
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    contentList.style.display = 'block';
}

// Enhanced content rendering with student-specific actions
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
        const card = createEnhancedContentCard(content);
        grid.appendChild(card);
    });
}

// Create enhanced content card with student sending options
function createEnhancedContentCard(content) {
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
            <button class="send-btn" onclick="openSendToStudentsModal('${content.id}', '${content.type}')">
                <i class="fas fa-paper-plane"></i> Öğrencilere Gönder
            </button>
            <button class="delete-btn" onclick="deleteContent('${content.id}', '${content.type}')">
                <i class="fas fa-trash"></i> Sil
            </button>
        </div>
    `;
    
    return card;
}

// Open send to students modal
function openSendToStudentsModal(contentId, contentType) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Öğrencilere İçerik Gönder</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="students-selection">
                    <h4>Gönderilecek Öğrenciler:</h4>
                    <div class="students-list">
                        ${students.map(student => `
                            <div class="student-checkbox">
                                <input type="checkbox" id="student_${student.id}" value="${student.id}">
                                <label for="student_${student.id}">
                                    <div class="student-avatar-small">${student.name.charAt(0)}</div>
                                    <span>${student.name} (${student.email})</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">İptal</button>
                        <button class="btn btn-primary" onclick="sendContentToSelectedStudents('${contentId}', '${contentType}')">
                            <i class="fas fa-paper-plane"></i> Gönder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Send content to selected students
function sendContentToSelectedStudents(contentId, contentType) {
    const selectedStudents = Array.from(document.querySelectorAll('.students-list input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedStudents.length === 0) {
        showNotification('Lütfen en az bir öğrenci seçin!', 'error');
        return;
    }
    
    selectedStudents.forEach(studentId => {
        sendContentToStudent(contentId, studentId, contentType);
    });
    
    // Close modal
    document.querySelector('.modal').remove();
}

// Logout functionality with Firebase
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        try {
            // Firebase sign out
            await firebaseAuth.signOut();
            
            // Clear teacher session
            localStorage.removeItem('teacherLoggedIn');
            localStorage.removeItem('teacherEmail');
            localStorage.removeItem('teacherName');
            localStorage.removeItem('teacherUID');
            
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

// Include all other functions from teacher-dashboard.js
// (Navigation, content tabs, upload modal, analytics, etc.) 