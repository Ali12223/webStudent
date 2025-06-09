// js/dashboard_advanced.js

window.dashboardAdvanced = {
    loadAdvancedFeatures,
};

function loadAdvancedFeatures() {
    loadAdvancedSettingsValues();
    setupAdvancedFeaturesEventListeners();
    displaySystemInformation(); // Load system info when tab is shown
}

function loadAdvancedSettingsValues() {
    const settings = window.dataStorage.getSettings();

    // Developer Mode
    document.getElementById('advEnableDevMode').checked = settings.enableDevMode || false;

    // Smart Search Tools
    document.getElementById('advFuzzySearchThreshold').value = settings.fuzzySearchThreshold || 0.5;
    document.getElementById('advMinKeywordMatch').value = settings.minKeywordMatch || 2;
    
    // Notification Settings
    document.getElementById('advEnableEmailNotifications').checked = settings.enableEmailNotifications || false;
    document.getElementById('advNotificationEmail').value = settings.notificationEmail || '';
    document.getElementById('advNotificationFrequency').value = settings.notificationFrequency || 'weekly';
}

function setupAdvancedFeaturesEventListeners() {
    // Save Advanced Settings Button
    const saveAdvSettingsBtn = document.getElementById('saveAdvancedSettingsBtn');
    if (saveAdvSettingsBtn) {
        saveAdvSettingsBtn.removeEventListener('click', saveAdvancedSettingsHandler);
        saveAdvSettingsBtn.addEventListener('click', saveAdvancedSettingsHandler);
    }

    // Test Search Button
    const testSearchBtn = document.getElementById('advTestSearchBtn');
    if (testSearchBtn) {
        testSearchBtn.removeEventListener('click', testAdvancedSearchHandler);
        testSearchBtn.addEventListener('click', testAdvancedSearchHandler);
    }

    // Data Cleaning Buttons
    const clearTestDataBtn = document.getElementById('advClearTestDataBtn');
    if (clearTestDataBtn) {
        clearTestDataBtn.removeEventListener('click', () => confirmDataClear('test'));
        clearTestDataBtn.addEventListener('click', () => confirmDataClear('test'));
    }
    const clearStatsDataBtn = document.getElementById('advClearStatsDataBtn');
    if (clearStatsDataBtn) {
        clearStatsDataBtn.removeEventListener('click', () => confirmDataClear('stats'));
        clearStatsDataBtn.addEventListener('click', () => confirmDataClear('stats'));
    }
    const resetAllDataBtn = document.getElementById('advResetAllDataBtn');
    if (resetAllDataBtn) {
        resetAllDataBtn.removeEventListener('click', () => confirmDataClear('all'));
        resetAllDataBtn.addEventListener('click', () => confirmDataClear('all'));
    }

    // Import/Export Buttons
    const exportAllDataBtn = document.getElementById('advExportAllDataBtn');
    if (exportAllDataBtn) {
        exportAllDataBtn.removeEventListener('click', exportAllSiteDataHandler);
        exportAllDataBtn.addEventListener('click', exportAllSiteDataHandler);
    }
    const importAllDataInput = document.getElementById('advImportAllDataInput');
    if (importAllDataInput) {
        importAllDataInput.removeEventListener('change', importAllSiteDataHandler);
        importAllDataInput.addEventListener('change', importAllSiteDataHandler);
        importAllDataInput.value = ''; // Reset file input
    }
    
    // Test Notification Button
    const testNotificationBtn = document.getElementById('advTestNotificationBtn');
    if (testNotificationBtn) {
        testNotificationBtn.removeEventListener('click', testNotificationHandler);
        testNotificationBtn.addEventListener('click', testNotificationHandler);
    }
}

function saveAdvancedSettingsHandler() {
    let settings = window.dataStorage.getSettings();

    settings.enableDevMode = document.getElementById('advEnableDevMode').checked;
    settings.fuzzySearchThreshold = parseFloat(document.getElementById('advFuzzySearchThreshold').value);
    settings.minKeywordMatch = parseInt(document.getElementById('advMinKeywordMatch').value, 10);
    
    settings.enableEmailNotifications = document.getElementById('advEnableEmailNotifications').checked;
    settings.notificationEmail = document.getElementById('advNotificationEmail').value.trim();
    settings.notificationFrequency = document.getElementById('advNotificationFrequency').value;

    window.dataStorage.setSettings(settings);
    window.uiCommon.showCustomAlert('تم حفظ الإعدادات المتقدمة بنجاح!', 'success');
}

function testAdvancedSearchHandler() {
    const testQuery = prompt("أدخل استعلام بحث للاختبار:", "ما هي عاصمة السعودية");
    if (!testQuery) return;

    const questions = window.dataStorage.getQuestions();
    if (questions.length === 0) {
        window.uiCommon.showCustomAlert('لا توجد أسئلة في النظام لاختبار البحث.', 'info');
        return;
    }
    
    const settings = window.dataStorage.getSettings(); // Use current settings from form, not necessarily saved ones
    const currentFuzzyThreshold = parseFloat(document.getElementById('advFuzzySearchThreshold').value);
    const currentMinKeywordMatch = parseInt(document.getElementById('advMinKeywordMatch').value, 10);


    // Perform a mock search similar to student_page.js
    let results = [];
    const fuse = new Fuse(questions, {
        keys: ['question_original', 'question_normalized', 'keywords'],
        threshold: currentFuzzyThreshold,
        includeScore: true,
    });
    const fuseResults = fuse.search(testQuery);
    
    if(fuseResults.length > 0) {
        results = fuseResults.map(r => ({text: r.item.question_original, score: r.score, method: `مرن (Score: ${r.score.toFixed(3)})`}));
    }
    
    // Simple keyword matching for testing
    const queryKeywords = testQuery.toLowerCase().split(/\s+/).filter(kw => kw.length > 2);
    questions.forEach(q => {
        if (q.keywords && q.keywords.length > 0) {
            const matchedCount = q.keywords.reduce((count, key) => 
                count + (queryKeywords.some(qk => key.toLowerCase().includes(qk) || qk.includes(key.toLowerCase())) ? 1 : 0), 0);
            if (matchedCount >= currentMinKeywordMatch) {
                // Avoid duplicates if already found by Fuse, unless score is better
                if (!results.some(r => r.text === q.question_original && r.method.startsWith('مرن'))) {
                     results.push({text: q.question_original, score: matchedCount, method: `كلمات مفتاحية (Matches: ${matchedCount})`});
                }
            }
        }
    });

    if (results.length > 0) {
        let resultText = `نتائج اختبار البحث عن "${testQuery}":\n\n`;
        results.slice(0, 5).forEach((res, i) => {
            resultText += `${i+1}. "${res.text.substring(0,50)}..." (الطريقة: ${res.method})\n`;
        });
        alert(resultText); // Using alert for simplicity, a modal would be better
    } else {
        window.uiCommon.showCustomAlert(`لم يتم العثور على نتائج للاستعلام: "${testQuery}"`, 'info');
    }
}

function confirmDataClear(type) {
    let message = "";
    switch (type) {
        case 'test': message = "هل أنت متأكد أنك تريد حذف بيانات الاختبار؟ (هذا إجراء نموذجي، لم يتم تحديد ما هي 'بيانات الاختبار' بالضبط حالياً)"; break;
        case 'stats': message = "هل أنت متأكد أنك تريد حذف جميع إحصائيات استخدام الأسئلة؟"; break;
        case 'all': message = "تحذير شديد! هل أنت متأكد أنك تريد إعادة ضبط جميع بيانات الموقع بالكامل (أسئلة، مستخدمين، إعدادات، إحصائيات)؟ لا يمكن التراجع عن هذا الإجراء!"; break;
        default: return;
    }

    // Simple confirm, ideally replace with a styled confirmation modal
    if (confirm(message)) {
        performDataClear(type);
    }
}

function performDataClear(type) {
    switch (type) {
        case 'test':
            // Define what 'test data' means. Example: questions with a specific tag or ID pattern.
            // For now, this is a placeholder.
            // let questions = window.dataStorage.getQuestions();
            // questions = questions.filter(q => !q.isTestData); // Assuming an isTestData flag
            // window.dataStorage.setQuestions(questions);
            window.uiCommon.showCustomAlert('تم (نظريًا) حذف بيانات الاختبار.', 'success');
            break;
        case 'stats':
            window.dataStorage.setQuestionStats({});
            window.uiCommon.showCustomAlert('تم حذف جميع بيانات الإحصائيات بنجاح.', 'success');
            if (typeof window.dashboardStats?.loadStatistics === 'function') {
                window.dashboardStats.loadStatistics(); // Refresh stats tab if visible/loaded
            }
            break;
        case 'all':
            localStorage.clear(); // Clears everything
            window.dataStorage.initStorage(); // Re-initialize with defaults
            window.uiCommon.showCustomAlert('تمت إعادة ضبط جميع بيانات الموقع بنجاح! سيتم تحديث الصفحة.', 'success');
            setTimeout(() => window.location.reload(), 1500); // Reload to apply default state
            break;
    }
}

function exportAllSiteDataHandler() {
    const backupProgressDiv = document.getElementById('advBackupProgress');
    const backupStatusSpan = document.getElementById('advBackupStatus');
    const backupProgressBar = document.getElementById('advBackupProgressBar');

    backupStatusSpan.textContent = 'جاري تجميع البيانات...';
    backupProgressBar.style.width = '10%';
    backupProgressDiv.classList.remove('hidden');

    setTimeout(() => { // Simulate data gathering
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Exclude sensitive or temporary session data if any specific keys are known
            // if (key === 'isLoggedIn' || key === 'currentAdminName') continue; 
            try {
                allData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                allData[key] = localStorage.getItem(key); // Store as string if not JSON
            }
        }
        backupStatusSpan.textContent = 'جاري إنشاء ملف النسخ الاحتياطي...';
        backupProgressBar.style.width = '70%';

        setTimeout(() => { // Simulate file creation
            const dataStr = JSON.stringify(allData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `student_helper_full_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            backupStatusSpan.textContent = 'اكتمل النسخ الاحتياطي!';
            backupProgressBar.style.width = '100%';
            window.uiCommon.showCustomAlert('تم تصدير جميع بيانات الموقع بنجاح.', 'success');
            
            const systemInfo = window.dataStorage.getSystemInfo();
            systemInfo.lastBackup = new Date().toISOString();
            window.dataStorage.setSystemInfo(systemInfo);
            displaySystemInformation(); // Refresh system info display

            setTimeout(() => { // Hide progress after a bit
                 backupProgressDiv.classList.add('hidden');
                 backupProgressBar.style.width = '0%';
            }, 3000);
        }, 500);
    }, 500);
}

function importAllSiteDataHandler(event) {
    const file = event.target.files[0];
    if (!file) return;

    const backupProgressDiv = document.getElementById('advBackupProgress');
    const backupStatusSpan = document.getElementById('advBackupStatus');
    const backupProgressBar = document.getElementById('advBackupProgressBar');

    if (file.type !== 'application/json') {
        window.uiCommon.showCustomAlert('يرجى اختيار ملف JSON صالح للاستيراد.', 'error');
        event.target.value = ''; // Reset file input
        return;
    }
    
    backupStatusSpan.textContent = 'جاري قراءة ملف الاستيراد...';
    backupProgressBar.style.width = '10%';
    backupProgressDiv.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            backupStatusSpan.textContent = 'جاري تحليل البيانات...';
            backupProgressBar.style.width = '30%';
            const importedData = JSON.parse(e.target.result);

            // Confirmation before overwriting
            if (!confirm("هل أنت متأكد أنك تريد استيراد هذه البيانات؟ سيتم الكتابة فوق جميع البيانات الحالية.")) {
                event.target.value = '';
                backupProgressDiv.classList.add('hidden');
                backupProgressBar.style.width = '0%';
                return;
            }
            
            backupStatusSpan.textContent = 'جاري استيراد البيانات...';
            localStorage.clear(); // Clear existing data
            let itemCount = 0;
            const totalItems = Object.keys(importedData).length;

            for (const key in importedData) {
                if (Object.prototype.hasOwnProperty.call(importedData, key)) {
                    localStorage.setItem(key, JSON.stringify(importedData[key]));
                    itemCount++;
                    backupProgressBar.style.width = `${30 + (itemCount / totalItems) * 60}%`;
                }
            }
            
            // Re-initialize essential settings for the current session if they were overwritten
            // or simply reload the page.
            window.dataStorage.initStorage(); // This might re-apply defaults if keys are missing in imported file.
                                            // A more robust import would validate structure.

            backupStatusSpan.textContent = 'اكتمل الاستيراد بنجاح! يُرجى تحديث الصفحة.';
            backupProgressBar.style.width = '100%';
            window.uiCommon.showCustomAlert('تم استيراد البيانات بنجاح! سيتم إعادة تحميل لوحة التحكم.', 'success');
            setTimeout(() => window.location.reload(), 2000);

        } catch (error) {
            window.uiCommon.showCustomAlert(`خطأ أثناء استيراد البيانات: ${error.message}`, 'error');
            backupProgressDiv.classList.add('hidden');
            backupProgressBar.style.width = '0%';
        } finally {
            event.target.value = ''; // Reset file input
        }
    };
    reader.onerror = function() {
        window.uiCommon.showCustomAlert('خطأ في قراءة ملف الاستيراد.', 'error');
        backupProgressDiv.classList.add('hidden');
        backupProgressBar.style.width = '0%';
        event.target.value = '';
    };
    reader.readAsText(file);
}

function testNotificationHandler() {
    const emailEnabled = document.getElementById('advEnableEmailNotifications').checked;
    const emailAddress = document.getElementById('advNotificationEmail').value.trim();

    if (emailEnabled && emailAddress) {
        // Simulate sending email
        window.uiCommon.showCustomAlert(`تم (نظريًا) إرسال إشعار اختبار إلى: ${emailAddress}`, 'info');
        console.log(`Test Notification: Would send to ${emailAddress}`);
    } else if (emailEnabled && !emailAddress) {
        window.uiCommon.showCustomAlert('يرجى إدخال عنوان بريد إلكتروني لتلقي الإشعارات.', 'warning');
    } else {
        window.uiCommon.showCustomAlert('تم تعطيل إشعارات البريد الإلكتروني.', 'info');
    }
}

function displaySystemInformation() {
    const sysInfoElement = document.getElementById('advSystemInfo');
    if (!sysInfoElement) return;

    const settings = window.dataStorage.getSettings();
    const questions = window.dataStorage.getQuestions();
    const users = window.dataStorage.getUsers();
    const systemInfoData = window.dataStorage.getSystemInfo();

    const info = {
        "إصدار التطبيق": systemInfoData.version || '1.0.0',
        "آخر نسخة احتياطية شاملة": systemInfoData.lastBackup ? new Date(systemInfoData.lastBackup).toLocaleString('ar-EG') : 'لم يتم إنشاؤها',
        "إجمالي الأسئلة": questions.length,
        "إجمالي المستخدمين": users.length,
        "إجمالي الفصول الدراسية": window.dataStorage.getTerms().length,
        "إجمالي الصفوف الدراسية": window.dataStorage.getGrades().length,
        "إجمالي المواد الدراسية": window.dataStorage.getSubjects().length,
        "إجمالي الوحدات الدراسية": window.dataStorage.getUnits().length,
        "آخر تحديث لبيانات النظام (مثال)": systemInfoData.lastUpdated ? new Date(systemInfoData.lastUpdated).toLocaleString('ar-EG') : 'غير معروف',
        "لغة المتصفح": navigator.language,
        "منصة المتصفح": navigator.platform,
        "User Agent": navigator.userAgent.substring(0, 70) + "...",
        "حجم LocalStorage المستخدم (تقريبي)": `${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB`,
        "الوضع المظلم الحالي للنظام": window.matchMedia('(prefers-color-scheme: dark)').matches ? "مفعل" : "غير مفعل",
        "وضع التصميم المختار": settings.themeMode,
        "وقت وتاريخ التحميل الحالي": new Date().toLocaleString('ar-EG'),
    };
    sysInfoElement.textContent = JSON.stringify(info, null, 2);
}