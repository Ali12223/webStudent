// js/dashboard_content.js

window.dashboardContent = {
    loadContentManagement,
    // Expose other functions if needed by other modules, though unlikely for this one
};

let currentContentItemType = 'terms'; // Default sub-tab

function loadContentManagement() {
    // Setup sub-tab navigation
    const contentTabButtons = document.querySelectorAll('.content-tab-button');
    contentTabButtons.forEach(button => {
        button.removeEventListener('click', handleContentSubTabClick); // Remove old listener
        button.addEventListener('click', handleContentSubTabClick);
    });

    // Load data for the initially active or remembered sub-tab
    // For now, let's default to 'terms' each time this main tab is loaded.
    // Or, we could use a variable to remember the last active sub-tab.
    showContentSubTab(currentContentItemType); // Show the current or default sub-tab

    // Setup "Add Item" buttons for each sub-category
    setupAddContentItemButtons();

    // Setup modal close and form submission
    const closeContentItemModalBtn = document.getElementById('closeContentItemModalBtn');
    if (closeContentItemModalBtn) {
        closeContentItemModalBtn.removeEventListener('click', closeContentItemModal);
        closeContentItemModalBtn.addEventListener('click', closeContentItemModal);
    }
    const cancelContentItemBtn = document.getElementById('cancelContentItemBtn');
     if (cancelContentItemBtn) {
        cancelContentItemBtn.removeEventListener('click', closeContentItemModal);
        cancelContentItemBtn.addEventListener('click', closeContentItemModal);
    }

    const contentItemForm = document.getElementById('contentItemForm');
    if (contentItemForm) {
        contentItemForm.removeEventListener('submit', handleSaveContentItemForm);
        contentItemForm.addEventListener('submit', handleSaveContentItemForm);
    }
}

function handleContentSubTabClick(event) {
    const subTabId = event.target.dataset.contentTab;
    if (subTabId) {
        currentContentItemType = subTabId; // Remember the active sub-tab
        showContentSubTab(subTabId);
    }
}

function showContentSubTab(subTabId) {
    // Hide all sub-tab contents
    document.querySelectorAll('.content-sub-tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show selected sub-tab content
    const activeContent = document.getElementById(subTabId + 'Content');
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }

    // Update active sub-tab button style
    document.querySelectorAll('.content-tab-button').forEach(btn => {
        btn.classList.remove('border-primary', 'text-primary');
        btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        if (document.documentElement.classList.contains('dark')) {
            btn.classList.add('dark:text-gray-400', 'dark:hover:text-gray-200', 'dark:hover:border-gray-500');
            btn.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        }

    });
    const activeButton = document.querySelector(`.content-tab-button[data-content-tab="${subTabId}"]`);
    if (activeButton) {
        activeButton.classList.add('border-primary', 'text-primary');
        activeButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        if (document.documentElement.classList.contains('dark')) {
            activeButton.classList.remove('dark:text-gray-400', 'dark:hover:text-gray-200', 'dark:hover:border-gray-500');
            activeButton.classList.add('dark:text-blue-400'); // Assuming primary is blue-ish
        }
    }

    // Populate the table for the active sub-tab
    populateContentTable(subTabId);
}

function populateContentTable(type) {
    let items = [];
    let tableBodyId = '';
    let columns = ['الاسم', 'الكود', 'الحالة', 'الإجراءات']; // Default columns

    switch (type) {
        case 'terms':
            items = window.dataStorage.getTerms();
            tableBodyId = 'termsTableBody';
            break;
        case 'grades':
            items = window.dataStorage.getGrades();
            tableBodyId = 'gradesTableBody';
            break;
        case 'subjects':
            items = window.dataStorage.getSubjects();
            tableBodyId = 'subjectsTableBody';
            break;
        case 'units':
            items = window.dataStorage.getUnits();
            tableBodyId = 'unitsTableBody';
            columns = ['الاسم', 'المادة', 'الكود', 'الحالة', 'الإجراءات']; // Units have a 'Subject' column
            break;
        default:
            return;
    }

    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;
    tableBody.innerHTML = ''; // Clear existing content

    if (items.length === 0) {
        const colspan = columns.length;
        tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center p-4 text-gray-500 dark:text-gray-400">لا توجد عناصر لعرضها.</td></tr>`;
        return;
    }
    
    const allSubjects = window.dataStorage.getSubjects(); // For unit's subject name

    items.forEach(item => {
        const row = tableBody.insertRow();
        row.className = "hover:bg-gray-50 dark:hover:bg-gray-600";
        let cells = `
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${item.name}</td>
        `;
        if (type === 'units') {
            const subject = allSubjects.find(s => s.id === item.subjectId);
            cells += `<td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${subject ? subject.name : 'غير معروف'}</td>`;
        }
        cells += `
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.code || '-'}</td>
            <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.active ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}">
                    ${item.active ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <button data-id="${item.id}" data-type="${type}" class="edit-content-item-btn text-primary dark:text-blue-400 hover:underline mr-2 ml-2">تعديل</button>
                <button data-id="${item.id}" data-type="${type}" class="delete-content-item-btn text-red-600 dark:text-red-400 hover:underline">حذف</button>
            </td>
        `;
        row.innerHTML = cells;
    });

    // Re-attach event listeners for edit/delete buttons in the populated table
    tableBody.removeEventListener('click', handleContentTableActions);
    tableBody.addEventListener('click', handleContentTableActions);
}

function handleContentTableActions(event) {
    const target = event.target;
    if (target.classList.contains('edit-content-item-btn')) {
        const itemId = target.dataset.id;
        const itemType = target.dataset.type;
        openEditContentItemModal(itemId, itemType);
    } else if (target.classList.contains('delete-content-item-btn')) {
        const itemId = target.dataset.id;
        const itemType = target.dataset.type;
        deleteContentItemHandler(itemId, itemType);
    }
}

function setupAddContentItemButtons() {
    document.getElementById('addTermBtn')?.removeEventListener('click', () => openAddContentItemModal('terms'));
    document.getElementById('addTermBtn')?.addEventListener('click', () => openAddContentItemModal('terms'));

    document.getElementById('addGradeBtn')?.removeEventListener('click', () => openAddContentItemModal('grades'));
    document.getElementById('addGradeBtn')?.addEventListener('click', () => openAddContentItemModal('grades'));
    
    document.getElementById('addSubjectBtn')?.removeEventListener('click', () => openAddContentItemModal('subjects'));
    document.getElementById('addSubjectBtn')?.addEventListener('click', () => openAddContentItemModal('subjects'));

    document.getElementById('addUnitBtn')?.removeEventListener('click', () => openAddContentItemModal('units'));
    document.getElementById('addUnitBtn')?.addEventListener('click', () => openAddContentItemModal('units'));
}

function getModalTitleForContentType(type, isEditing = false) {
    const action = isEditing ? 'تعديل' : 'إضافة';
    switch (type) {
        case 'terms': return `${action} فصل دراسي`;
        case 'grades': return `${action} صف دراسي`;
        case 'subjects': return `${action} مادة دراسية`;
        case 'units': return `${action} وحدة دراسية`;
        default: return `${action} عنصر`;
    }
}

function openAddContentItemModal(type) {
    const form = document.getElementById('contentItemForm');
    if(form) form.reset();
    
    document.getElementById('contentItemId').value = ''; // Clear ID for new item
    document.getElementById('contentItemType').value = type;
    document.getElementById('contentItemModalTitle').textContent = getModalTitleForContentType(type, false);
    
    const subjectSelectDiv = document.getElementById('contentItemSubjectSelectDiv');
    const subjectSelect = document.getElementById('contentItemSubjectId');
    
    if (type === 'units') {
        subjectSelectDiv.classList.remove('hidden');
        subjectSelect.innerHTML = '<option value="">اختر المادة الأصل</option>';
        const allSubjects = window.dataStorage.getSubjects().filter(s => s.active);
        allSubjects.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.name;
            subjectSelect.appendChild(option);
        });
        subjectSelect.required = true;
    } else {
        subjectSelectDiv.classList.add('hidden');
        subjectSelect.required = false;
    }

    document.getElementById('contentItemActive').checked = true; // Default to active
    openModal('contentItemModal');
}

function openEditContentItemModal(itemId, itemType) {
    let item;
    switch (itemType) {
        case 'terms': item = window.dataStorage.getTerms().find(i => i.id === itemId); break;
        case 'grades': item = window.dataStorage.getGrades().find(i => i.id === itemId); break;
        case 'subjects': item = window.dataStorage.getSubjects().find(i => i.id === itemId); break;
        case 'units': item = window.dataStorage.getUnits().find(i => i.id === itemId); break;
        default: window.uiCommon.showCustomAlert('نوع عنصر غير معروف.', 'error'); return;
    }

    if (!item) {
        window.uiCommon.showCustomAlert('العنصر غير موجود.', 'error');
        return;
    }
    const form = document.getElementById('contentItemForm');
    if(form) form.reset();

    document.getElementById('contentItemId').value = item.id;
    document.getElementById('contentItemType').value = itemType;
    document.getElementById('contentItemModalTitle').textContent = getModalTitleForContentType(itemType, true);
    document.getElementById('contentItemName').value = item.name;
    document.getElementById('contentItemCode').value = item.code || '';
    document.getElementById('contentItemActive').checked = item.active;

    const subjectSelectDiv = document.getElementById('contentItemSubjectSelectDiv');
    const subjectSelect = document.getElementById('contentItemSubjectId');
    if (itemType === 'units') {
        subjectSelectDiv.classList.remove('hidden');
        subjectSelect.innerHTML = '<option value="">اختر المادة الأصل</option>';
        const allSubjects = window.dataStorage.getSubjects().filter(s => s.active);
        allSubjects.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.name;
            if (item.subjectId === sub.id) option.selected = true;
            subjectSelect.appendChild(option);
        });
        subjectSelect.required = true;
    } else {
        subjectSelectDiv.classList.add('hidden');
        subjectSelect.required = false;
    }
    
    openModal('contentItemModal');
}


function closeContentItemModal() {
    closeModal('contentItemModal');
}

function handleSaveContentItemForm(event) {
    event.preventDefault();
    const id = document.getElementById('contentItemId').value;
    const type = document.getElementById('contentItemType').value;
    const name = document.getElementById('contentItemName').value.trim();
    const code = document.getElementById('contentItemCode').value.trim();
    const active = document.getElementById('contentItemActive').checked;
    const subjectId = (type === 'units') ? document.getElementById('contentItemSubjectId').value : null;

    if (!name || !code) { // Code is generally required for these items
        window.uiCommon.showCustomAlert('يرجى ملء حقلي الاسم والكود.', 'error');
        return;
    }
    if (type === 'units' && !subjectId) {
        window.uiCommon.showCustomAlert('يرجى اختيار المادة الأصل للوحدة.', 'error');
        return;
    }


    let items, storageKey;
    switch (type) {
        case 'terms': items = window.dataStorage.getTerms(); storageKey = 'setTerms'; break;
        case 'grades': items = window.dataStorage.getGrades(); storageKey = 'setGrades'; break;
        case 'subjects': items = window.dataStorage.getSubjects(); storageKey = 'setSubjects'; break;
        case 'units': items = window.dataStorage.getUnits(); storageKey = 'setUnits'; break;
        default: window.uiCommon.showCustomAlert('نوع عنصر غير صالح للحفظ.', 'error'); return;
    }

    // Check for duplicate code (for new items or if code is changed for existing)
    const isNewItem = !id;
    const existingItemByCode = items.find(item => item.code.toLowerCase() === code.toLowerCase() && item.id !== id);
    if (existingItemByCode) {
        window.uiCommon.showCustomAlert('هذا الكود مستخدم بالفعل لعنصر آخر من نفس النوع.', 'error');
        return;
    }
    
    if (isNewItem) { // Adding new item
        const newItem = { id: window.dataStorage.generateId(), name, code, active };
        if (type === 'units') newItem.subjectId = subjectId;
        items.push(newItem);
        window.uiCommon.showCustomAlert('تمت إضافة العنصر بنجاح!', 'success');
    } else { // Editing existing item
        const itemIndex = items.findIndex(i => i.id === id);
        if (itemIndex === -1) {
            window.uiCommon.showCustomAlert('خطأ: العنصر غير موجود للتعديل.', 'error');
            return;
        }
        items[itemIndex] = { ...items[itemIndex], name, code, active };
        if (type === 'units') items[itemIndex].subjectId = subjectId;
        window.uiCommon.showCustomAlert('تم تعديل العنصر بنجاح!', 'success');
    }

    window.dataStorage[storageKey](items); // Save updated array to localStorage
    populateContentTable(type); // Refresh the table for the current sub-tab
    closeContentItemModal();
}

function deleteContentItemHandler(itemId, itemType) {
    let items, storageKey, itemName;
    switch (itemType) {
        case 'terms': items = window.dataStorage.getTerms(); storageKey = 'setTerms'; itemName = "الفصل الدراسي"; break;
        case 'grades': items = window.dataStorage.getGrades(); storageKey = 'setGrades'; itemName = "الصف الدراسي"; break;
        case 'subjects': items = window.dataStorage.getSubjects(); storageKey = 'setSubjects'; itemName = "المادة الدراسية"; break;
        case 'units': items = window.dataStorage.getUnits(); storageKey = 'setUnits'; itemName = "الوحدة الدراسية"; break;
        default: window.uiCommon.showCustomAlert('نوع عنصر غير صالح للحذف.', 'error'); return;
    }

    const itemToDelete = items.find(i => i.id === itemId);
    if (!itemToDelete) {
         window.uiCommon.showCustomAlert('العنصر المراد حذفه غير موجود.', 'error');
         return;
    }

    // Custom confirmation modal would be better
    const confirmationModal = document.createElement('div');
    confirmationModal.id = `deleteConfirmModal_${itemType}_${itemId}`;
    confirmationModal.className = 'fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out';
    confirmationModal.innerHTML = `
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">تأكيد حذف ${itemName}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">هل أنت متأكد أنك تريد حذف "${itemToDelete.name}"؟</p>
            <p class="text-xs text-red-500 dark:text-red-400 mb-6">ملاحظة: حذف هذا العنصر قد يؤثر على الأسئلة المرتبطة به.</p>
            <div class="flex justify-end space-x-3 space-x-reverse">
                <button class="cancel-delete-content bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition">إلغاء</button>
                <button class="confirm-delete-content bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition">تأكيد الحذف</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmationModal);

    confirmationModal.querySelector('.cancel-delete-content').addEventListener('click', () => {
        confirmationModal.remove();
    });

    confirmationModal.querySelector('.confirm-delete-content').addEventListener('click', () => {
        const updatedItems = items.filter(i => i.id !== itemId);
        window.dataStorage[storageKey](updatedItems);
        window.uiCommon.showCustomAlert(`تم حذف ${itemName} بنجاح.`, 'success');
        populateContentTable(itemType); // Refresh the table for the current sub-tab
        confirmationModal.remove();
    });
}


// Re-use general modal open/close functions from dashboard_users.js if they are made global
// Or, define them locally if they have slight variations for this context.
// For simplicity here, assuming openModal/closeModal are available (e.g., from dashboard_users.js or made global)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const modalContent = modal.querySelector('div > div'); // The actual content div
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