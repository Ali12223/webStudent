// js/dashboard_app.js

document.addEventListener('DOMContentLoaded', function() {
    if (!window.dataStorage.isLoggedIn()) {
        window.uiCommon.showCustomAlert('الرجاء تسجيل الدخول للوصول إلى لوحة التحكم.', 'error', 4000);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    initializeDashboardHeader();
    initializeSidebar();
    handleTabNavigation();

    const initialTab = window.location.hash ? window.location.hash.substring(1) : 'generalSettings';
    showAdminTab(initialTab);
});

function initializeDashboardHeader() {
    const adminNameElement = document.getElementById('currentAdminName');
    if (adminNameElement) {
        adminNameElement.textContent = window.dataStorage.getCurrentAdminName();
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentAdminName');
            localStorage.removeItem('currentAdminRole');
            window.uiCommon.showCustomAlert('تم تسجيل الخروج بنجاح.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }

    const darkModeToggleBtn = document.getElementById('toggleDarkModeBtnDashboard');
    const darkModeIcon = document.getElementById('darkModeIconDashboard'); // Updated ID
    const lightModeIcon = document.getElementById('lightModeIconDashboard'); // Updated ID

    function updateDashboardDarkModeIcons() {
        const isDark = document.documentElement.classList.contains('dark');
        if (darkModeIcon) darkModeIcon.classList.toggle('hidden', isDark);
        if (lightModeIcon) lightModeIcon.classList.toggle('hidden', !isDark);
    }
    
    if (darkModeToggleBtn) {
        darkModeToggleBtn.addEventListener('click', () => {
            const settings = window.dataStorage.getSettings();
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                settings.themeMode = 'light';
            } else {
                document.documentElement.classList.add('dark');
                settings.themeMode = 'dark';
            }
            window.dataStorage.setSettings(settings); // This will trigger 'settingsUpdated' event
            updateDashboardDarkModeIcons();
        });
    }
    updateDashboardDarkModeIcons(); // Initial state

    const settings = window.dataStorage.getSettings();
    const dashboardLogoContainer = document.querySelector('.dashboard-logo-container');
    if (dashboardLogoContainer) {
        if (settings.logoUrl) {
            dashboardLogoContainer.innerHTML = `<img src="${settings.logoUrl}" alt="Logo" class="w-full h-full object-contain rounded-full">`;
        } else {
            dashboardLogoContainer.innerHTML = '👑';
        }
    }
    const siteSubtitleSidebar = document.querySelector('aside .dashboard-subtitle');
    if(siteSubtitleSidebar && settings.siteName) siteSubtitleSidebar.textContent = settings.siteName.split('|')[1]?.trim() || "مساعد الطالب";

}


function initializeSidebar() {
    const sidebar = document.querySelector('aside');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const mainContentArea = document.querySelector('.sm\\:mr-64'); // For RTL

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Toggle for RTL
            if (document.documentElement.dir === 'rtl') {
                sidebar.classList.toggle('rtl:-translate-x-full');
                sidebar.classList.toggle('rtl:translate-x-0');
                 if (mainContentArea) {
                    mainContentArea.classList.toggle('sm:mr-64'); // If sidebar is hidden, main content takes full width on sm+
                    mainContentArea.classList.toggle('mr-0');
                }
            } else { // LTR
                sidebar.classList.toggle('ltr:-translate-x-full');
                sidebar.classList.toggle('ltr:translate-x-0');
                 if (mainContentArea) {
                    mainContentArea.classList.toggle('sm:ml-64');
                    mainContentArea.classList.toggle('ml-0');
                }
            }
        });
    }

    document.addEventListener('click', (event) => {
        if (sidebar && sidebarToggleBtn && !sidebar.contains(event.target) && !sidebarToggleBtn.contains(event.target)) {
            // Check if sidebar is currently visible on small screens
            const isVisibleRTL = sidebar.classList.contains('rtl:translate-x-0') && !sidebar.classList.contains('rtl:-translate-x-full');
            const isVisibleLTR = sidebar.classList.contains('ltr:translate-x-0') && !sidebar.classList.contains('ltr:-translate-x-full');

            if ((isVisibleRTL || isVisibleLTR) && window.innerWidth < 640) { // sm breakpoint
                if (document.documentElement.dir === 'rtl') {
                    sidebar.classList.add('rtl:-translate-x-full');
                    sidebar.classList.remove('rtl:translate-x-0');
                } else {
                    sidebar.classList.add('ltr:-translate-x-full');
                    sidebar.classList.remove('ltr:translate-x-0');
                }
            }
        }
    });
}

function handleTabNavigation() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(tabLink => {
        tabLink.addEventListener('click', function(event) {
            event.preventDefault();
            const tabId = this.getAttribute('data-tab');
            showAdminTab(tabId);
            window.location.hash = tabId;

            const sidebar = document.querySelector('aside');
            if (sidebar && window.innerWidth < 640) {
                 if (document.documentElement.dir === 'rtl') {
                    sidebar.classList.add('rtl:-translate-x-full');
                    sidebar.classList.remove('rtl:translate-x-0');
                } else {
                    sidebar.classList.add('ltr:-translate-x-full');
                    sidebar.classList.remove('ltr:translate-x-0');
                }
            }
        });
    });

    window.addEventListener('hashchange', function() {
        const tabId = window.location.hash.substring(1);
        showAdminTab(tabId || 'generalSettings');
    });
}

function showAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeContent = document.getElementById(tabId + 'TabContent');
    if (activeContent) {
        activeContent.classList.remove('hidden');
    } else {
        console.warn(`Tab content for '${tabId}' not found. Defaulting to generalSettings.`);
        document.getElementById('generalSettingsTabContent').classList.remove('hidden');
        tabId = 'generalSettings'; 
    }

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('admin-tab-active');
        tab.style.backgroundColor = ''; // Reset inline styles
        tab.style.color = '';
        tab.querySelectorAll('svg').forEach(svg => svg.style.color = '');

        if (document.documentElement.classList.contains('dark')) {
            tab.classList.add('text-gray-300', 'hover:bg-gray-600');
            tab.classList.remove('text-gray-900', 'hover:bg-gray-100');
        } else {
            tab.classList.add('text-gray-900', 'hover:bg-gray-100');
            tab.classList.remove('text-gray-300', 'hover:bg-gray-600');
        }
    });

    const activeTabLink = document.querySelector(`.admin-tab[data-tab="${tabId}"]`);
    if (activeTabLink) {
        activeTabLink.classList.add('admin-tab-active');
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        activeTabLink.style.backgroundColor = primaryColor;
        activeTabLink.style.color = 'white'; // Assuming primary color has good contrast with white
        activeTabLink.querySelectorAll('svg').forEach(svg => svg.style.color = 'white');

        const adminTabTitle = document.getElementById('adminTabTitle');
        if (adminTabTitle) {
            adminTabTitle.textContent = activeTabLink.textContent.trim();
        }
    } else {
        const fallbackLink = document.querySelector(`.admin-tab[data-tab="generalSettings"]`);
        if (fallbackLink) {
             fallbackLink.classList.add('admin-tab-active');
             const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
             fallbackLink.style.backgroundColor = primaryColor;
             fallbackLink.style.color = 'white';
             fallbackLink.querySelectorAll('svg').forEach(svg => svg.style.color = 'white');
             const adminTabTitle = document.getElementById('adminTabTitle');
             if (adminTabTitle) adminTabTitle.textContent = fallbackLink.textContent.trim();
        }
    }

    // Dynamic content loading calls
    if (tabId === 'generalSettings' && typeof window.dashboardSettings?.loadGeneralSettings === 'function') {
        window.dashboardSettings.loadGeneralSettings();
    } else if (tabId === 'appearanceSettings' && typeof window.dashboardSettings?.loadAppearanceSettings === 'function') {
        window.dashboardSettings.loadAppearanceSettings();
    } else if (tabId === 'userManagement' && typeof window.dashboardUsers?.loadUsersTable === 'function') {
        window.dashboardUsers.loadUsersTable();
    } else if (tabId === 'contentManagement' && typeof window.dashboardContent?.loadContentManagement === 'function') {
        window.dashboardContent.loadContentManagement();
    } else if (tabId === 'questionManagement' && typeof window.dashboardQuestions?.loadQuestionManagement === 'function') {
        window.dashboardQuestions.loadQuestionManagement();
    }  else if (tabId === 'questionSearchSettings' && typeof window.dashboardQuestions?.loadSearchSettings === 'function') {
        window.dashboardQuestions.loadSearchSettings();
    } else if (tabId === 'questionStatistics' && typeof window.dashboardStats?.loadStatistics === 'function') {
        window.dashboardStats.loadStatistics();
    } else if (tabId === 'advancedFeatures' && typeof window.dashboardAdvanced?.loadAdvancedFeatures === 'function') {
        window.dashboardAdvanced.loadAdvancedFeatures();
    }
}

window.dashboardApp = {
    showAdminTab,
    initializeDashboardHeader // Expose if needed for settings updates
};