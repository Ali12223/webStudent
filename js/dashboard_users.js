// js/dashboard_users.js

window.dashboardUsers = {
    loadUsersTable,
};

// --- User Management Tab ---
function loadUsersTable() {
    const users = window.dataStorage.getUsers();
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = ''; // Clear existing rows

    if (users.length === 0) {
        usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-500 dark:text-gray-400">لا يوجد مستخدمون لعرضهم.</td></tr>`;
        return;
    }

    users.forEach(user => {
        const row = usersTableBody.insertRow();
        row.className = "hover:bg-gray-50 dark:hover:bg-gray-600";
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${user.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${user.username}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${getRoleName(user.role)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${user.lastLogin ? window.uiCommon.formatDate(user.lastLogin) : 'لم يسجل الدخول'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button data-user-id="${user.id}" class="edit-user-btn text-primary dark:text-blue-400 hover:underline mr-2 ml-2">تعديل</button>
                ${user.id !== '1' ? `<button data-user-id="${user.id}" class="delete-user-btn text-red-600 dark:text-red-400 hover:underline">حذف</button>` : '<span class="text-xs text-gray-400 dark:text-gray-500">(رئيسي)</span>'}
            </td>
        `;
    });

    // Re-initialize event listeners for buttons outside the table, they might have been cleared
    // if the entire tab content was re-rendered, though ideally it's not.
    // However, it's safer to ensure they are always active when this tab is loaded.
    const addNewUserButton = document.getElementById('addNewUserBtn');
    if (addNewUserButton) {
        addNewUserButton.removeEventListener('click', openAddUserModal); // Prevent multiple listeners
        addNewUserButton.addEventListener('click', openAddUserModal);
    }

    // Modal Close Buttons (ensure they are set up if not already)
    const closeAddUserModalBtn = document.getElementById('closeAddUserModalBtn');
    if(closeAddUserModalBtn) {
        closeAddUserModalBtn.removeEventListener('click', closeAddUserModal);
        closeAddUserModalBtn.addEventListener('click', closeAddUserModal);
    }
    const cancelAddUserBtn = document.getElementById('cancelAddUserBtn');
    if(cancelAddUserBtn) {
        cancelAddUserBtn.removeEventListener('click', closeAddUserModal);
        cancelAddUserBtn.addEventListener('click', closeAddUserModal);
    }
    
    const closeEditUserModalBtn = document.getElementById('closeEditUserModalBtn');
    if(closeEditUserModalBtn) {
        closeEditUserModalBtn.removeEventListener('click', closeEditUserModal);
        closeEditUserModalBtn.addEventListener('click', closeEditUserModal);
    }
    const cancelEditUserBtn = document.getElementById('cancelEditUserBtn');
    if(cancelEditUserBtn) {
        cancelEditUserBtn.removeEventListener('click', closeEditUserModal);
        cancelEditUserBtn.addEventListener('click', closeEditUserModal);
    }
    
    // Form Submissions (ensure they are set up)
    const addUserForm = document.getElementById('addUserForm');
    if(addUserForm) {
        addUserForm.removeEventListener('submit', handleAddUserFormSubmit);
        addUserForm.addEventListener('submit', handleAddUserFormSubmit);
    }

    const editUserForm = document.getElementById('editUserForm');
    if(editUserForm) {
        editUserForm.removeEventListener('submit', handleEditUserFormSubmit);
        editUserForm.addEventListener('submit', handleEditUserFormSubmit);
    }
    
    // Event delegation for table actions - This should be set up once
    // and let dashboard_app.js handle calling loadUsersTable.
    // If setupUserActionButtons is called every time, this could be problematic.
    // Let's assume it's safe for now as loadUsersTable is called on tab switch.
    const usersTableBodyForActions = document.getElementById('usersTableBody');
    usersTableBodyForActions.removeEventListener('click', handleTableActions); 
    usersTableBodyForActions.addEventListener('click', handleTableActions);
}

function getRoleName(roleCode) {
    const roles = {
        admin: 'مدير',
        editor: 'محرر',
        viewer: 'عرض فقط'
    };
    return roles[roleCode] || roleCode;
}

function handleTableActions(event) {
    if (event.target.classList.contains('edit-user-btn')) {
        const userId = event.target.dataset.userId;
        openEditUserModal(userId);
    } else if (event.target.classList.contains('delete-user-btn')) {
        const userId = event.target.dataset.userId;
        deleteUserHandler(userId);
    }
}

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


function openAddUserModal() {
    const form = document.getElementById('addUserForm');
    if (form) form.reset();
    openModal('addUserModal');
}

function closeAddUserModal() {
    closeModal('addUserModal');
}

function handleAddUserFormSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('newUserName').value.trim();
    const username = document.getElementById('newUserUsername').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!name || !username || !password) {
        window.uiCommon.showCustomAlert('يرجى ملء جميع الحقول الإلزامية.', 'error');
        return;
    }

    let users = window.dataStorage.getUsers();
    if (users.some(u => u.username === username)) {
        window.uiCommon.showCustomAlert('اسم المستخدم هذا موجود بالفعل.', 'error');
        return;
    }

    const newUser = {
        id: window.dataStorage.generateId(),
        name,
        username,
        password, 
        role,
        lastLogin: null
    };
    users.push(newUser);
    window.dataStorage.setUsers(users);
    window.uiCommon.showCustomAlert('تم إضافة المستخدم بنجاح!', 'success');
    loadUsersTable(); // Refresh table
    closeAddUserModal();
}

function openEditUserModal(userId) {
    const users = window.dataStorage.getUsers();
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) {
        window.uiCommon.showCustomAlert('المستخدم غير موجود.', 'error');
        return;
    }
    const form = document.getElementById('editUserForm');
    if (form) form.reset(); // Reset form before populating

    document.getElementById('editUserId').value = userToEdit.id;
    document.getElementById('editUserName').value = userToEdit.name;
    document.getElementById('editUserUsername').value = userToEdit.username;
    document.getElementById('editUserPassword').value = ''; 
    document.getElementById('editUserRole').value = userToEdit.role;
    
    openModal('editUserModal');
}

function closeEditUserModal() {
    closeModal('editUserModal');
}

function handleEditUserFormSubmit(event) {
    event.preventDefault();
    const userId = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value.trim();
    const username = document.getElementById('editUserUsername').value.trim();
    const password = document.getElementById('editUserPassword').value; 
    const role = document.getElementById('editUserRole').value;

    if (!name || !username) {
        window.uiCommon.showCustomAlert('الرجاء ملء حقلي الاسم واسم المستخدم.', 'error');
        return;
    }

    let users = window.dataStorage.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        window.uiCommon.showCustomAlert('المستخدم غير موجود.', 'error');
        return;
    }

    if (users[userIndex].username !== username && users.some(u => u.id !== userId && u.username === username)) {
        window.uiCommon.showCustomAlert('اسم المستخدم الجديد هذا موجود بالفعل لمستخدم آخر.', 'error');
        return;
    }

    users[userIndex].name = name;
    users[userIndex].username = username;
    users[userIndex].role = role;
    if (password) { 
        users[userIndex].password = password;
    }

    window.dataStorage.setUsers(users);
    window.uiCommon.showCustomAlert('تم تحديث بيانات المستخدم بنجاح!', 'success');
    loadUsersTable(); // Refresh table
    closeEditUserModal();

    const loggedInUser = JSON.parse(localStorage.getItem('user')); // Assuming user object is stored on login
    if (loggedInUser && loggedInUser.id === userId) {
        const currentAdminNameDisplay = document.getElementById('currentAdminName');
        if (currentAdminNameDisplay) {
            currentAdminNameDisplay.textContent = name;
        }
        localStorage.setItem('currentAdminName', name); 
        // Update full user object if stored
        loggedInUser.name = name;
        localStorage.setItem('user', JSON.stringify(loggedInUser));
    }
}

function deleteUserHandler(userId) {
    if (userId === '1') { 
        window.uiCommon.showCustomAlert('لا يمكن حذف المشرف الرئيسي!', 'warning');
        return;
    }

    // Custom confirmation modal would be better
    const confirmationModal = document.createElement('div');
    confirmationModal.id = 'deleteConfirmModal';
    confirmationModal.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out';
    confirmationModal.innerHTML = `
        <div class="bg-white dark:bg-gray-700 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">تأكيد الحذف</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div class="flex justify-end space-x-3 space-x-reverse">
                <button id="cancelDeleteUserBtn" class="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition">إلغاء</button>
                <button id="confirmDeleteUserActualBtn" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition">تأكيد الحذف</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmationModal);

    document.getElementById('cancelDeleteUserBtn').addEventListener('click', () => {
        confirmationModal.remove();
    });

    document.getElementById('confirmDeleteUserActualBtn').addEventListener('click', () => {
        let users = window.dataStorage.getUsers();
        users = users.filter(u => u.id !== userId);
        window.dataStorage.setUsers(users);
        window.uiCommon.showCustomAlert('تم حذف المستخدم بنجاح.', 'success');
        loadUsersTable(); // Refresh table
        confirmationModal.remove();
    });
}

// Ensure this script runs after the DOM is fully loaded
// Handled by dashboard_app.js calling loadUsersTable on tab switch.