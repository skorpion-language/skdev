document.addEventListener('DOMContentLoaded', function() {
    const tokenDescriptions = {
        kw: {
            'use': 'Imports a module or namespace',
            'const': 'Declares an immutable variable',
            'func': 'Declares a new function',
            'if': 'Conditional statement',
            'elsif': 'Alternative conditional branch',
            'else': 'Fallback conditional branch',
            'case': 'Pattern matching statement',
            'for': 'Loop statement',
            'in': 'Iterator keyword for for-loops',
            'break': 'Exits the current loop',
            'continue': 'Skips to the next iteration of the loop',
            'do': 'Starts a do-while loop block',
            'while': 'Loop statement with a condition',
            'type': 'Type inspection operator',
            'return': 'Completes function execution and returns a value',
            'null': 'Null literal',
            'void': 'Absence of return value',
            'int': 'Integer type keyword',
            'char': 'Character type keyword',
            'string': 'String type keyword',
            'async': 'Declares an asynchronous function',
            'await': 'Suspends execution until an async value is ready',
            'notready': 'Represents an unresolved async value',
            'arr': 'Array type keyword',
            'dict': 'Dictionary type keyword',
            'float': 'Float type keyword',
            'double': 'Double precision type keyword',
            'bool': 'Boolean type keyword',
            'any': 'Any type keyword',
            'true': 'Boolean true literal',
            'false': 'Boolean false literal',
            'T': 'Generic type parameter',
            'new': 'Declares a new error type',
            'inherit': 'Specifies parent error type',
            'Error': 'Base error type',
            'throw': 'Throws an error',
            'try': 'Starts a try block',
            'catch': 'Catches an error',
            'as': 'Binds caught error to a variable',
            'includeC': 'Includes raw C code',
            'IknowIdo': 'Explicitly allows unsafe code'
        },
        types: {
            'int': 'Integer: whole number type',
            'float': 'Float: single-precision floating point',
            'double': 'Double: 64-bit floating point',
            'bool': 'Boolean: true or false',
            'string': 'String: text sequence',
            'char': 'Character: single byte character',
            'void': 'Void: no value',
            'arr': 'Array: ordered collection',
            'dict': 'Dictionary: key-value collection',
            'any': 'Any: dynamic type',
            'T': 'Generic: union type parameter',
            'Error': 'Error: base error type'
        },
        op: {
            '...': 'Spread operator',
            '..': 'Range operator',
            '==': 'Equality comparison',
            '!=': 'Inequality comparison',
            '<=': 'Less than or equal',
            '>=': 'Greater than or equal',
            '<': 'Less than',
            '>': 'Greater than',
            '+': 'Addition',
            '-': 'Subtraction',
            '*': 'Multiplication',
            '/': 'Division',
            '%': 'Modulo',
            '**': 'Exponentiation',
            '=': 'Assignment',
            '+=': 'Addition assignment',
            '-=': 'Subtraction assignment',
            '*=': 'Multiplication assignment',
            '/=': 'Division assignment',
            '%=': 'Modulo assignment',
            '**=': 'Exponentiation assignment',
            '++': 'Increment',
            '--': 'Decrement',
            '&&': 'Logical AND',
            '||': 'Logical OR',
            '!': 'Logical NOT',
            '&': 'Reference or import alias',
            '^': 'Format suffix',
            '~': 'Raw string delimiter',
            '?': 'Ternary condition',
            ':': 'Ternary separator',
            '@': 'Version specifier',
            '#': 'Wildcard import',
            '$': 'String conversion'
        },
        str: {
            '"': 'String literal',
            '"""': 'Multiline string literal',
            '~~~': 'Raw code block'
        },
        comment: {
            '//': 'Single line comment',
            '/*': 'Multiline comment'
        },
        num: {},
        func: {}
    };

    const rules = {
        sk: {
            keywords: "use const func if elsif else case for in break continue do while type return null void int char string async await notready arr dict float double bool any true false T new inherit Error throw try catch as includeC IknowIdo",
            types: "int float double bool string char void arr dict any T Error",
            operators: "... .. == != <= >= < > + - * / % ** = += -= *= /= %= **= ++ -- && || ! & ^ ~ ? : @ # $",
            singleLineComment: "//",
            multilineComments: [["/*", "*/"]],
            strings: ["'", '"'],
            multilineStrings: ['"""', "'''", '~~~'],
            numberSuffix: "[fF]?"
        }
    };

    function languageName(short) {
        const langs = {
            "sk": "Skorpion",
            "spc": "Skorpion configuration",
            "skd": "Skorpion dependencies",
            "txt": "Plain text"
        };
        return langs[short] || 'Plain Text';
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeText(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeAttr(str) {
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
        const parts = [];

        const strAlts = [];
        (rule.multilineStrings || []).forEach(pair => {
            const open = Array.isArray(pair) ? pair[0] : pair;
            const close = Array.isArray(pair) ? pair[1] : pair;
            strAlts.push(`${escapeRegex(open)}[\\s\\S]*?${escapeRegex(close)}`);
        });
        (rule.strings || []).forEach(q => {
            const e = escapeRegex(q);
            strAlts.push(`${e}(?:\\\\.|[^${e}\\\\])*${e}`);
        });
        if (strAlts.length) parts.push(`(?<str>${strAlts.join('|')})`);

        const comAlts = [];
        (rule.multilineComments || []).forEach(([open, close]) => {
            comAlts.push(`${escapeRegex(open)}[\\s\\S]*?${escapeRegex(close)}`);
        });
        if (rule.singleLineComment) comAlts.push(`${escapeRegex(rule.singleLineComment)}.*`);
        if (comAlts.length) parts.push(`(?<comment>${comAlts.join('|')})`);

        const opTokens = parseTokens(rule.operators);
        if (opTokens.length) parts.push(`(?<op>${opTokens.join('|')})`);

        const kwTokens = parseTokens(rule.keywords);
        if (kwTokens.length) parts.push(`(?<kw>\\b(?:${kwTokens.join('|')})\\b)`);

        const typeTokens = parseTokens(rule.types);
        if (typeTokens.length) parts.push(`(?<type>\\b(?:${typeTokens.join('|')})\\b)`);

        parts.push(`(?<num>\\b\\d+(?:\\.\\d+)*(?:${rule.numberSuffix || ''})\\b)`);
        parts.push(`(?<func>\\b[a-zA-Z_]\\w*(?=\\s*\\())`);

        return new RegExp(parts.join('|'), 'g');
    }

    const TOKEN_ORDER = ['str', 'comment', 'op', 'kw', 'type', 'num', 'func'];

    function highlightCode(code, lang) {
        const regex = buildRegex(lang);
        const escaped = escapeText(code);

        const html = escaped.replace(regex, function(match, ...args) {
            const groups = args[args.length - 1];
            let className = null;
            let tokenValue = null;
            let dictKey = null;

            for (const key of TOKEN_ORDER) {
                if (groups[key] !== undefined) {
                    className = 'code-' + key;
                    tokenValue = groups[key];
                    dictKey = key;
                    break;
                }
            }

            if (!className) return match;

            let descriptionAttr = '';
            const dict = tokenDescriptions[dictKey];
            if (dict && dict[tokenValue]) {
                descriptionAttr = ` data-description="${escapeAttr(dict[tokenValue])}"`;
            }

            if (tokenValue.indexOf('\n') !== -1) {
                return tokenValue.split('\n')
                    .map(l => `<span class="${className}"${descriptionAttr}>${l}</span>`)
                    .join('\n');
            }
            return `<span class="${className}"${descriptionAttr}>${tokenValue}</span>`;
        });

        return html.split('\n')
            .map(line => `<span class="code-line">${line}</span>`)
            .join('');
    }

    document.querySelectorAll('.code-block').forEach(block => {
        const content = block.querySelector('.code-content');
        if (!content) return;
        const fileName = block.dataset.file || 'code.txt';
        const lang = block.dataset.lang || 'txt';
        const rawText = content.innerText;
        const lineCount = rawText.split('\n').length;
        const isInitiallyOpen = lineCount <= 15;
        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `
            <button class="co is-open" type="button" aria-expanded="true"></button>
            <span class="file badge">${escapeAttr(fileName)}</span>
            <span class="lang">${escapeAttr(languageName(lang))}</span>
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
        if (isInitiallyOpen) content.classList.add('is-open');
        else content.classList.remove('is-open');
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