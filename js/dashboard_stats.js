// js/dashboard_stats.js

window.dashboardStats = {
    loadStatistics,
};

function loadStatistics() {
    updateStatCards();
    renderAllCharts();
    populateCommonQuestionsTable();
    setupExportButtons();
    generateFullReportPreview();
}

function updateStatCards() {
    const questions = window.dataStorage.getQuestions();
    const questionStats = window.dataStorage.getQuestionStats(); // { questionId: { askedCount: X, dates: [] }}

    document.getElementById('statsTotalQuestionsCount').textContent = questions.length;

    const keywordQuestions = questions.filter(q => q.keywords && q.keywords.length > 0).length;
    document.getElementById('statsKeywordQuestionsCount').textContent = keywordQuestions;

    let commonQuestionsCount = 0;
    let unansweredCount = questions.length; // Start with all, then subtract those with stats
    
    if (Object.keys(questionStats).length > 0) {
        unansweredCount = 0; // Reset if stats exist
        let askedQuestionIds = new Set();
        for (const qId in questionStats) {
            if (questionStats[qId].askedCount > 1) { // Example: asked more than once is "common"
                commonQuestionsCount++;
            }
            askedQuestionIds.add(qId);
        }
        questions.forEach(q => {
            if (!askedQuestionIds.has(q.id)) {
                unansweredCount++;
            }
        });

    }
    document.getElementById('statsCommonQuestionsCount').textContent = commonQuestionsCount;
    document.getElementById('statsUnansweredQuestionsCount').textContent = unansweredCount; // Or questions with 0 askedCount
}

function renderAllCharts() {
    const questions = window.dataStorage.getQuestions();
    const subjects = window.dataStorage.getSubjects();
    const grades = window.dataStorage.getGrades();

    // Chart 1: Questions by Subject
    const subjectCounts = {};
    questions.forEach(q => {
        const subject = subjects.find(s => s.code === q.subject_code);
        const subjectName = subject ? subject.name : (q.subject_name_from_json || 'غير محدد');
        subjectCounts[subjectName] = (subjectCounts[subjectName] || 0) + 1;
    });
    window.dashboardCharts.createBarChart('questionsBySubjectChart',
        Object.keys(subjectCounts),
        [{ label: 'عدد الأسئلة', data: Object.values(subjectCounts), backgroundColor: 'var(--primary-color)' }],
        'توزيع الأسئلة حسب المادة'
    );

    // Chart 2: Questions by Grade
    const gradeCounts = {};
    questions.forEach(q => {
        const grade = grades.find(g => g.code === q.grade_code);
        const gradeName = grade ? grade.name : (q.grade_name_from_json || 'غير محدد');
        gradeCounts[gradeName] = (gradeCounts[gradeName] || 0) + 1;
    });
     const pieColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#8D5B4C', '#C9CBCF', '#2ECC71', '#E74C3C' 
    ];
    window.dashboardCharts.createPieChart('questionsByGradeChart',
        Object.keys(gradeCounts),
        Object.values(gradeCounts),
        'توزيع الأسئلة حسب الصف',
        { colors: pieColors.slice(0, Object.keys(gradeCounts).length) }
    );

    // Chart 3: Most Used Keywords (Top 10)
    const keywordCounts = {};
    questions.forEach(q => {
        if (q.keywords && Array.isArray(q.keywords)) {
            q.keywords.forEach(kw => {
                keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
            });
        }
    });
    const sortedKeywords = Object.entries(keywordCounts)
        .sort(([,a],[,b]) => b-a)
        .slice(0, 10);
    
    window.dashboardCharts.createBarChart('topKeywordsChart',
        sortedKeywords.map(entry => entry[0]),
        [{ label: 'مرات الاستخدام', data: sortedKeywords.map(entry => entry[1]), backgroundColor: '#4BC0C0' }], // Teal color
        'أكثر الكلمات المفتاحية استخدامًا',
        { indexAxis: 'y' } // Horizontal bar chart
    );
}

function populateCommonQuestionsTable() {
    const tableBody = document.getElementById('commonQuestionsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const questions = window.dataStorage.getQuestions();
    const questionStats = window.dataStorage.getQuestionStats();

    const commonQuestions = Object.entries(questionStats)
        .map(([id, stat]) => {
            const question = questions.find(q => q.id === id);
            return {
                text: question ? question.question_original : 'سؤال محذوف',
                count: stat.askedCount
            };
        })
        .filter(q => q.count > 0) // Consider any asked question
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 most asked

    if (commonQuestions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center p-3 text-gray-500 dark:text-gray-400">لا توجد أسئلة متداولة بعد.</td></tr>`;
        return;
    }

    commonQuestions.forEach(q => {
        const row = tableBody.insertRow();
        row.className = "hover:bg-gray-50 dark:hover:bg-gray-600";
        row.innerHTML = `
            <td class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 truncate" title="${q.text}">${q.text.substring(0,70)}...</td>
            <td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-300 text-center">${q.count}</td>
        `;
    });
}

function setupExportButtons() {
    const exportCsvBtn = document.getElementById('exportStatsCSV');
    const exportJsonBtn = document.getElementById('exportStatsJSON');
    // PDF export is complex client-side, usually needs a library like jsPDF + autoTable
    // For now, we might skip PDF or implement a very basic text version.
    // const exportPdfBtn = document.getElementById('exportStatsPDF'); 

    if (exportCsvBtn) {
        exportCsvBtn.removeEventListener('click', exportStatsAsCSV);
        exportCsvBtn.addEventListener('click', exportStatsAsCSV);
    }
    if (exportJsonBtn) {
        exportJsonBtn.removeEventListener('click', exportStatsAsJSON);
        exportJsonBtn.addEventListener('click', exportStatsAsJSON);
    }
}

function getStatsDataForExport() {
    const questions = window.dataStorage.getQuestions();
    const questionStats = window.dataStorage.getQuestionStats();
    const subjects = window.dataStorage.getSubjects();
    const grades = window.dataStorage.getGrades();

    return questions.map(q => {
        const stats = questionStats[q.id] || { askedCount: 0, dates: [] };
        const subjectName = subjects.find(s => s.code === q.subject_code)?.name || q.subject_name_from_json || 'N/A';
        const gradeName = grades.find(g => g.code === q.grade_code)?.name || q.grade_name_from_json || 'N/A';
        return {
            id: q.id,
            question: q.question_original,
            subject: subjectName,
            grade: gradeName,
            page: q.page_number || 'N/A',
            unit: q.unit_name || 'N/A',
            asked_count: stats.askedCount,
            keywords: (q.keywords || []).join('; '),
            last_asked: stats.dates.length > 0 ? new Date(stats.dates[stats.dates.length - 1]).toLocaleString('ar-EG') : 'N/A'
        };
    });
}

function exportStatsAsCSV() {
    const dataToExport = getStatsDataForExport();
    if (dataToExport.length === 0) {
        window.uiCommon.showCustomAlert('لا توجد بيانات لتصديرها.', 'info');
        return;
    }
    const headers = Object.keys(dataToExport[0]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    dataToExport.forEach(row => {
        const values = headers.map(header => {
            let cellValue = String(row[header] || '').replace(/"/g, '""'); // Escape double quotes
            if (cellValue.includes(',')) cellValue = `"${cellValue}"`; // Enclose if contains comma
            return cellValue;
        });
        csvContent += values.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_helper_stats.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.uiCommon.showCustomAlert('تم بدء تصدير CSV.', 'success');
}

function exportStatsAsJSON() {
    const dataToExport = getStatsDataForExport();
    if (dataToExport.length === 0) {
        window.uiCommon.showCustomAlert('لا توجد بيانات لتصديرها.', 'info');
        return;
    }
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_helper_stats.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    window.uiCommon.showCustomAlert('تم بدء تصدير JSON.', 'success');
}

function generateFullReportPreview() {
    const reportElement = document.getElementById('statsFullReportPreview');
    if (!reportElement) return;

    const data = getStatsDataForExport();
    if (data.length === 0) {
        reportElement.textContent = "لا توجد بيانات كافية لإنشاء تقرير.";
        return;
    }
    
    let reportText = `تقرير إحصائيات مساعد الطالب - ${new Date().toLocaleDateString('ar-EG')}\n`;
    reportText += "==================================================\n\n";
    reportText += `إجمالي الأسئلة: ${data.length}\n`;
    
    const totalAsked = data.reduce((sum, q) => sum + q.asked_count, 0);
    reportText += `إجمالي مرات طرح الأسئلة: ${totalAsked}\n`;

    const subjectCounts = {};
    data.forEach(q => {
        subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    });
    reportText += "\nتوزيع الأسئلة حسب المادة:\n";
    for (const [subject, count] of Object.entries(subjectCounts)) {
        reportText += `- ${subject}: ${count} سؤال (${((count/data.length)*100).toFixed(1)}%)\n`;
    }

    reportText += "\nأكثر 5 أسئلة تم طرحها:\n";
    data.sort((a,b) => b.asked_count - a.asked_count)
        .slice(0, 5)
        .forEach((q, index) => {
            reportText += `${index + 1}. "${q.question.substring(0,30)}..." (طرحت ${q.asked_count} مرة)\n`;
        });
    
    reportElement.textContent = reportText;
}

// Load statistics when the tab is shown (called by dashboard_app.js)