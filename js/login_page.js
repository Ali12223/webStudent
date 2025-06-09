// js/login_page.js

document.addEventListener('DOMContentLoaded', function() {
    // Theme and general settings are applied by ui_common.js

    // If already logged in, redirect to dashboard
    if (window.dataStorage.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return; // Stop further execution for this page
    }

    const loginForm = document.getElementById('loginForm');
    const loginErrorElement = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            loginErrorElement.classList.add('hidden'); // Hide previous errors
            loginErrorElement.textContent = '';

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value; // No trim for password

            if (!username || !password) {
                loginErrorElement.textContent = 'الرجاء إدخال اسم المستخدم وكلمة المرور.';
                loginErrorElement.classList.remove('hidden');
                // window.uiCommon.showCustomAlert('الرجاء إدخال اسم المستخدم وكلمة المرور.', 'error');
                return;
            }

            const users = window.dataStorage.getUsers();
            const user = users.find(u => u.username === username && u.password === password); // Plain text password check

            if (user) {
                // Successful login
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentAdminName', user.name);
                localStorage.setItem('currentAdminRole', user.role); // Store role for dashboard permissions

                // Update last login for the user
                user.lastLogin = new Date().toISOString();
                window.dataStorage.setUsers(users); // Save updated users array

                window.uiCommon.showCustomAlert('تم تسجيل الدخول بنجاح!', 'success');
                
                // Redirect to dashboard after a short delay to show the alert
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);

            } else {
                // Failed login
                loginErrorElement.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
                loginErrorElement.classList.remove('hidden');
                // window.uiCommon.showCustomAlert('اسم المستخدم أو كلمة المرور غير صحيحة!', 'error');
                document.getElementById('password').value = ''; // Clear password field
            }
        });
    }

    // Make header title/logo link to home.html
     const headerLink = document.querySelector('nav .flex.items-center > a');
     if (headerLink) {
        // It's already an <a> tag pointing to home.html
     }
});