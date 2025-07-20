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
    // Initialize UI components first
    initializeNavigation();
    initializeContentTabs();
    initializeUploadModal();
    initializeAnalytics();
    
    // Check if teacher is logged in
    checkTeacherAuth();
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
            
            // Load content after authentication
            loadTeacherContent();
            loadStudents();
        } else {
            // Check localStorage as fallback
            const isLoggedIn = localStorage.getItem('teacherLoggedIn');
            const teacherEmail = localStorage.getItem('teacherEmail');
            
            if (isLoggedIn && teacherEmail === 'aysebuz@gmail.com') {
                currentTeacher = {
                    email: teacherEmail,
                    name: localStorage.getItem('teacherName') || 'Ayşe Buz',
                    uid: localStorage.getItem('teacherUID') || 'demo_uid'
                };
                updateTeacherInfo();
                
                // Load content after authentication
                loadTeacherContent();
                loadStudents();
            } else {
                // Not authenticated, redirect to login
                window.location.href = 'teacher-login.html';
            }
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
        // Check if currentTeacher exists
        if (!currentTeacher || !currentTeacher.email) {
            console.error('Current teacher not found, loading demo content');
            loadDemoContent();
            renderContent('videos', teacherContent.videos);
            renderContent('quizzes', teacherContent.quizzes);
            renderContent('assignments', teacherContent.assignments);
            renderContent('materials', teacherContent.materials);
            return;
        }
        
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

// Firebase: Load students from database
async function loadStudents() {
    try {
        // Check if currentTeacher exists
        if (!currentTeacher || !currentTeacher.email) {
            console.log('Demo mode: Loading demo students');
            loadDemoStudents();
            renderStudents(students);
            return;
        }
        
        // Load students from Firestore
        const studentsSnapshot = await firebaseDB.collection('students').get();
        
        students = [];
        studentsSnapshot.forEach(doc => {
            const student = {
                id: doc.id,
                ...doc.data()
            };
            
            // Convert timestamp to string
            if (student.registerDate) {
                student.registerDate = student.registerDate.toDate().toISOString();
            }
            if (student.lastActivity) {
                student.lastActivity = student.lastActivity.toDate().toISOString();
            }
            
            students.push(student);
        });
        
        // If no students found, load demo students
        if (students.length === 0) {
            loadDemoStudents();
        }
        
        renderStudents(students);
        
    } catch (error) {
        console.error('Error loading students:', error);
        loadDemoStudents();
        renderStudents(students);
        showNotification('Öğrenci listesi yüklenirken hata oluştu! Demo veriler yüklendi.', 'warning');
    }
}

// Load demo students
function loadDemoStudents() {
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
}

// Firebase: Save content with file upload
async function saveContent(content) {
    try {
        // Check if currentTeacher exists
        if (!currentTeacher || !currentTeacher.email) {
            console.error('Current teacher not found, saving to localStorage only');
            // Save to localStorage only for demo
            const contentWithDemo = {
                ...content,
                id: generateId(),
                teacherId: 'aysebuz@gmail.com',
                teacherUID: 'demo_teacher_uid',
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            
            const contentKey = `${content.type}s`;
            if (teacherContent[contentKey]) {
                teacherContent[contentKey].push(contentWithDemo);
            }
            
            localStorage.setItem('teacherContent', JSON.stringify(teacherContent));
            showNotification(`${getTypeName(content.type)} başarıyla kaydedildi! (Demo mod)`, 'success');
            return;
        }
        
        let fileUrl = '';
        
        // Upload file if exists
        if (content.file) {
            const fileRef = firebaseStorage.ref(`content/${currentTeacher.uid}/${Date.now()}_${content.file.name}`);
            const snapshot = await fileRef.put(content.file);
            fileUrl = await snapshot.ref.getDownloadURL();
        }
        
        // Add teacher info to content
        const contentWithTeacher = {
            ...content,
            fileUrl: fileUrl,
            teacherId: currentTeacher.email,
            teacherUID: currentTeacher.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };
        
        // Remove file object before saving to Firestore
        delete contentWithTeacher.file;
        
        // Save to Firebase Firestore
        const docRef = await firebaseDB.collection('content').add(contentWithTeacher);
        
        // Add Firebase document ID to content
        content.id = docRef.id;
        content.fileUrl = fileUrl;
        
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
        
        // Check if currentTeacher exists
        if (!currentTeacher || !currentTeacher.email) {
            console.log('Demo mode: Content sent to student (localStorage only)');
            showNotification(`${student.name} adlı öğrenciye ${getTypeName(contentType)} gönderildi! (Demo mod)`, 'success');
            return;
        }
        
        // Save to student content collection
        await firebaseDB.collection('studentContent').add({
            contentId: contentId,
            studentId: studentId,
            contentType: contentType,
            teacherId: currentTeacher.email,
            contentTitle: content.title,
            contentDescription: content.description,
            fileUrl: content.fileUrl || '',
            sentAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'sent',
            completed: false,
            completedAt: null
        });
        
        showNotification(`${student.name} adlı öğrenciye ${getTypeName(contentType)} gönderildi!`, 'success');
        
    } catch (error) {
        console.error('Error sending content:', error);
        showNotification('İçerik gönderilirken hata oluştu!', 'error');
    }
}

// Firebase: Get student progress
async function getStudentProgress(studentId) {
    try {
        const progressSnapshot = await firebaseDB.collection('studentContent')
            .where('studentId', '==', studentId)
            .get();
        
        const progress = {
            total: 0,
            completed: 0,
            videos: { total: 0, completed: 0 },
            quizzes: { total: 0, completed: 0 },
            assignments: { total: 0, completed: 0 },
            materials: { total: 0, completed: 0 }
        };
        
        progressSnapshot.forEach(doc => {
            const item = doc.data();
            progress.total++;
            
            if (item.completed) {
                progress.completed++;
                progress[`${item.contentType}s`].completed++;
            }
            
            progress[`${item.contentType}s`].total++;
        });
        
        return progress;
        
    } catch (error) {
        console.error('Error getting student progress:', error);
        return null;
    }
}

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
        title: title,
        description: description,
        course: course,
        type: currentUploadType,
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
    
    // Save content to Firebase
    saveContent(content);
    closeUploadModal();
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
        // Check if currentTeacher exists
        if (!currentTeacher || !currentTeacher.email) {
            // Demo mode: delete from localStorage only
            const contentKey = `${type}s`;
            teacherContent[contentKey] = teacherContent[contentKey].filter(item => item.id !== id);
            localStorage.setItem('teacherContent', JSON.stringify(teacherContent));
            loadTeacherContent();
            showNotification(`${getTypeName(type)} başarıyla silindi! (Demo mod)`, 'success');
            return;
        }
        
        // Delete from Firebase
        firebaseDB.collection('content').doc(id).delete().then(() => {
            // Remove from local array
            const contentKey = `${type}s`;
            teacherContent[contentKey] = teacherContent[contentKey].filter(item => item.id !== id);
            localStorage.setItem('teacherContent', JSON.stringify(teacherContent));
            loadTeacherContent();
            showNotification(`${getTypeName(type)} başarıyla silindi!`, 'success');
        }).catch((error) => {
            console.error('Error deleting content:', error);
            showNotification('İçerik silinirken hata oluştu!', 'error');
        });
    }
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