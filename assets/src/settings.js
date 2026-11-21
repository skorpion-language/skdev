document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_KEY = 'skorpion_theme';
    const ACCESSIBILITY_KEY = 'skorpion_accessibility';
    const themeList = document.getElementById('themeList');
    if (!themeList) return;

    const themes = ['dark', 'light'];
    
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
            scheme = prefersDark ? 'dark' : 'light';
        } else {
            scheme = theme;
        }
        document.documentElement.setAttribute('data-theme', scheme);
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