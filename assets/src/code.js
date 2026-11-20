document.addEventListener('DOMContentLoaded', function() {
    const tokenDescriptions = {
        kw: {
            'use': 'Импортирует модуль или пространство имен',
            'func': 'Объявляет новую функцию',
            'let': 'Объявляет неизменяемую переменную',
            'return': 'Завершает выполнение функции и возвращает значение',
            'if': 'Условный оператор',
            'else': 'Альтернативная ветка условного оператора'
        },
        types: {
            'bool': 'Boolean: логический тип (true или false)',
            'int': 'Integer: целочисленный тип',
            'string': 'String: текстовая строка',
            'void': 'Void: отсутствие возвращаемого значения',
            'arr': 'Array: упорядоченная коллекция элементов'
        },
        op: {
            '...': 'Оператор расширения (spread) или диапазон',
            '..': 'Оператор диапазона (range)',
            '->': 'Стрелочная функция или возврат типа'
        }
    };

    const rules = {
        sk: {
            keywords: "use func let return if else for while import class struct enum",
            types: "int float bool string char auto void arr",
            operators: "... .. -> => == != <= >= + - * / % = ++ --",
            comment: "//"
        }
    };

    function languageName(short) {
        const langs = {
            "sk": "skorpion",
            "spc": "skorpion configuration",
            "skd": "skorpion dependencies",
            "txt": "plain text"
        };
        return langs[short] || 'Plain Text';
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function parseTokens(str) {
        if (!str) return [];
        return str.trim()
            .split(/\s+/)
            .map(escapeRegex)
            .sort((a, b) => b.length - a.length);
    }

    function buildRegex(lang) {
        const rule = rules[lang] || rules.sk;
        const stringPattern = `("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')`;
        const commentPattern = `(${escapeRegex(rule.comment)}.*)`;
        const kwTokens = parseTokens(rule.keywords).join('|');
        const kwPattern = kwTokens ? `\\b(${kwTokens})\\b` : '';
        const typeTokens = parseTokens(rule.types).join('|');
        const typePattern = typeTokens ? `\\b(${typeTokens})\\b` : '';
        const opTokens = parseTokens(rule.operators).join('|');
        const opPattern = opTokens ? `(${opTokens})` : '';
        const numPattern = `\\b(\\d+(?:\\.\\d+)?)\\b`;
        const funcPattern = `\\b([a-zA-Z_]\\w*)(?=\\s*\\()`;
        const parts = [stringPattern, commentPattern];
        if (opPattern) parts.push(opPattern);
        if (kwPattern) parts.push(kwPattern);
        if (typePattern) parts.push(typePattern);
        parts.push(numPattern);
        parts.push(funcPattern);
        return new RegExp(parts.filter(p => p).join('|'), 'g');
    }

    function highlightLine(line, regex) {
        const escaped = escapeHtml(line);
        return escaped.replace(regex, (match, str, comment, op, kw, type, num, func) => {
            let className = '';
            let tokenValue = '';
            let descriptionAttr = '';
            if (str) { className = 'code-str'; tokenValue = str; }
            else if (comment) { className = 'code-comment'; tokenValue = comment; }
            else if (op) { className = 'code-op'; tokenValue = op; }
            else if (kw) { className = 'code-kw'; tokenValue = kw; }
            else if (type) { className = 'code-type'; tokenValue = type; }
            else if (num) { className = 'code-num'; tokenValue = num; }
            else if (func) { className = 'code-func'; tokenValue = func; }
            else { return match; }
            const dictKey = className.replace('code-', '');
            if (tokenDescriptions[dictKey] && tokenDescriptions[dictKey][tokenValue]) {
                const descText = tokenDescriptions[dictKey][tokenValue];
                descriptionAttr = ` data-description="${escapeHtml(descText)}"`;
            }
            return `<span class="${className}"${descriptionAttr}>${tokenValue}</span>`;
        });
    }

    function highlightCode(code, lang) {
        const regex = buildRegex(lang);
        return code.split('\n').map(line => `<span class="code-line">${highlightLine(line, regex)}</span>`).join('');
    }

    document.querySelectorAll('.code-block').forEach(block => {
        const content = block.querySelector('.code-content');
        if (!content) return;
        const fileName = block.dataset.file || 'code.txt';
        const lang = block.dataset.lang || 'txt';
        const rawText = content.innerText;
        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `
            <button class="co is-open" type="button" aria-expanded="true"></button>
            <span class="file badge">${escapeHtml(fileName)}</span>
            <span class="lang">${escapeHtml(languageName(lang))}</span>
            <button class="copy button" type="button">&#xebcc; Copy</button>
            <button class="rawbtn button" type="button">&#xeaee; Raw</button>
            <button class="downbtn button" type="button">&#xec74; Download</button>
        `;
        block.insertBefore(header, content);
        const inner = document.createElement('div');
        inner.className = 'code-content-inner';
        inner.innerHTML = highlightCode(rawText, lang);
        content.innerHTML = '';
        content.appendChild(inner);
        // content.classList.add('is-open');
        const coBtn = header.querySelector('.co');
        coBtn.addEventListener('click', () => {
            const isOpen = content.classList.toggle('is-open');
            coBtn.classList.toggle('is-open');
            coBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        header.querySelector('.copy').addEventListener('click', function() {
            navigator.clipboard.writeText(rawText);
            const originalHTML = this.innerHTML;
            this.innerHTML = '&#xeab2; Copied';
            setTimeout(() => { this.innerHTML = originalHTML; }, 1500);
        });
        header.querySelector('.rawbtn').addEventListener('click', () => {
            const blob = new Blob([rawText], { type: 'text/plain' });
            window.open(URL.createObjectURL(blob), '_blank');
        });
        header.querySelector('.downbtn').addEventListener('click', () => {
            const blob = new Blob([rawText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });
});