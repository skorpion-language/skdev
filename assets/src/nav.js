document.addEventListener('DOMContentLoaded', function() {
    const STORAGE_KEY = 'skorpion_last_page';

    function refreshTabindex() {
        document.querySelectorAll('[data-link]').forEach(el => {
            const isActiveLink = el.matches('.leftmenu [data-link].is-active');
            const closedAccordion = el.closest('.accordion:not(.is-open)');

            if (isActiveLink || closedAccordion) {
                el.setAttribute('tabindex', '-1');
                el.setAttribute('aria-hidden', closedAccordion ? 'true' : 'false');
            } else {
                el.setAttribute('tabindex', '0');
                el.removeAttribute('aria-hidden');
            }
        });
    }

    window.refreshTabindex = refreshTabindex;

    const main = document.getElementById('main');
    if (main) {
        const blocks = main.querySelectorAll(':scope > div');
        const navLinks = document.querySelectorAll('[data-link]');

        function updateActiveLink(activeId) {
            navLinks.forEach(link => {
                link.classList.toggle('is-active', link.dataset.link === activeId);
            });
            refreshTabindex();
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

            el.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    showBlock(this.dataset.link);
                }
            });
        });

        window.addEventListener('popstate', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const pathParam = urlParams.get('path');
            const targetElement = pathParam ? document.getElementById(pathParam) : null;
            const id = (targetElement && targetElement.parentElement === main) ? pathParam : 'home.main';
            showBlock(id, false);
        });
    }

    refreshTabindex();
});