// js/ui_common.js

function applyThemeAndSettings() {
    const settings = window.dataStorage.getSettings();

    // Apply Theme (Dark/Light)
    if (settings.themeMode === 'dark' || (settings.themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Apply Font Family
    document.body.style.fontFamily = settings.fontFamily;

    // Apply Base Font Size
    let fontSizeClass = '';
    switch (settings.baseFontSize) {
        case 'small':
            fontSizeClass = 'text-sm'; // Tailwind class for small
            document.body.style.fontSize = '14px'; // More direct control
            break;
        case 'large':
            fontSizeClass = 'text-lg'; // Tailwind class for large
            document.body.style.fontSize = '18px';
            break;
        case 'medium':
        default:
            fontSizeClass = 'text-base'; // Tailwind class for medium/default
            document.body.style.fontSize = '16px';
            break;
    }
    // Remove existing font size classes and add the new one (less reliable for body)
    // document.body.classList.remove('text-sm', 'text-base', 'text-lg');
    // document.body.classList.add(fontSizeClass);


    // Apply Primary Color
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);

    // Apply Navbar Color
    const navbars = document.querySelectorAll('nav'); // Affect all navs
    navbars.forEach(navbar => {
        if (navbar) {
            navbar.style.backgroundColor = settings.navbarColor;
            // Ensure text on navbar has good contrast with navbarColor
            // This is a bit tricky as navbarColor can be anything.
            // A simple heuristic: if navbarColor is dark, text should be light, and vice-versa.
            // For more robust solution, a color contrast checking library would be needed.
            // Example:
            // const isDark = (parseInt(settings.navbarColor.substr(1,2), 16) * 0.299 + 
            //               parseInt(settings.navbarColor.substr(3,2), 16) * 0.587 + 
            //               parseInt(settings.navbarColor.substr(5,2), 16) * 0.114) < 186;
            // navbar.style.color = isDark ? 'white' : '#1f2937'; // Tailwind gray-800
            // This might conflict with Tailwind's own text color utilities on child elements.
        }
    });


    // Apply Site Background Image
    if (settings.siteBackgroundImageUrl && settings.siteBackgroundImageUrl !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') {
        document.body.style.backgroundImage = `url('${settings.siteBackgroundImageUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
    } else {
        document.body.style.backgroundImage = ''; // Remove if not set or is placeholder
    }


    // Apply Site Name to Title and Nav
    document.title = settings.siteName;
    const siteTitleNavElements = document.querySelectorAll('.site-title-nav'); // Affect all nav title elements
    siteTitleNavElements.forEach(el => {
        if(el.closest('aside')) { // Dashboard sidebar title
            el.textContent = settings.siteName.split('|')[0]?.trim() || "لوحة التحكم";
        } else { // Other pages nav title
            el.textContent = settings.siteName.split('|')[1]?.trim() || settings.siteName;
        }
    });


    // Apply Logo to Nav (if URL is set) - For main nav bars, not dashboard sidebar logo yet
    const navLogoContainers = document.querySelectorAll('nav:not(aside nav) .flex.items-center > a > div:first-child');
    navLogoContainers.forEach(logoContainer => {
        if (logoContainer) {
            if (settings.logoUrl) {
                logoContainer.innerHTML = `<img src="${settings.logoUrl}" alt="Logo" class="w-full h-full object-contain">`;
            } else {
                logoContainer.innerHTML = '🎓'; // Fallback to emoji
            }
        }
    });
    // Dashboard sidebar logo is handled in dashboard_app.js


    // Apply Footer Text
    const footerTextElement = document.querySelector('footer .footer-text');
    if (footerTextElement) {
        footerTextElement.textContent = settings.footerText.replace(/\d{4}/, new Date().getFullYear());
    }
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'تاريخ غير صالح';
    }
    return date.toLocaleDateString('ar-EG', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         hour12: true
     });
}

let alertTimeout;
function showCustomAlert(message, type = 'info', duration = 3000) {
    const existingAlert = document.getElementById('custom-alert-popup');
    if (existingAlert) {
        existingAlert.remove();
    }
    if (alertTimeout) {
        clearTimeout(alertTimeout);
    }

    const alertDiv = document.createElement('div');
    alertDiv.id = 'custom-alert-popup';
    alertDiv.className = `custom-alert custom-alert-${type}`;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    alertTimeout = setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => { // Wait for fade out animation
            if (alertDiv.parentNode) {
                 alertDiv.remove();
            }
        }, 500);
    }, duration);
}


document.addEventListener('DOMContentLoaded', () => {
    applyThemeAndSettings();
});

document.addEventListener('settingsUpdated', () => {
    applyThemeAndSettings();
});


window.uiCommon = {
    formatDate,
    showCustomAlert,
    applyThemeAndSettings
};