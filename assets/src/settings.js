document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_KEY = 'skorpion_theme';
    const ACCESSIBILITY_KEY = 'skorpion_accessibility';
    const themeList = document.getElementById('themeList');
    if (!themeList) return;

    const themes = {
        dark: {
            '--bg-base': 'rgb(15, 12, 12)',
            '--bg-section': 'rgb(22, 19, 25)',
            '--bg-ui-element': 'rgba(51, 51, 84, 0.2)',
            '--bg-ui-element-active': 'rgb(89, 89, 156)',
            '--bg-selected': 'rgb(89, 89, 156)',
            '--text-base': 'rgb(135, 135, 152)',
            '--text-mut': 'rgb(51, 51, 84)',
            '--text-sel': 'rgb(89, 89, 156)',
            '--text-selected': 'rgb(22, 19, 25)',
            '--border-base': 'rgb(51, 51, 84)',
            '--border-new-paper': 'rgba(51, 51, 84, 0.75)'
        },
        light: {
            '--bg-base': 'rgb(240, 240, 245)',
            '--bg-section': 'rgb(255, 255, 255)',
            '--bg-ui-element': 'rgba(200, 200, 220, 0.3)',
            '--bg-ui-element-active': 'rgb(89, 89, 156)',
            '--bg-selected': 'rgb(89, 89, 156)',
            '--text-base': 'rgb(60, 60, 80)',
            '--text-mut': 'rgb(150, 150, 170)',
            '--text-sel': 'rgb(89, 89, 156)',
            '--text-selected': 'rgb(255, 255, 255)',
            '--border-base': 'rgb(200, 200, 220)',
            '--border-new-paper': 'rgba(200, 200, 220, 0.75)'
        }
    };
    
    function applyAccessibility(value) {
        document.documentElement.style.setProperty('--accessbility-outline', value);
    }
    
    function setActiveToggle(value) {
        const toggle = document.getElementById('accessibilityToggle');
        if (toggle) {
            toggle.classList.toggle('is-active', value === '1');
        }
    }
    
    const savedAccessibility = localStorage.getItem(ACCESSIBILITY_KEY) || '#f4a460';
    applyAccessibility(savedAccessibility);
    setActiveToggle(savedAccessibility);
    
    const accessibilityToggle = document.getElementById('accessibilityToggle');
    if (accessibilityToggle) {
        accessibilityToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = this.classList.toggle('is-active');
            const value = isActive ? '#f4a460' : '#f4a46000';
            applyAccessibility(value);
            localStorage.setItem(ACCESSIBILITY_KEY, value);
        });
    }

    function applyTheme(theme) {
        let scheme;
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            scheme = prefersDark ? themes.dark : themes.light;
        } else {
            scheme = themes[theme];
        }
        Object.entries(scheme).forEach(([prop, value]) => {
            document.documentElement.style.setProperty(prop, value);
        });
    }

    function setActiveOption(theme) {
        themeList.querySelectorAll('.option').forEach(opt => {
            opt.classList.toggle('is-active', opt.textContent.trim().toLowerCase() === theme);
        });
    }

    const savedTheme = localStorage.getItem(STORAGE_KEY) || 'system';
    applyTheme(savedTheme);
    setActiveOption(savedTheme);

    themeList.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', function() {
            const theme = this.textContent.trim().toLowerCase();
            applyTheme(theme);
            setActiveOption(theme);
            localStorage.setItem(STORAGE_KEY, theme);
        });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const currentTheme = localStorage.getItem(STORAGE_KEY) || 'system';
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });
});