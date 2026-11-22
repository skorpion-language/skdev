document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.accordion__summary').forEach(button => {
        button.addEventListener('click', () => {
            const accordion = button.closest('.accordion');
            const isOpen = accordion.classList.toggle('is-open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            window.refreshTabindex?.();
        });
    });
});