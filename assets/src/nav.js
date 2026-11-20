document.addEventListener('DOMContentLoaded', function() {
    const main = document.getElementById('main');
    if (!main) return;

    const blocks = main.querySelectorAll(':scope > div');
    const navLinks = document.querySelectorAll('[data-link]');
    const STORAGE_KEY = 'skorpion_last_page';

    function updateActiveLink(activeId) {
        navLinks.forEach(link => {
            link.classList.toggle('is-active', link.dataset.link === activeId);
        });
    }

    function showBlock(targetId, updateUrl = true) {
        blocks.forEach(child => {
            child.style.display = 'none';
            child.classList.remove('fadeDown');
        });

        updateActiveLink(targetId);

        const target = document.getElementById(targetId);
        if (target && target.parentElement === main) {
            target.style.display = 'block';
            void target.offsetWidth;
            target.classList.add('fadeDown');
            target.addEventListener('animationend', () => {
                target.classList.remove('fadeDown');
            }, { once: true });
        }

        if (updateUrl) {
            const url = new URL(window.location);
            url.searchParams.set('path', targetId);
            history.pushState({ path: targetId }, '', url);
            localStorage.setItem(STORAGE_KEY, targetId);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const pathParam = urlParams.get('path');
    const storedPage = localStorage.getItem(STORAGE_KEY);

    const urlTarget = pathParam ? document.getElementById(pathParam) : null;
    const storedTarget = storedPage ? document.getElementById(storedPage) : null;

    const initialId = (urlTarget && urlTarget.parentElement === main)
        ? pathParam
        : (storedTarget && storedTarget.parentElement === main)
            ? storedPage
            : 'home.main';

    showBlock(initialId, false);

    navLinks.forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            showBlock(this.dataset.link);
        });
    });

    window.addEventListener('popstate', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const pathParam = urlParams.get('path');
        const targetElement = pathParam ? document.getElementById(pathParam) : null;
        const id = (targetElement && targetElement.parentElement === main) ? pathParam : 'home.main';
        showBlock(id, false);
    });
});