// js/dashboard_settings.js

window.dashboardSettings = {
    loadGeneralSettings,
    loadAppearanceSettings,
};

function loadGeneralSettings() {
    const settings = window.dataStorage.getSettings();
    document.getElementById('settingsSiteName').value = settings.siteName || '';
    document.getElementById('settingsHomePageTitle').value = settings.homePageTitle || '';
    document.getElementById('settingsWelcomeMessage').value = settings.welcomeMessage || '';
    document.getElementById('settingsFooterText').value = settings.footerText || '';

    const saveBtn = document.getElementById('saveGeneralSettingsBtn');
    saveBtn.removeEventListener('click', saveGeneralSettingsHandler); // Remove old before adding new
    saveBtn.addEventListener('click', saveGeneralSettingsHandler);
}

function saveGeneralSettingsHandler() {
    let settings = window.dataStorage.getSettings();
    settings.siteName = document.getElementById('settingsSiteName').value;
    settings.homePageTitle = document.getElementById('settingsHomePageTitle').value;
    settings.welcomeMessage = document.getElementById('settingsWelcomeMessage').value;
    settings.footerText = document.getElementById('settingsFooterText').value;
    window.dataStorage.setSettings(settings);
    window.uiCommon.showCustomAlert('تم حفظ الإعدادات العامة بنجاح!', 'success');
}

function loadAppearanceSettings() {
    const settings = window.dataStorage.getSettings();
    const logoPreview = document.getElementById('appearanceLogoPreview');
    logoPreview.src = settings.logoUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwOGYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmFkdWF0aW9uIj48cGF0aCBkPSJNMjIgMTJhMTAgMTAgMCAxIDEtMjAgMCAxMCAxMCAwIDAgMSAyMCAwWiIvPjxwYXRoIGQ9Ik0xNSA5LjItMTAgMTkiLz48cGF0aCBkPSJtOSAyIDcgNCIvPjwvc3ZnPg==';
    
    const bgPreview = document.getElementById('appearanceBgPreview');
    bgPreview.src = settings.siteBackgroundImageUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    document.getElementById('appearancePrimaryColor').value = settings.primaryColor || '#2563eb';
    document.getElementById('appearanceNavbarColor').value = settings.navbarColor || '#2563eb';
    document.getElementById('appearanceFontFamily').value = settings.fontFamily || 'Tajawal, sans-serif';
    document.getElementById('appearanceBaseFontSize').value = settings.baseFontSize || 'medium';
    document.getElementById('appearanceStudentViewStyle').value = settings.studentViewStyle || 'simple';
    document.getElementById('appearanceThemeMode').value = settings.themeMode || 'light';

    const logoUploadInput = document.getElementById('appearanceLogoUpload');
    logoUploadInput.removeEventListener('change', handleLogoUpload);
    logoUploadInput.addEventListener('change', handleLogoUpload);
    logoUploadInput.value = ''; // Reset file input

    const removeLogoBtn = document.getElementById('removeAppearanceLogoBtn');
    removeLogoBtn.removeEventListener('click', removeLogoHandler);
    removeLogoBtn.addEventListener('click', removeLogoHandler);

    const bgUploadInput = document.getElementById('appearanceBgUpload');
    bgUploadInput.removeEventListener('change', handleBgUpload);
    bgUploadInput.addEventListener('change', handleBgUpload);
    bgUploadInput.value = ''; // Reset file input

    const removeBgBtn = document.getElementById('removeAppearanceBgBtn');
    removeBgBtn.removeEventListener('click', removeBgHandler);
    removeBgBtn.addEventListener('click', removeBgHandler);

    const saveBtn = document.getElementById('saveAppearanceSettingsBtn');
    saveBtn.removeEventListener('click', saveAppearanceSettingsHandler);
    saveBtn.addEventListener('click', saveAppearanceSettingsHandler);
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    const logoPreview = document.getElementById('appearanceLogoPreview');
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoPreview.src = e.target.result;
        }
        reader.readAsDataURL(file);
    } else if (file) { // if a file is selected but not an image
        window.uiCommon.showCustomAlert('يرجى اختيار ملف صورة صالح للشعار.', 'error');
        event.target.value = null;
         logoPreview.src = window.dataStorage.getSettings().logoUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwOGYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmFkdWF0aW9uIj48cGF0aCBkPSJNMjIgMTJhMTAgMTAgMCAxIDEtMjAgMCAxMCAxMCAwIDAgMSAyMCAwWiIvPjxwYXRoIGQ9Ik0xNSA5LjItMTAgMTkiLz48cGF0aCBkPSJtOSAyIDcgNCIvPjwvc3ZnPg=='; // Revert to saved or default
    }
}

function removeLogoHandler() {
    document.getElementById('appearanceLogoPreview').src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwOGYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmFkdWF0aW9uIj48cGF0aCBkPSJNMjIgMTJhMTAgMTAgMCAxIDEtMjAgMCAxMCAxMCAwIDAgMSAyMCAwWiIvPjxwYXRoIGQ9Ik0xNSA5LjItMTAgMTkiLz48cGF0aCBkPSJtOSAyIDcgNCIvPjwvc3ZnPg=='; // Default SVG
    document.getElementById('appearanceLogoUpload').value = null;
}

function handleBgUpload(event) {
    const file = event.target.files[0];
    const bgPreview = document.getElementById('appearanceBgPreview');
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            bgPreview.src = e.target.result;
        }
        reader.readAsDataURL(file);
    } else if (file) {
        window.uiCommon.showCustomAlert('يرجى اختيار ملف صورة صالح للخلفية.', 'error');
        event.target.value = null;
        bgPreview.src = window.dataStorage.getSettings().siteBackgroundImageUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Revert
    }
}

function removeBgHandler() {
    document.getElementById('appearanceBgPreview').src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent pixel
    document.getElementById('appearanceBgUpload').value = null;
}

function saveAppearanceSettingsHandler() {
    let settings = window.dataStorage.getSettings();
    const logoPreviewSrc = document.getElementById('appearanceLogoPreview').src;
    const defaultLogoSvgBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwOGYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmFkdWF0aW9uIj48cGF0aCBkPSJNMjIgMTJhMTAgMTAgMCAxIDEtMjAgMCAxMCAxMCAwIDAgMSAyMCAwWiIvPjxwYXRoIGQ9Ik0xNSA5LjItMTAgMTkiLz48cGF0aCBkPSJtOSAyIDcgNCIvPjwvc3ZnPg==';
    if (logoPreviewSrc !== defaultLogoSvgBase64 && logoPreviewSrc.startsWith('data:image/')) {
        settings.logoUrl = logoPreviewSrc;
    } else if (logoPreviewSrc === defaultLogoSvgBase64) {
        settings.logoUrl = ''; // User wants to remove/use default emoji
    }

    const bgPreviewSrc = document.getElementById('appearanceBgPreview').src;
    const transparentPixelBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    if (bgPreviewSrc !== transparentPixelBase64 && bgPreviewSrc.startsWith('data:image/')) {
        settings.siteBackgroundImageUrl = bgPreviewSrc;
    } else if (bgPreviewSrc === transparentPixelBase64) {
        settings.siteBackgroundImageUrl = '';
    }

    settings.primaryColor = document.getElementById('appearancePrimaryColor').value;
    settings.navbarColor = document.getElementById('appearanceNavbarColor').value;
    settings.fontFamily = document.getElementById('appearanceFontFamily').value;
    settings.baseFontSize = document.getElementById('appearanceBaseFontSize').value;
    settings.studentViewStyle = document.getElementById('appearanceStudentViewStyle').value;
    settings.themeMode = document.getElementById('appearanceThemeMode').value;

    window.dataStorage.setSettings(settings);
    window.uiCommon.showCustomAlert('تم حفظ إعدادات المظهر بنجاح!', 'success');
    
    // Trigger dashboard header update specifically for logo
    if (typeof window.dashboardApp !== 'undefined' && typeof window.dashboardApp.initializeDashboardHeader === 'function') {
         // No, this re-adds listeners. Instead, make a specific update function or rely on settingsUpdated event.
         // For now, settingsUpdated in ui_common will re-apply global styles.
         // dashboardApp needs a specific logo update for sidebar.
        const dashboardLogoContainer = document.querySelector('.dashboard-logo-container');
        if (dashboardLogoContainer) {
            if (settings.logoUrl) {
                 dashboardLogoContainer.innerHTML = `<img src="${settings.logoUrl}" alt="Logo" class="w-full h-full object-contain rounded-full">`;
            } else {
                dashboardLogoContainer.innerHTML = '👑'; // Fallback
            }
        }
        const siteSubtitleSidebar = document.querySelector('aside .dashboard-subtitle');
        if(siteSubtitleSidebar) siteSubtitleSidebar.textContent = settings.siteName.split('|')[1]?.trim() || "مساعد الطالب";

    }
}