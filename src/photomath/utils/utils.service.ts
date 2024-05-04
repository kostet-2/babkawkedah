import { Injectable } from '@nestjs/common';
import templates from './templates';
@Injectable()
export class UtilsService {
    private readonly templates = templates();
    private readonly config = {
        const: (node) => node.value.replace('.', '{,}'),
        var: (node) => node.value,
        string: (node) => node.value,
        inline_rich_text: (node) => '\\)' + this.localize(node.text.localization) + '\\(',
        vert_list: (node) => node.children.map((n) => this.nodeToLatex(n)).join('\\)$n$n\\('),
        order: (node) => '(' + node.children.map((n) => this.nodeToLatex(n)).join('; ') + ')',
        list: (node) => node.children.map((n) => this.nodeToLatex(n)).join(', '),
        system: (node) =>
            '\\begin{cases}' +
            node.children.map((n) => this.nodeToLatex(n).split('\\)$n$n\\(').join(',\\\\ ')).join(',\\\\ ') +
            ';\\end{cases}',
        alt_form: (node) => node.children.map((n) => this.nodeToLatex(n)).join('\\), \\('),
        set: (node) => '$c{' + node.children.map((n) => this.nodeToLatex(n)).join(';') + '}$c',
        periodic_localize: (node) => {
            const number = node.children[0].value;
            const i = number.length - node.children[1].value;
            return (number.substring(0, i) + '(' + number.substring(i) + ')').replace('.', '{,}');
        },
    };

    nodeToLatex(node) {
        let res = this.templates[node.type];
        if (!res) {
            res = this.config[node.type] ? this.config[node.type](node) : node.type;
        }

        let i = 0;
        while (true) {
            const regex = new RegExp('\\$' + i, 'g');
            if (!regex.test(res)) break;
            const replacement = this.nodeToLatex(node.children[i]);
            res = res.replace(regex, replacement);
            i++;
        }

        return this.postProcess(res);
    }

    parseLatex(node) {
        return '\\(' + this.nodeToLatex(node) + '\\)';
    }

    localize(localization) {
        return localization.tokens
            .map((token) => (token.type === 'node' ? this.parseLatex(token.node) : token.text))
            .join('');
    }

    postProcess(str) {
        function replace(s) {
            const replacementMap = {
                α: '\\alpha ',
                β: '\\beta ',
                γ: '\\gamma ',
                δ: '\\delta ',
                ε: '\\varepsilon ',
                η: '\\eta ',
                θ: '\\theta ',
                λ: '\\lambda ',
                µ: '\\mu ',
                π: '\\pi ',
                ρ: '\\rho ',
                σ: '\\sigma ',
                τ: '\\tau ',
                Φ: '\\phi ',
                ψ: '\\psi ',
                ℕ: '\\N ',
                ℤ: '\\Z ',
                ℚ: '\\Q ',
                ℝ: '\\R ',
                '∅': '\\varnothing ',
                '∞': '\\infty ',
                'log_{10}': 'lg',
            };
            const regex = new RegExp(
                Object.keys(replacementMap).join('|').replace(/\{/g, '\\{').replace(/\}/g, '\\}'),
                'g',
            );
            return s.replace(regex, (match) => replacementMap[match]);
        }

        function brackets(s) {
            const regex = /\$c.*?\$c/g;
            return s.replace(regex, (match) => {
                const l = match.length;
                let open = match.substring(2, 3);
                let close = match.substring(l - 2, l - 3);
                const inner = match.substring(3, l - 3);

                if (open === '{') {
                    open = '\\' + open;
                    close = '\\' + close;
                }

                if (inner.includes('\\dfrac')) {
                    open = '\\left' + open;
                    close = '\\right' + close;
                }

                function countTopLevelBrackets(str) {
                    let count = 0;
                    let topLevel = 0;

                    for (let c of str) {
                        if (c === '(') {
                            count++;
                            if (count === 1) {
                                topLevel++;
                            }
                        } else if (c === ')') {
                            count--;
                        }
                    }
                    return topLevel;
                }

                let unnecessary =
                    (/^\\left\(.*\\right\)$/.test(inner) && countTopLevelBrackets(inner) == 1) ||
                    (/^\(.*\)$/.test(inner) && countTopLevelBrackets(inner) == 1) ||
                    /^[a-zA-Z0-9]+$/.test(inner) ||
                    /^\s*(\\alpha|\\beta|\\gamma|\\pi|\\theta)\s*$/.test(inner) ||
                    /^\s*[0-9]+\^{\\circ}\s*$/.test(inner);

                if (open == '|') unnecessary = false;

                if (unnecessary) {
                    open = '';
                    close = '';
                }

                return open + inner + close;
            });
        }

        function powAndIndex(s) {
            const regex = /\$d.*?\$d/g;
            return s.replace(regex, (match) => {
                return match.substring(2, match.length - 2).replace(/dfrac/g, 'frac');
            });
        }

        return powAndIndex(brackets(replace(str)));
    }
}
