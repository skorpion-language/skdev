document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.control').forEach(control => {
        const param = control.querySelector('.param');
        if (!param) return;

        const list = control.querySelector('.list');
        if (!list) return;

        const inner = document.createElement('div');
        inner.className = 'list-inner';
        while (list.firstChild) {
            inner.appendChild(list.firstChild);
        }
        list.appendChild(inner);

        param.addEventListener('click', () => {
            control.classList.toggle('is-open');
        });
    });
});