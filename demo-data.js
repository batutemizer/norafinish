// Demo Veriler - Gerçek sistem için örnek veriler

function initializeDemoData() {
    // Demo dersler
    const demoCourses = [
        {
            id: 'course-1',
            name: 'Sayılar ve İşlemler',
            totalVideos: 8,
            totalHours: 6,
            completedVideos: [
                { id: 'v1', title: 'Doğal Sayılar', duration: 45, completedAt: '2024-01-15T10:30:00Z' },
                { id: 'v2', title: 'Tam Sayılar', duration: 52, completedAt: '2024-01-16T14:20:00Z' },
                { id: 'v3', title: 'Rasyonel Sayılar', duration: 38, completedAt: '2024-01-17T09:15:00Z' },
                { id: 'v4', title: 'İrrasyonel Sayılar', duration: 41, completedAt: '2024-01-18T16:45:00Z' },
                { id: 'v5', title: 'Reel Sayılar', duration: 35, completedAt: '2024-01-19T11:30:00Z' },
                { id: 'v6', title: 'Sayı Doğrusu', duration: 28, completedAt: '2024-01-20T13:20:00Z' },
                { id: 'v7', title: 'Mutlak Değer', duration: 33, completedAt: '2024-01-21T15:10:00Z' },
                { id: 'v8', title: 'Sayı Problemleri', duration: 48, completedAt: '2024-01-22T10:45:00Z' }
            ],
            completedHours: 6,
            startDate: '2024-01-15T09:00:00Z',
            lastActivity: '2024-01-22T10:45:00Z',
            status: 'completed',
            progress: 100,
            quizzes: [
                { id: 'q1', score: 8, totalQuestions: 10, percentage: 80, submittedAt: '2024-01-16T15:30:00Z' },
                { id: 'q2', score: 9, totalQuestions: 10, percentage: 90, submittedAt: '2024-01-18T17:20:00Z' },
                { id: 'q3', score: 10, totalQuestions: 10, percentage: 100, submittedAt: '2024-01-22T11:15:00Z' }
            ],
            assignments: [
                { id: 'a1', title: 'Sayı Problemleri Ödevi', submittedAt: '2024-01-20T14:30:00Z', status: 'submitted' }
            ]
        },
        {
            id: 'course-2',
            name: 'Kesirler',
            totalVideos: 8,
            totalHours: 6,
            completedVideos: [
                { id: 'v9', title: 'Kesir Kavramı', duration: 42, completedAt: '2024-01-23T09:30:00Z' },
                { id: 'v10', title: 'Kesir Türleri', duration: 38, completedAt: '2024-01-24T11:15:00Z' },
                { id: 'v11', title: 'Kesirleri Sadeleştirme', duration: 35, completedAt: '2024-01-25T14:20:00Z' },
                { id: 'v12', title: 'Kesirleri Genişletme', duration: 31, completedAt: '2024-01-26T16:45:00Z' },
                { id: 'v13', title: 'Kesirlerde Toplama', duration: 45, completedAt: '2024-01-27T10:30:00Z' },
                { id: 'v14', title: 'Kesirlerde Çıkarma', duration: 41, completedAt: '2024-01-28T13:15:00Z' }
            ],
            completedHours: 4.5,
            startDate: '2024-01-23T09:00:00Z',
            lastActivity: '2024-01-28T13:15:00Z',
            status: 'in-progress',
            progress: 75,
            quizzes: [
                { id: 'q4', score: 7, totalQuestions: 10, percentage: 70, submittedAt: '2024-01-24T12:30:00Z' },
                { id: 'q5', score: 8, totalQuestions: 10, percentage: 80, submittedAt: '2024-01-26T17:45:00Z' }
            ],
            assignments: [
                { id: 'a2', title: 'Kesir Problemleri', submittedAt: '2024-01-27T15:20:00Z', status: 'submitted' }
            ]
        },
        {
            id: 'course-3',
            name: 'Yüzde Problemleri',
            totalVideos: 10,
            totalHours: 8,
            completedVideos: [],
            completedHours: 0,
            startDate: null,
            lastActivity: null,
            status: 'not-started',
            progress: 0,
            quizzes: [],
            assignments: []
        }
    ];

    // Demo aktiviteler
    const demoActivities = [
        {
            type: 'video_watched',
            data: {
                courseId: 'course-1',
                videoId: 'v8',
                videoTitle: 'Sayı Problemleri',
                duration: 48
            },
            timestamp: '2024-01-22T10:45:00Z'
        },
        {
            type: 'quiz_completed',
            data: {
                courseId: 'course-1',
                quizId: 'q3',
                score: 10,
                totalQuestions: 10
            },
            timestamp: '2024-01-22T11:15:00Z'
        },
        {
            type: 'assignment_submitted',
            data: {
                courseId: 'course-1',
                assignmentId: 'a1',
                assignmentTitle: 'Sayı Problemleri Ödevi'
            },
            timestamp: '2024-01-20T14:30:00Z'
        },
        {
            type: 'video_watched',
            data: {
                courseId: 'course-2',
                videoId: 'v14',
                videoTitle: 'Kesirlerde Çıkarma',
                duration: 41
            },
            timestamp: '2024-01-28T13:15:00Z'
        },
        {
            type: 'quiz_completed',
            data: {
                courseId: 'course-2',
                quizId: 'q5',
                score: 8,
                totalQuestions: 10
            },
            timestamp: '2024-01-26T17:45:00Z'
        },
        {
            type: 'assignment_submitted',
            data: {
                courseId: 'course-2',
                assignmentId: 'a2',
                assignmentTitle: 'Kesir Problemleri'
            },
            timestamp: '2024-01-27T15:20:00Z'
        },
        {
            type: 'video_watched',
            data: {
                courseId: 'course-1',
                videoId: 'v7',
                videoTitle: 'Mutlak Değer',
                duration: 33
            },
            timestamp: '2024-01-21T15:10:00Z'
        },
        {
            type: 'video_watched',
            data: {
                courseId: 'course-2',
                videoId: 'v13',
                videoTitle: 'Kesirlerde Toplama',
                duration: 45
            },
            timestamp: '2024-01-27T10:30:00Z'
        }
    ];

    // Demo notlar
    const demoNotes = [
        {
            title: 'Kesir Sadeleştirme Kuralı',
            content: 'Kesirleri sadeleştirirken pay ve paydayı aynı sayıya böleriz. En sade hale getirmek için en büyük ortak böleni (EBOB) kullanırız.',
            category: 'formulas',
            createdAt: '2024-01-25T14:30:00Z'
        },
        {
            title: 'Yüzde Hesaplama',
            content: 'Yüzde = (İstenen / Toplam) × 100\nÖrnek: 25'in %40'ı = (25 × 40) / 100 = 10',
            category: 'formulas',
            createdAt: '2024-01-26T09:15:00Z'
        },
        {
            title: 'Mutlak Değer Özellikleri',
            content: '1. |a| ≥ 0\n2. |a| = |-a|\n3. |a × b| = |a| × |b|\n4. |a + b| ≤ |a| + |b| (Üçgen eşitsizliği)',
            category: 'formulas',
            createdAt: '2024-01-21T16:20:00Z'
        },
        {
            title: 'Sayı Problemleri İpuçları',
            content: '1. Problemi dikkatli oku\n2. Bilinmeyenleri x, y gibi harflerle göster\n3. Denklem kur\n4. Çözümü kontrol et',
            category: 'tips',
            createdAt: '2024-01-22T11:30:00Z'
        }
    ];

    // Demo hedefler
    const demoGoals = [
        { completed: true, completedAt: '2024-01-22T12:00:00Z' },
        { completed: true, completedAt: '2024-01-28T14:00:00Z' },
        { completed: false }
    ];

    // Verileri localStorage'a kaydet
    localStorage.setItem('noraCourses', JSON.stringify(demoCourses));
    localStorage.setItem('noraActivities', JSON.stringify(demoActivities));
    localStorage.setItem('noraNotes', JSON.stringify(demoNotes));
    localStorage.setItem('noraGoals', JSON.stringify(demoGoals));

    console.log('Demo veriler yüklendi!');
}

// Sayfa yüklendiğinde demo verileri yükle (sadece ilk kez)
document.addEventListener('DOMContentLoaded', function() {
    const hasDemoData = localStorage.getItem('noraCourses');
    if (!hasDemoData) {
        initializeDemoData();
    }
}); 