// js/student_page.js

document.addEventListener('DOMContentLoaded', function() {
    // Theme and general settings are applied by ui_common.js
    
    populateStudentSelectInputs();
    setupStudentEventListeners();
});

function populateStudentSelectInputs() {
    const terms = window.dataStorage.getTerms().filter(t => t.active);
    const grades = window.dataStorage.getGrades().filter(g => g.active);
    const subjects = window.dataStorage.getSubjects().filter(s => s.active);

    const termSelect = document.getElementById('studentTerm');
    const gradeSelect = document.getElementById('studentGrade');
    const subjectSelect = document.getElementById('studentSubject');

    terms.forEach(term => {
        const option = document.createElement('option');
        option.value = term.code;
        option.textContent = term.name;
        termSelect.appendChild(option);
    });

    grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade.code;
        option.textContent = grade.name;
        gradeSelect.appendChild(option);
    });

    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.code;
        option.textContent = subject.name;
        subjectSelect.appendChild(option);
    });
}

function setupStudentEventListeners() {
    const submitBtn = document.getElementById('submitStudentQuestionBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleStudentQuestionSubmit);
    }

    const askAnotherBtn = document.getElementById('askAnotherQuestionBtn');
    if (askAnotherBtn) {
        askAnotherBtn.addEventListener('click', resetStudentForm);
    }
}

function handleStudentQuestionSubmit() {
    const termCode = document.getElementById('studentTerm').value;
    const gradeCode = document.getElementById('studentGrade').value;
    const subjectCode = document.getElementById('studentSubject').value;
    const questionText = document.getElementById('studentQuestion').value.trim();

    if (!termCode || !gradeCode || !subjectCode || !questionText) {
        window.uiCommon.showCustomAlert('يرجى ملء جميع الحقول واكتب سؤالك!', 'warning');
        return;
    }

    const allQuestions = window.dataStorage.getQuestions();
    const settings = window.dataStorage.getSettings();

    // Filter questions based on selected term, grade, and subject
    const relevantQuestions = allQuestions.filter(q =>
        q.term_code === termCode &&
        q.grade_code === gradeCode &&
        q.subject_code === subjectCode
    );

    if (relevantQuestions.length === 0) {
        window.uiCommon.showCustomAlert('لا توجد أسئلة متاحة حاليًا لهذا الاختيار من الفصل/الصف/المادة.', 'info');
        displayNoResults();
        return;
    }

    let foundQuestion = null;
    let bestScore = -1; // For Fuse.js, lower is better, but we'll adapt

    // 1. Keyword Search (if enabled)
    if (settings.enableKeywordSearch) {
        const questionKeywords = questionText.toLowerCase().split(/\s+/).filter(kw => kw.length > 2); // Simple keyword extraction
        relevantQuestions.forEach(q => {
            if (q.keywords && q.keywords.length > 0) {
                const matchedKeywordsCount = q.keywords.reduce((count, key) => {
                    return count + (questionKeywords.some(qk => key.toLowerCase().includes(qk) || qk.includes(key.toLowerCase())) ? 1 : 0);
                }, 0);

                if (matchedKeywordsCount >= settings.minKeywordMatch && matchedKeywordsCount > bestScore) {
                    foundQuestion = q;
                    bestScore = matchedKeywordsCount; // Higher count is better here
                }
            }
        });
    }

    // 2. Fuzzy Search (if enabled and no good keyword match or keyword search disabled)
    if ((!foundQuestion || bestScore < settings.minKeywordMatch) && settings.enableFuzzySearch) {
        const fuseOptions = {
            keys: ['question_original', 'question_normalized'],
            threshold: settings.fuzzySearchThreshold || 0.5, // Threshold from settings
            includeScore: true,
            minMatchCharLength: 3,
        };
        const fuse = new Fuse(relevantQuestions, fuseOptions);
        const searchResults = fuse.search(questionText);
        
        if (searchResults.length > 0) {
            // Fuse.js score: 0 is perfect match, 1 is complete mismatch.
            // We want the lowest score, provided it's below the threshold.
            if (!foundQuestion || (searchResults[0].score < bestScore && searchResults[0].score < (1 - settings.fuzzySearchThreshold))) {
                 foundQuestion = searchResults[0].item;
                 bestScore = searchResults[0].score; // Storing Fuse score, lower is better
            } else if (searchResults[0].score < 0.6) { // Heuristic: if a fuzzy match is decent, consider it.
                 foundQuestion = searchResults[0].item;
            }
        }
    }
    
    // 3. Direct Match Fallback (if enabled and still no question found)
    if (!foundQuestion && settings.enableDirectMatchFallback) {
        const normalizedQuestionText = questionText.toLowerCase().replace(/[؟?.!]/g, '');
        for (const q of relevantQuestions) {
            const normalizedOriginal = (q.question_original || '').toLowerCase().replace(/[؟?.!]/g, '');
            const normalizedNormalized = (q.question_normalized || '').toLowerCase().replace(/[؟?.!]/g, '');

            if (normalizedOriginal.includes(normalizedQuestionText) || normalizedNormalized.includes(normalizedQuestionText)) {
                foundQuestion = q;
                break; 
            }
        }
    }


    if (foundQuestion) {
        displayStudentResults(foundQuestion, questionText);
        trackQuestionUsage(foundQuestion.id);
    } else {
        window.uiCommon.showCustomAlert('عذرًا، لم يتم العثور على إجابة دقيقة لسؤالك. حاول صياغة أخرى.', 'info');
        displayNoResults(questionText);
    }
}

function displayStudentResults(questionData, originalStudentQuery) {
    document.getElementById('studentFormContainer').classList.add('hidden');
    document.getElementById('studentResultContainer').classList.remove('hidden');

    document.getElementById('studentOriginalQuestion').textContent = `سؤالك: ${originalStudentQuery} (أقرب سؤال مطابق: ${questionData.question_original})`;
    document.getElementById('studentAnswer').textContent = questionData.answer_detailed;

    // Get names from codes
    const subjects = window.dataStorage.getSubjects();
    const grades = window.dataStorage.getGrades();
    const units = window.dataStorage.getUnits();

    const subjectInfo = subjects.find(s => s.code === questionData.subject_code);
    const gradeInfo = grades.find(g => g.code === questionData.grade_code);
    const unitInfo = units.find(u => u.code === questionData.unit_code && u.subjectId === subjectInfo?.id);


    document.getElementById('studentAnswerSubject').textContent = subjectInfo ? subjectInfo.name : questionData.subject_name_from_json || 'غير محدد';
    document.getElementById('studentAnswerGrade').textContent = gradeInfo ? gradeInfo.name : questionData.grade_name_from_json || 'غير محدد';
    document.getElementById('studentAnswerPage').textContent = questionData.page_number || 'غير محدد';
    document.getElementById('studentAnswerUnit').textContent = unitInfo ? unitInfo.name : questionData.unit_name || 'غير محدد';
}

function displayNoResults(originalStudentQuery = "") {
    document.getElementById('studentFormContainer').classList.add('hidden');
    document.getElementById('studentResultContainer').classList.remove('hidden'); // Show result container to display message

    document.getElementById('studentOriginalQuestion').textContent = `سؤالك: ${originalStudentQuery}`;
    document.getElementById('studentAnswer').textContent = "لم يتم العثور على إجابة. يرجى المحاولة مرة أخرى بسؤال مختلف أو التأكد من اختياراتك.";
    document.getElementById('studentAnswerSubject').textContent = '-';
    document.getElementById('studentAnswerGrade').textContent = '-';
    document.getElementById('studentAnswerPage').textContent = '-';
    document.getElementById('studentAnswerUnit').textContent = '-';
    
    // Customize the message in the green box
    const answerBox = document.querySelector('#studentResultContainer .bg-green-50');
    if (answerBox) {
        answerBox.classList.remove('bg-green-50', 'border-green-500');
        answerBox.classList.add('bg-yellow-50', 'border-yellow-500'); // Change to warning style
        answerBox.querySelector('h3').textContent = '⚠️ لم يتم العثور على إجابة';
        answerBox.querySelector('h3').classList.remove('text-green-800');
        answerBox.querySelector('h3').classList.add('text-yellow-800');
        document.getElementById('studentAnswer').classList.remove('text-green-700');
        document.getElementById('studentAnswer').classList.add('text-yellow-700');
    }
}


function resetStudentForm() {
    document.getElementById('studentFormContainer').classList.remove('hidden');
    document.getElementById('studentResultContainer').classList.add('hidden');
    document.getElementById('studentQuestion').value = '';
    // document.getElementById('studentTerm').selectedIndex = 0;
    // document.getElementById('studentGrade').selectedIndex = 0;
    // document.getElementById('studentSubject').selectedIndex = 0;
    
    // Restore result box style if it was changed for "no results"
    const answerBox = document.querySelector('#studentResultContainer .bg-yellow-50');
    if (answerBox) {
        answerBox.classList.remove('bg-yellow-50', 'border-yellow-500');
        answerBox.classList.add('bg-green-50', 'border-green-500');
        answerBox.querySelector('h3').textContent = '✅ الإجابة:';
        answerBox.querySelector('h3').classList.remove('text-yellow-800');
        answerBox.querySelector('h3').classList.add('text-green-800');
        document.getElementById('studentAnswer').classList.remove('text-yellow-700');
        document.getElementById('studentAnswer').classList.add('text-green-700');
    }
}

function trackQuestionUsage(questionId) {
    let stats = window.dataStorage.getQuestionStats();
    if (!stats[questionId]) {
        stats[questionId] = { askedCount: 0, dates: [] };
    }
    stats[questionId].askedCount += 1;
    stats[questionId].dates.push(new Date().toISOString());
    window.dataStorage.setQuestionStats(stats);
}