// Gerçek İlerleme Takip Sistemi

class ProgressTracker {
    constructor() {
        this.userData = this.loadUserData();
        this.courses = this.loadCourses();
        this.activities = this.loadActivities();
    }

    // Kullanıcı verilerini yükle
    loadUserData() {
        const userData = localStorage.getItem('noraUser');
        return userData ? JSON.parse(userData) : null;
    }

    // Ders verilerini yükle
    loadCourses() {
        return JSON.parse(localStorage.getItem('noraCourses') || '[]');
    }

    // Aktivite verilerini yükle
    loadActivities() {
        return JSON.parse(localStorage.getItem('noraActivities') || '[]');
    }

    // Yeni ders kaydı
    enrollCourse(courseId, courseName, totalVideos, totalHours) {
        const course = {
            id: courseId,
            name: courseName,
            totalVideos: totalVideos,
            totalHours: totalHours,
            completedVideos: 0,
            completedHours: 0,
            startDate: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            status: 'in-progress',
            progress: 0,
            quizzes: [],
            assignments: []
        };

        const courses = this.loadCourses();
        courses.push(course);
        localStorage.setItem('noraCourses', JSON.stringify(courses));
        
        this.updateDashboard();
        return course;
    }

    // Video izleme kaydı
    watchVideo(courseId, videoId, videoTitle, duration) {
        const courses = this.loadCourses();
        const course = courses.find(c => c.id === courseId);
        
        if (course) {
            // Video tamamlandı mı kontrol et
            const existingVideo = course.completedVideos.find(v => v.id === videoId);
            if (!existingVideo) {
                course.completedVideos.push({
                    id: videoId,
                    title: videoTitle,
                    duration: duration,
                    completedAt: new Date().toISOString()
                });
                
                course.completedHours += duration / 60; // dakikayı saate çevir
                course.progress = (course.completedVideos.length / course.totalVideos) * 100;
                
                if (course.progress >= 100) {
                    course.status = 'completed';
                }
                
                course.lastActivity = new Date().toISOString();
            }
        }

        // Aktivite kaydı
        this.addActivity('video_watched', {
            courseId: courseId,
            videoId: videoId,
            videoTitle: videoTitle,
            duration: duration
        });

        localStorage.setItem('noraCourses', JSON.stringify(courses));
        this.updateDashboard();
    }

    // Quiz sonucu kaydı
    submitQuiz(courseId, quizId, score, totalQuestions) {
        const courses = this.loadCourses();
        const course = courses.find(c => c.id === courseId);
        
        if (course) {
            course.quizzes.push({
                id: quizId,
                score: score,
                totalQuestions: totalQuestions,
                percentage: (score / totalQuestions) * 100,
                submittedAt: new Date().toISOString()
            });
        }

        // Aktivite kaydı
        this.addActivity('quiz_completed', {
            courseId: courseId,
            quizId: quizId,
            score: score,
            totalQuestions: totalQuestions
        });

        localStorage.setItem('noraCourses', JSON.stringify(courses));
        this.updateDashboard();
    }

    // Ödev teslimi
    submitAssignment(courseId, assignmentId, assignmentTitle) {
        const courses = this.loadCourses();
        const course = courses.find(c => c.id === courseId);
        
        if (course) {
            course.assignments.push({
                id: assignmentId,
                title: assignmentTitle,
                submittedAt: new Date().toISOString(),
                status: 'submitted'
            });
        }

        // Aktivite kaydı
        this.addActivity('assignment_submitted', {
            courseId: courseId,
            assignmentId: assignmentId,
            assignmentTitle: assignmentTitle
        });

        localStorage.setItem('noraCourses', JSON.stringify(courses));
        this.updateDashboard();
    }

    // Aktivite ekleme
    addActivity(type, data) {
        const activities = this.loadActivities();
        activities.push({
            type: type,
            data: data,
            timestamp: new Date().toISOString()
        });

        // Son 50 aktiviteyi tut
        if (activities.length > 50) {
            activities.splice(0, activities.length - 50);
        }

        localStorage.setItem('noraActivities', JSON.stringify(activities));
    }

    // İstatistikleri hesapla
    calculateStats() {
        const courses = this.loadCourses();
        const activities = this.loadActivities();

        let totalCompletedLessons = 0;
        let totalHours = 0;
        let totalQuizzes = 0;
        let totalQuizScore = 0;
        let streakDays = 0;

        // Ders istatistikleri
        courses.forEach(course => {
            totalCompletedLessons += course.completedVideos.length;
            totalHours += course.completedHours;
            totalQuizzes += course.quizzes.length;
            
            course.quizzes.forEach(quiz => {
                totalQuizScore += quiz.percentage;
            });
        });

        // Başarı oranı
        const successRate = totalQuizzes > 0 ? (totalQuizScore / totalQuizzes) : 0;

        // Günlük seri hesaplama
        streakDays = this.calculateStreak(activities);

        return {
            totalCompletedLessons,
            totalHours: Math.round(totalHours * 10) / 10,
            successRate: Math.round(successRate),
            streakDays,
            totalCourses: courses.length,
            completedCourses: courses.filter(c => c.status === 'completed').length
        };
    }

    // Günlük seri hesaplama
    calculateStreak(activities) {
        if (activities.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let currentDate = new Date(today);

        while (true) {
            const dayActivities = activities.filter(activity => {
                const activityDate = new Date(activity.timestamp);
                activityDate.setHours(0, 0, 0, 0);
                return activityDate.getTime() === currentDate.getTime();
            });

            if (dayActivities.length > 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    // Haftalık çalışma verilerini hesapla
    getWeeklyData() {
        const activities = this.loadActivities();
        const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
        const weeklyData = [0, 0, 0, 0, 0, 0, 0];

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        activities.forEach(activity => {
            if (activity.type === 'video_watched') {
                const activityDate = new Date(activity.timestamp);
                const dayDiff = Math.floor((activityDate - startOfWeek) / (1000 * 60 * 60 * 24));
                
                if (dayDiff >= 0 && dayDiff < 7) {
                    weeklyData[dayDiff] += activity.data.duration / 60; // dakikayı saate çevir
                }
            }
        });

        return weeklyData;
    }

    // Dashboard'ı güncelle
    updateDashboard() {
        const stats = this.calculateStats();
        const weeklyData = this.getWeeklyData();

        // İstatistik kartlarını güncelle
        this.updateStatCards(stats);
        
        // Haftalık grafiği güncelle
        this.updateWeeklyChart(weeklyData);
        
        // Ders kartlarını güncelle
        this.updateCourseCards();
        
        // Aktiviteleri güncelle
        this.updateActivities();
    }

    // İstatistik kartlarını güncelle
    updateStatCards(stats) {
        const statElements = document.querySelectorAll('.stat-content h3');
        if (statElements.length >= 4) {
            statElements[0].textContent = stats.totalCompletedLessons;
            statElements[1].textContent = stats.totalHours;
            statElements[2].textContent = stats.successRate + '%';
            statElements[3].textContent = stats.streakDays;
        }
    }

    // Haftalık grafiği güncelle
    updateWeeklyChart(weeklyData) {
        const ctx = document.getElementById('weeklyChart');
        if (ctx && window.weeklyChart) {
            window.weeklyChart.data.datasets[0].data = weeklyData;
            window.weeklyChart.update();
        }
    }

    // Ders kartlarını güncelle
    updateCourseCards() {
        const courses = this.loadCourses();
        const coursesGrid = document.querySelector('.courses-grid');
        
        if (coursesGrid) {
            coursesGrid.innerHTML = '';
            
            courses.forEach(course => {
                const courseCard = this.createCourseCard(course);
                coursesGrid.appendChild(courseCard);
            });
        }
    }

    // Ders kartı oluştur
    createCourseCard(course) {
        const card = document.createElement('div');
        card.className = 'course-card';
        
        const avgQuizScore = course.quizzes.length > 0 
            ? Math.round(course.quizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / course.quizzes.length)
            : 0;

        card.innerHTML = `
            <div class="course-header">
                <h3>${course.name}</h3>
                <span class="course-status ${course.status}">${this.getStatusText(course.status)}</span>
            </div>
            <div class="course-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress}%"></div>
                </div>
                <span>${Math.round(course.progress)}% tamamlandı</span>
            </div>
            <div class="course-stats">
                <div class="stat">
                    <i class="fas fa-video"></i>
                    <span>${course.completedVideos.length}/${course.totalVideos} video</span>
                </div>
                <div class="stat">
                    <i class="fas fa-clock"></i>
                    <span>${Math.round(course.completedHours)} saat</span>
                </div>
                <div class="stat">
                    <i class="fas fa-star"></i>
                    <span>${avgQuizScore}%</span>
                </div>
            </div>
            <button class="btn btn-primary" onclick="startCourse('${course.id}')">
                ${course.status === 'completed' ? 'Tekrar İzle' : 'Devam Et'}
            </button>
        `;
        
        return card;
    }

    // Durum metni
    getStatusText(status) {
        const statusTexts = {
            'not-started': 'Başlanmadı',
            'in-progress': 'Devam Ediyor',
            'completed': 'Tamamlandı'
        };
        return statusTexts[status] || 'Bilinmiyor';
    }

    // Aktiviteleri güncelle
    updateActivities() {
        const activities = this.loadActivities();
        const activityList = document.querySelector('.activity-list');
        
        if (activityList) {
            activityList.innerHTML = '';
            
            // Son 5 aktiviteyi göster
            const recentActivities = activities.slice(-5).reverse();
            
            recentActivities.forEach(activity => {
                const activityItem = this.createActivityItem(activity);
                activityList.appendChild(activityItem);
            });
        }
    }

    // Aktivite öğesi oluştur
    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        let icon, title, description;
        
        switch (activity.type) {
            case 'video_watched':
                icon = 'fas fa-play';
                title = activity.data.videoTitle;
                description = this.getTimeAgo(activity.timestamp);
                break;
            case 'quiz_completed':
                icon = 'fas fa-star';
                title = 'Quiz Tamamlandı';
                description = `${activity.data.score}/${activity.data.totalQuestions} - ${this.getTimeAgo(activity.timestamp)}`;
                break;
            case 'assignment_submitted':
                icon = 'fas fa-check';
                title = 'Ödev Teslimi';
                description = activity.data.assignmentTitle;
                break;
            default:
                icon = 'fas fa-info';
                title = 'Aktivite';
                description = this.getTimeAgo(activity.timestamp);
        }
        
        item.innerHTML = `
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${title}</h4>
                <p>${description}</p>
            </div>
        `;
        
        return item;
    }

    // Zaman önce hesaplama
    getTimeAgo(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes} dakika önce`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} saat önce`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days} gün önce`;
        }
    }
}

// Global progress tracker instance
let progressTracker;

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function() {
    progressTracker = new ProgressTracker();
    progressTracker.updateDashboard();
});

// Ders başlatma fonksiyonu
function startCourse(courseId) {
    // Burada video player'a yönlendirme yapılabilir
    console.log(`Ders başlatılıyor: ${courseId}`);
    showNotification('Ders başlatılıyor...', 'info');
}

// Video izleme fonksiyonu (örnek)
function watchVideo(courseId, videoId, videoTitle, duration) {
    if (progressTracker) {
        progressTracker.watchVideo(courseId, videoId, videoTitle, duration);
        showNotification('Video kaydedildi!', 'success');
    }
}

// Quiz gönderme fonksiyonu (örnek)
function submitQuiz(courseId, quizId, score, totalQuestions) {
    if (progressTracker) {
        progressTracker.submitQuiz(courseId, quizId, score, totalQuestions);
        showNotification('Quiz sonucu kaydedildi!', 'success');
    }
} 