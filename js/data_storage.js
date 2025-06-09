// js/data_storage.js

function initStorage() {
    // Initialize localStorage with default values if not exists
    if (!localStorage.getItem('settings')) {
        const defaultSettings = {
            siteName: 'Student Helper | مساعد الطالب',
            logoUrl: '', // URL to the logo, empty initially
            siteBackgroundImageUrl: '', // URL to the site background, empty initially
            primaryColor: '#2563eb', // Default blue
            navbarColor: '#2563eb', // Default blue, same as primary
            fontFamily: 'Tajawal, sans-serif',
            baseFontSize: 'medium', // 'small', 'medium', 'large'
            homePageTitle: 'مرحبًا بك في مساعد الطالب',
            welcomeMessage: 'أدخل لتجد إجابات دقيقة لأسئلتك الأكاديمية بناءً على المنهج الدراسي',
            footerText: `© ${new Date().getFullYear()} Student Helper. جميع الحقوق محفوظة.`,
            studentViewStyle: 'simple', // 'simple', 'modern'
            themeMode: 'light', // 'light', 'dark', 'auto'
            // Search settings
            enableFuzzySearch: true,
            fuzzySearchThreshold: 0.5,
            enableKeywordSearch: true,
            minKeywordMatch: 2,
            enableDirectMatchFallback: true,
            studentResultsCount: 5,
            // Other settings from original
            enableDevMode: false,
            enableEmailNotifications: false,
            notificationEmail: '',
            notificationFrequency: 'weekly'
        };
        localStorage.setItem('settings', JSON.stringify(defaultSettings));
    }

    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: '1',
                name: 'المشرف الرئيسي',
                username: 'admin',
                password: 'admin123', // In real app, this should be hashed
                role: 'admin',
                lastLogin: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('terms')) {
        const defaultTerms = [
            { id: '1', name: 'الفصل الأول', code: 'term1', active: true },
            { id: '2', name: 'الفصل الثاني', code: 'term2', active: true }
        ];
        localStorage.setItem('terms', JSON.stringify(defaultTerms));
    }

    if (!localStorage.getItem('grades')) {
        const defaultGrades = [
            { id: '1', name: 'الصف الأول', code: 'g1', active: true },
            { id: '2', name: 'الصف الثاني', code: 'g2', active: true },
            { id: '3', name: 'الصف الثالث', code: 'g3', active: true },
            { id: '4', name: 'الصف الرابع', code: 'g4', active: true },
            { id: '5', name: 'الصف الخامس', code: 'g5', active: true },
            { id: '6', name: 'الصف السادس', code: 'g6', active: true }
        ];
        localStorage.setItem('grades', JSON.stringify(defaultGrades));
    }

    if (!localStorage.getItem('subjects')) {
        const defaultSubjects = [
            { id: '1', name: 'اللغة العربية', code: 'arabic', active: true },
            { id: '2', name: 'الرياضيات', code: 'math', active: true },
            { id: '3', name: 'العلوم', code: 'science', active: true },
            { id: '4', name: 'اللغة الإنجليزية', code: 'english', active: true }
        ];
        localStorage.setItem('subjects', JSON.stringify(defaultSubjects));
    }

    if (!localStorage.getItem('units')) {
        const defaultUnits = [
            { id: '1', name: 'الوحدة الأولى', subjectId: '1', active: true, code: 'u1_arabic' },
            { id: '2', name: 'الوحدة الثانية', subjectId: '1', active: true, code: 'u2_arabic' },
            { id: '3', name: 'الوحدة الأولى', subjectId: '2', active: true, code: 'u1_math' },
            { id: '4', name: 'الوحدة الأولى', subjectId: '3', active: true, code: 'u1_science' }
        ];
        localStorage.setItem('units', JSON.stringify(defaultUnits));
    }

    if (!localStorage.getItem('questions')) {
        const defaultQuestions = [
            {
                id: "1",
                question_original: "أكتب الكلمات الملونة داخل الأشكال",
                answer_detailed: "الليل، اللقاء، اللحم، اللبن، اللحاف",
                page_number: "52",
                subject_name_from_json: "لغتي", // Will be derived or mapped
                grade_name_from_json: "الصف الرابع", // Will be derived or mapped
                unit_name: "الوحدة الثانية", // Will be derived or mapped
                term_code: "term1",
                grade_code: "g4",
                subject_code: "arabic",
                unit_code: "u2_arabic", // Added for consistency
                question_normalized: "اكتب الكلمات الملونه داخل الاشكال",
                keywords: ["اكتب", "الكلمات", "الملونه", "الليل", "اللقاء", "اللحم"]
            }
        ];
        localStorage.setItem('questions', JSON.stringify(defaultQuestions));
    }

    if (!localStorage.getItem('questionStats')) {
        localStorage.setItem('questionStats', JSON.stringify({}));
    }

    if (!localStorage.getItem('systemInfo')) {
        const info = {
            version: '1.0.0',
            lastBackup: '',
            totalQuestions: 1,
            totalUsers: 1,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('systemInfo', JSON.stringify(info));
    }
}

function generateId() {
     return Math.random().toString(36).substr(2, 9);
}

// Helper functions to get and set data
function getSettings() {
    return JSON.parse(localStorage.getItem('settings') || '{}');
}
function setSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
    // Potentially trigger a custom event for settings update
    document.dispatchEvent(new CustomEvent('settingsUpdated'));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}
function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getTerms() {
    return JSON.parse(localStorage.getItem('terms') || '[]');
}
function setTerms(terms) {
    localStorage.setItem('terms', JSON.stringify(terms));
}

function getGrades() {
    return JSON.parse(localStorage.getItem('grades') || '[]');
}
function setGrades(grades) {
    localStorage.setItem('grades', JSON.stringify(grades));
}

function getSubjects() {
    return JSON.parse(localStorage.getItem('subjects') || '[]');
}
function setSubjects(subjects) {
    localStorage.setItem('subjects', JSON.stringify(subjects));
}

function getUnits() {
    return JSON.parse(localStorage.getItem('units') || '[]');
}
function setUnits(units) {
    localStorage.setItem('units', JSON.stringify(units));
}

function getQuestions() {
    return JSON.parse(localStorage.getItem('questions') || '[]');
}
function setQuestions(questions) {
    localStorage.setItem('questions', JSON.stringify(questions));
}

function getQuestionStats() {
    return JSON.parse(localStorage.getItem('questionStats') || '{}');
}
function setQuestionStats(stats) {
    localStorage.setItem('questionStats', JSON.stringify(stats));
}

function getSystemInfo() {
    return JSON.parse(localStorage.getItem('systemInfo') || '{}');
}
function setSystemInfo(info) {
    localStorage.setItem('systemInfo', JSON.stringify(info));
}

function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentAdminName() {
    return localStorage.getItem('currentAdminName') || 'المشرف';
}

// Expose functions globally via a namespace
window.dataStorage = {
    initStorage,
    generateId,
    getSettings, setSettings,
    getUsers, setUsers,
    getTerms, setTerms,
    getGrades, setGrades,
    getSubjects, setSubjects,
    getUnits, setUnits,
    getQuestions, setQuestions,
    getQuestionStats, setQuestionStats,
    getSystemInfo, setSystemInfo,
    isLoggedIn, getCurrentAdminName
};

// Initialize storage when the script loads
window.dataStorage.initStorage();