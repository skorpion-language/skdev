document.addEventListener('DOMContentLoaded', () => {
    const globalContainer = document.querySelector('.global');
    const rmPlaceholder = document.getElementById('rm-placeholder');
    const defaultText = rmPlaceholder.textContent;

    globalContainer.classList.add('show-description');
    document.querySelectorAll('[data-description]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const desc = el.getAttribute('data-description');
            if (desc) {
                // globalContainer.classList.add('show-description');
                rmPlaceholder.innerHTML = desc;
                rmPlaceholder.classList.remove('mut');
            }
        });

        el.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!document.querySelector('[data-description]:hover')) {
                    // globalContainer.classList.remove('show-description');
                    rmPlaceholder.textContent = defaultText;
                    rmPlaceholder.classList.add('mut');
                }
            }, 50);
        });
    });
});