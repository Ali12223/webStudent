// js/home_page.js

document.addEventListener('DOMContentLoaded', function() {
    // Theme and general settings are applied by ui_common.js

    setupHomePageEventListeners();
    applyHomePageSpecificText();
});

function setupHomePageEventListeners() {
     const adminLoginBtn = document.getElementById('adminLoginBtn');
     if (adminLoginBtn) {
         adminLoginBtn.addEventListener('click', function() {
             window.location.href = 'login.html';
         });
     }

     const studentEnterBtn = document.getElementById('studentEnterBtn');
     if (studentEnterBtn) {
         studentEnterBtn.addEventListener('click', function() {
             window.location.href = 'student.html';
         });
     }

     // Make header title/logo link to index.html
     const headerLink = document.querySelector('nav .flex.items-center > a');
     if (headerLink) {
        // It's already an <a> tag pointing to index.html, so no extra JS needed here
        // If it wasn't an <a> tag, you'd add:
        // headerLink.style.cursor = 'pointer';
        // headerLink.addEventListener('click', () => window.location.href = 'home.html');
     }
}

function applyHomePageSpecificText() {
     const settings = window.dataStorage.getSettings();

     const homeTitleElement = document.querySelector('#homePage .home-title');
     if (homeTitleElement) {
          homeTitleElement.textContent = settings.homePageTitle || 'مرحبًا بك في مساعد الطالب';
     }

     const welcomeMessageElement = document.querySelector('#homePage .home-welcome-message');
     if (welcomeMessageElement) {
          welcomeMessageElement.textContent = settings.welcomeMessage;
     }
}