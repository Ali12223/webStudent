// js/dashboard_questions.js

window.dashboardQuestions = {
    loadQuestionManagement, // Main function to load the entire question management section
    loadSearchSettings,    // Function to load the search settings part
};

let questionsData = []; // To store all questions locally for management
let currentPage = 1;
const itemsPerPage = 10;
let currentQuestionSearchQuery = '';

// --- Question Management Main Tab ---
function loadQuestionManagement() {
    // Setup sub-tab navigation for Question Management
    const questionTabButtons = document.querySelectorAll('.question-tab-button');
    questionTabButtons.forEach(button => {
        button.removeEventListener('click', handleQuestionSubTabClick);
        button.addEventListener('click', handleQuestionSubTabClick);
    });

    // Load data for the initially active or remembered sub-tab (e.g., 'upload')
    showQuestionSubTab('uploadQuestionTabContent'); // Default to upload tab

    // Event listeners for upload tab
    const fileUploadInput = document.getElementById('questionFileUpload');
    if (fileUploadInput) {
        fileUploadInput.removeEventListener('change', handleQuestionFileUpload);
        fileUploadInput.addEventListener('change', handleQuestionFileUpload);
    }
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    if(cancelUploadBtn) {
        cancelUploadBtn.removeEventListener('click', cancelQuestionUpload);
        cancelUploadBtn.addEventListener('click', cancelQuestionUpload);
    }
    const confirmUploadBtn = document.getElementById('confirmUploadBtn');
    if(confirmUploadBtn) {
        confirmUploadBtn.removeEventListener('click', confirmQuestionUpload);
        confirmUploadBtn.addEventListener('click', confirmQuestionUpload);
    }


    // Event listeners for manage questions tab
    const searchInput = document.getElementById('questionSearchInput');
    if (searchInput) {
        searchInput.removeEventListener('keyup', handleQuestionSearch);
        searchInput.addEventListener('keyup', handleQuestionSearch);
    }
    const exportBtn = document.getElementById('exportQuestionsBtn');
     if (exportBtn) {
        exportBtn.removeEventListener('click', exportAllQuestions);
        exportBtn.addEventListener('click', exportAllQuestions);
    }
    const deleteAllBtn = document.getElementById('deleteAllQuestionsBtn');
    if (deleteAllBtn) {
        deleteAllBtn.removeEventListener('click', confirmDeleteAllQuestions);
        deleteAllBtn.addEventListener('click', confirmDeleteAllQuestions);
    }
    
    // Modals for manage questions
    const closeDetailsModal = document.getElementById('closeQuestionDetailsModal');
    if (closeDetailsModal) {
        closeDetailsModal.removeEventListener('click', closeQuestionDetailsModalHandler);
        closeDetailsModal.addEventListener('click', closeQuestionDetailsModalHandler);
    }
    const cancelEditQuestion = document.getElementById('cancelEditQuestion');
    if(cancelEditQuestion) {
        cancelEditQuestion.removeEventListener('click', closeQuestionDetailsModalHandler);
        cancelEditQuestion.addEventListener('click', closeQuestionDetailsModalHandler);
    }
    const editForm = document.getElementById('editQuestionForm');
     if (editForm) {
        editForm.removeEventListener('submit', saveQuestionChangesHandler);
        editForm.addEventListener('submit', saveQuestionChangesHandler);
    }

    const closeDeleteAllModalBtn = document.getElementById('closeDeleteAllModalBtn');
    if(closeDeleteAllModalBtn) {
        closeDeleteAllModalBtn.removeEventListener('click', () => closeModal('confirmDeleteAllModal'));
        closeDeleteAllModalBtn.addEventListener('click', () => closeModal('confirmDeleteAllModal'));
    }
    const cancelDeleteAll = document.getElementById('cancelDeleteAll');
     if(cancelDeleteAll) {
        cancelDeleteAll.removeEventListener('click', () => closeModal('confirmDeleteAllModal'));
        cancelDeleteAll.addEventListener('click', () => closeModal('confirmDeleteAllModal'));
    }
    const confirmDeleteAll = document.getElementById('confirmDeleteAll');
    if(confirmDeleteAll) {
        confirmDeleteAll.removeEventListener('click', deleteAllQuestionsHandler);
        confirmDeleteAll.addEventListener('click', deleteAllQuestionsHandler);
    }

    // Load questions for the manage tab (will be called when tab is shown)
    questionsData = window.dataStorage.getQuestions();
    // populateQuestionsTable(); // Called when sub-tab is shown
}

function handleQuestionSubTabClick(event) {
    const subTabId = event.target.dataset.questionTab; // e.g., "upload", "manage"
    if (subTabId) {
        showQuestionSubTab(subTabId + 'TabContent'); // e.g., "uploadTabContent"
    }
}

function showQuestionSubTab(subTabContentId) {
    document.querySelectorAll('.question-sub-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    const activeContent = document.getElementById(subTabContentId);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }

    const subTabKey = subTabContentId.replace('TabContent', ''); // "upload" or "manage"
    document.querySelectorAll('.question-tab-button').forEach(btn => {
        btn.classList.remove('border-primary', 'text-primary');
        btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
         if (document.documentElement.classList.contains('dark')) {
            btn.classList.add('dark:text-gray-400', 'dark:hover:text-gray-200', 'dark:hover:border-gray-500');
            btn.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        }
    });
    const activeButton = document.querySelector(`.question-tab-button[data-question-tab="${subTabKey}"]`);
    if (activeButton) {
        activeButton.classList.add('border-primary', 'text-primary');
        activeButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
         if (document.documentElement.classList.contains('dark')) {
            activeButton.classList.remove('dark:text-gray-400', 'dark:hover:text-gray-200', 'dark:hover:border-gray-500');
            activeButton.classList.add('dark:text-blue-400');
        }
    }

    if (subTabKey === 'manage') {
        questionsData = window.dataStorage.getQuestions(); // Refresh data
        populateQuestionsTable();
    }
}

// --- Upload Questions Sub-Tab ---
let tempUploadedQuestions = null;

function handleQuestionFileUpload(event) {
    const file = event.target.files[0];
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadProgressValue = document.getElementById('uploadProgressValue');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewQuestionsElement = document.getElementById('previewQuestions');

    if (!file) return;
    if (file.type !== 'application/json') {
        window.uiCommon.showCustomAlert('يرجى اختيار ملف JSON صالح.', 'error');
        event.target.value = '';
        return;
    }

    uploadProgress.classList.remove('hidden');
    uploadPreview.classList.add('hidden');
    previewQuestionsElement.textContent = '';
    tempUploadedQuestions = null;

    const reader = new FileReader();
    reader.onprogress = (e) => {
        if (e.lengthComputable) {
            const percentLoaded = Math.round((e.loaded / e.total) * 100);
            uploadProgressValue.textContent = percentLoaded + '%';
            uploadProgressBar.style.width = percentLoaded + '%';
        }
    };
    reader.onload = (e) => {
        try {
            const parsedQuestions = JSON.parse(e.target.result);
            if (!Array.isArray(parsedQuestions) || (parsedQuestions.length > 0 && (!parsedQuestions[0].question_original || !parsedQuestions[0].answer_detailed))) {
                throw new Error('ملف JSON غير صالح أو لا يتبع البنية المطلوبة.');
            }
            tempUploadedQuestions = parsedQuestions;
            previewQuestionsElement.textContent = JSON.stringify(parsedQuestions.slice(0, 5), null, 2);
            uploadProgress.classList.add('hidden');
            uploadPreview.classList.remove('hidden');
            window.uiCommon.showCustomAlert(`تمت قراءة الملف. ${parsedQuestions.length} سؤال جاهز للمعاينة.`, 'info');
        } catch (error) {
            window.uiCommon.showCustomAlert(`خطأ في تحليل الملف: ${error.message}`, 'error');
            uploadProgress.classList.add('hidden');
            event.target.value = '';
        }
    };
    reader.onerror = () => {
        window.uiCommon.showCustomAlert('خطأ في قراءة الملف.', 'error');
        uploadProgress.classList.add('hidden');
        event.target.value = '';
    };
    reader.readAsText(file);
}

function cancelQuestionUpload() {
    document.getElementById('questionFileUpload').value = '';
    document.getElementById('uploadProgress').classList.add('hidden');
    document.getElementById('uploadPreview').classList.add('hidden');
    document.getElementById('previewQuestions').textContent = '';
    tempUploadedQuestions = null;
    window.uiCommon.showCustomAlert('تم إلغاء الرفع.', 'info');
}

function confirmQuestionUpload() {
    if (!tempUploadedQuestions || tempUploadedQuestions.length === 0) {
        window.uiCommon.showCustomAlert('لا توجد أسئلة لرفعها.', 'warning');
        return;
    }

    let existingQuestions = window.dataStorage.getQuestions();
    // Simple merge: add new questions. For robust solution, add ID generation and de-duplication.
    const newQuestionsWithIds = tempUploadedQuestions.map(q => ({
        ...q,
        id: q.id || window.dataStorage.generateId(), // Ensure ID exists
        // Normalize and extract keywords if not present
        question_normalized: q.question_normalized || q.question_original.toLowerCase().replace(/[؟?.!,]/g, ''),
        keywords: q.keywords || q.question_original.split(/\s+/).filter(kw => kw.length > 2).slice(0,10) // Basic keyword extraction
    }));

    const updatedQuestions = existingQuestions.concat(newQuestionsWithIds);
    window.dataStorage.setQuestions(updatedQuestions);
    window.uiCommon.showCustomAlert(`تم رفع ${newQuestionsWithIds.length} سؤال بنجاح!`, 'success');
    
    cancelQuestionUpload(); // Reset upload UI
    if (typeof window.dashboardStats !== 'undefined' && typeof window.dashboardStats.loadStatistics === 'function') {
         window.dashboardStats.loadStatistics(); // Update stats if stats module is loaded
    }
}


// --- Manage Questions Sub-Tab ---
function populateQuestionsTable() {
    const tableBody = document.getElementById('questionsTableBody');
    const paginationInfo = document.getElementById('paginationInfo');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    if (!tableBody || !paginationInfo || !prevPageBtn || !nextPageBtn) return;
    
    questionsData = window.dataStorage.getQuestions(); // Refresh from storage

    let filteredQuestions = questionsData;
    if (currentQuestionSearchQuery) {
        const fuse = new Fuse(questionsData, {
            keys: ['question_original', 'answer_detailed', 'subject_name_from_json', 'grade_name_from_json', 'keywords'],
            threshold: 0.4,
        });
        filteredQuestions = fuse.search(currentQuestionSearchQuery).map(result => result.item);
    }


    const totalItems = filteredQuestions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    currentPage = Math.min(currentPage, totalPages) || 1; // Adjust if current page is out of bounds

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    tableBody.innerHTML = '';
    if (paginatedQuestions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-gray-500 dark:text-gray-400">لا توجد أسئلة تطابق البحث أو لم يتم تحميل أسئلة بعد.</td></tr>`;
    } else {
        const subjects = window.dataStorage.getSubjects();
        const grades = window.dataStorage.getGrades();

        paginatedQuestions.forEach(q => {
            const subjectName = subjects.find(s => s.code === q.subject_code)?.name || q.subject_name_from_json || 'غير محدد';
            const gradeName = grades.find(g => g.code === q.grade_code)?.name || q.grade_name_from_json || 'غير محدد';
            const row = tableBody.insertRow();
            row.className = "hover:bg-gray-50 dark:hover:bg-gray-600";
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-gray-100 max-w-md truncate" title="${q.question_original}">${q.question_original}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${subjectName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${gradeName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-id="${q.id}" class="edit-question-btn text-primary dark:text-blue-400 hover:underline mr-2 ml-2">تفاصيل/تعديل</button>
                    <button data-id="${q.id}" class="delete-question-btn text-red-600 dark:text-red-400 hover:underline">حذف</button>
                </td>
            `;
        });
    }

    // Update pagination info
    paginationInfo.textContent = `إظهار ${totalItems > 0 ? startIndex + 1 : 0} إلى ${endIndex} من ${totalItems} سؤال`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

    prevPageBtn.removeEventListener('click', goToPrevPage); // Remove old before adding new
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.removeEventListener('click', goToNextPage);
    nextPageBtn.addEventListener('click', goToNextPage);

    // Event delegation for table actions
    tableBody.removeEventListener('click', handleQuestionTableActions);
    tableBody.addEventListener('click', handleQuestionTableActions);
}

function handleQuestionTableActions(event) {
    const target = event.target;
    if (target.classList.contains('edit-question-btn')) {
        openQuestionDetailsModal(target.dataset.id);
    } else if (target.classList.contains('delete-question-btn')) {
        deleteSingleQuestionHandler(target.dataset.id);
    }
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        populateQuestionsTable();
    }
}
function goToNextPage() {
    const totalItems = currentQuestionSearchQuery ? 
                       new Fuse(questionsData, {keys: ['question_original']}).search(currentQuestionSearchQuery).length :
                       questionsData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        populateQuestionsTable();
    }
}

function handleQuestionSearch(event) {
    currentQuestionSearchQuery = event.target.value.toLowerCase();
    currentPage = 1; // Reset to first page on new search
    populateQuestionsTable();
}

function openQuestionDetailsModal(questionId) {
    const question = questionsData.find(q => q.id === questionId);
    if (!question) {
        window.uiCommon.showCustomAlert('السؤال غير موجود.', 'error');
        return;
    }

    document.getElementById('editQuestionId').value = question.id;
    document.getElementById('editQuestionText').value = question.question_original;
    document.getElementById('editQuestionNormalized').value = question.question_normalized || '';
    document.getElementById('editQuestionAnswer').value = question.answer_detailed;
    document.getElementById('editQuestionPage').value = question.page_number || '';
    document.getElementById('editQuestionKeywords').value = (question.keywords || []).join(', ');

    // Populate selects
    const populateSelect = (selectId, items, itemCodeField, currentCode) => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">اختر...</option>';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[itemCodeField];
            option.textContent = item.name;
            if (item[itemCodeField] === currentCode) option.selected = true;
            select.appendChild(option);
        });
    };
    
    populateSelect('editQuestionTerm', window.dataStorage.getTerms(), 'code', question.term_code);
    populateSelect('editQuestionGrade', window.dataStorage.getGrades(), 'code', question.grade_code);
    populateSelect('editQuestionSubject', window.dataStorage.getSubjects(), 'code', question.subject_code);
    
    // Units need to be filtered by subject if subject_code is present
    const units = window.dataStorage.getUnits();
    const subject = window.dataStorage.getSubjects().find(s => s.code === question.subject_code);
    const filteredUnits = subject ? units.filter(u => u.subjectId === subject.id) : units; // Fallback to all units if no subject
    populateSelect('editQuestionUnit', filteredUnits, 'code', question.unit_code);


    openModal('questionDetailsModal');
}

function closeQuestionDetailsModalHandler() {
    closeModal('questionDetailsModal');
}

function saveQuestionChangesHandler(event) {
    event.preventDefault();
    const id = document.getElementById('editQuestionId').value;
    const updatedQuestion = {
        id,
        question_original: document.getElementById('editQuestionText').value.trim(),
        question_normalized: document.getElementById('editQuestionNormalized').value.trim(),
        answer_detailed: document.getElementById('editQuestionAnswer').value.trim(),
        page_number: document.getElementById('editQuestionPage').value.trim(),
        term_code: document.getElementById('editQuestionTerm').value,
        grade_code: document.getElementById('editQuestionGrade').value,
        subject_code: document.getElementById('editQuestionSubject').value,
        unit_code: document.getElementById('editQuestionUnit').value,
        keywords: document.getElementById('editQuestionKeywords').value.split(',').map(k => k.trim()).filter(Boolean),
    };

    // Add names for display consistency (though these might be better derived on student side)
    const term = window.dataStorage.getTerms().find(t => t.code === updatedQuestion.term_code);
    const grade = window.dataStorage.getGrades().find(g => g.code === updatedQuestion.grade_code);
    const subject = window.dataStorage.getSubjects().find(s => s.code === updatedQuestion.subject_code);
    const unit = window.dataStorage.getUnits().find(u => u.code === updatedQuestion.unit_code && u.subjectId === subject?.id);

    updatedQuestion.term_name_from_json = term?.name;
    updatedQuestion.grade_name_from_json = grade?.name;
    updatedQuestion.subject_name_from_json = subject?.name;
    updatedQuestion.unit_name_from_json = unit?.name;


    const index = questionsData.findIndex(q => q.id === id);
    if (index !== -1) {
        questionsData[index] = updatedQuestion;
        window.dataStorage.setQuestions(questionsData);
        window.uiCommon.showCustomAlert('تم حفظ تعديلات السؤال بنجاح!', 'success');
        populateQuestionsTable();
        closeQuestionDetailsModalHandler();
    } else {
        window.uiCommon.showCustomAlert('خطأ: السؤال غير موجود.', 'error');
    }
}

function deleteSingleQuestionHandler(questionId) {
    const question = questionsData.find(q => q.id === questionId);
    if (!question) return;

    const confirmModal = document.getElementById('deleteSingleQuestionConfirmModal');
    if (confirmModal) confirmModal.remove(); // Remove if already exists

    const modal = document.createElement('div');
    modal.id = 'deleteSingleQuestionConfirmModal';
    modal.className = 'fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">تأكيد الحذف</h3>
            <p class="mb-4 text-gray-600 dark:text-gray-300">هل أنت متأكد أنك تريد حذف هذا السؤال: "${question.question_original.substring(0, 50)}..."؟</p>
            <div class="flex justify-end space-x-3 space-x-reverse">
                <button class="cancel-delete-single-q bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg">إلغاء</button>
                <button class="confirm-delete-single-q bg-red-600 text-white px-4 py-2 rounded-lg">حذف</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.cancel-delete-single-q').addEventListener('click', () => modal.remove());
    modal.querySelector('.confirm-delete-single-q').addEventListener('click', () => {
        questionsData = questionsData.filter(q => q.id !== questionId);
        window.dataStorage.setQuestions(questionsData);
        window.uiCommon.showCustomAlert('تم حذف السؤال بنجاح.', 'success');
        populateQuestionsTable();
        modal.remove();
        if (typeof window.dashboardStats !== 'undefined' && typeof window.dashboardStats.loadStatistics === 'function') {
             window.dashboardStats.loadStatistics();
        }
    });
}

function exportAllQuestions() {
    const data = JSON.stringify(window.dataStorage.getQuestions(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_helper_questions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.uiCommon.showCustomAlert('تم بدء تصدير الأسئلة.', 'info');
}

function confirmDeleteAllQuestions() {
    if (questionsData.length === 0) {
        window.uiCommon.showCustomAlert('لا توجد أسئلة لحذفها.', 'info');
        return;
    }
    openModal('confirmDeleteAllModal');
}

function deleteAllQuestionsHandler() {
    window.dataStorage.setQuestions([]);
    questionsData = []; // Update local cache
    window.uiCommon.showCustomAlert('تم حذف جميع الأسئلة بنجاح!', 'success');
    populateQuestionsTable();
    closeModal('confirmDeleteAllModal');
    if (typeof window.dashboardStats !== 'undefined' && typeof window.dashboardStats.loadStatistics === 'function') {
         window.dashboardStats.loadStatistics();
    }
}


// --- Question Search Settings (Part of Question Management for now) ---
function loadSearchSettings() {
    // This function is called when the "Question Search Settings" tab is activated
    // It will load settings from dataStorage and populate the form fields
    const settings = window.dataStorage.getSettings();

    const fuzzySearchToggle = document.getElementById('enableFuzzySearchGlobal');
    const fuzzyThresholdSelect = document.getElementById('fuzzySearchThresholdGlobal');
    const keywordSearchToggle = document.getElementById('enableKeywordSearchGlobal');
    const minKeywordMatchInput = document.getElementById('minKeywordMatchGlobal');
    const directMatchFallbackToggle = document.getElementById('enableDirectMatchFallbackGlobal');
    const studentResultsCountInput = document.getElementById('studentResultsCountGlobal');

    if(fuzzySearchToggle) fuzzySearchToggle.checked = settings.enableFuzzySearch !== false; // Default true
    if(fuzzyThresholdSelect) fuzzyThresholdSelect.value = settings.fuzzySearchThreshold || 0.5;
    if(keywordSearchToggle) keywordSearchToggle.checked = settings.enableKeywordSearch !== false; // Default true
    if(minKeywordMatchInput) minKeywordMatchInput.value = settings.minKeywordMatch || 2;
    if(directMatchFallbackToggle) directMatchFallbackToggle.checked = settings.enableDirectMatchFallback !== false; // Default true
    if(studentResultsCountInput) studentResultsCountInput.value = settings.studentResultsCount || 5;

    const saveSearchSettingsBtn = document.getElementById('saveQuestionSearchSettingsBtn');
    if(saveSearchSettingsBtn) {
        saveSearchSettingsBtn.removeEventListener('click', saveQuestionSearchSettingsHandler);
        saveSearchSettingsBtn.addEventListener('click', saveQuestionSearchSettingsHandler);
    }
}

function saveQuestionSearchSettingsHandler() {
    let settings = window.dataStorage.getSettings();

    settings.enableFuzzySearch = document.getElementById('enableFuzzySearchGlobal').checked;
    settings.fuzzySearchThreshold = parseFloat(document.getElementById('fuzzySearchThresholdGlobal').value);
    settings.enableKeywordSearch = document.getElementById('enableKeywordSearchGlobal').checked;
    settings.minKeywordMatch = parseInt(document.getElementById('minKeywordMatchGlobal').value, 10);
    settings.enableDirectMatchFallback = document.getElementById('enableDirectMatchFallbackGlobal').checked;
    settings.studentResultsCount = parseInt(document.getElementById('studentResultsCountGlobal').value, 10);

    window.dataStorage.setSettings(settings);
    window.uiCommon.showCustomAlert('تم حفظ إعدادات بحث الأسئلة بنجاح!', 'success');
}


// Helper to open/close modals (can be made global in ui_common.js if reused more)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const modalContent = modal.querySelector('div > div'); // First direct child div
    modal.classList.remove('hidden');
    setTimeout(() => { 
        modal.classList.remove('opacity-0');
        if(modalContent) modalContent.classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const modalContent = modal.querySelector('div > div');
    modal.classList.add('opacity-0');
    if(modalContent) modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300); 
}