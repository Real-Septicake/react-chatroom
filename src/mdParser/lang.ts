import * as N from "./node"
import * as P from "./index"

function mergeText<T extends N.MdNode>(nodes: ((T extends N.MdInline ? N.MdInline : N.MdNode) | string)[]): (T | N.MdText)[] {
    const output: (T | N.MdText)[] = [];
    const store: string[] = [];

    function generateText() {
        if(store.length > 0) {
            output.push(N.textNode(store.join('')))
            store.length = 0;
        }
    }

    const flatten = nodes.flat(1) as (T | string)[]
    for(const node of flatten) {
        if(typeof node === 'string') {
            store.push(node);
        } else if(!Array.isArray(node) && node.type === 'text') {
            store.push((node as N.MdText).props.text)
        } else {
            generateText();
            output.push(node);
        }
    }

    generateText();
    return output;
}

function seqOrText(parsers: P.Parser<any>[]): P.Parser<any[] | string> {
    return new P.Parser<any[] | string>((input, index, state) => {
        const accum: any[] = []
        let latest = index;
        for(let parser of parsers) {
            const result = parser.fn(input, latest, state);
            if(!result.success) {
                if(latest === index) {
                    return P.failure()
                } else {
                    return P.success(latest, input.slice(index, latest))
                }
            }
            accum.push(result.value);
            latest = result.index
        }
        return P.success(latest, accum)
    })
}

const nestable = new P.Parser((_input, index, state) => {
    return state.depth < state.nestLimit ? 
        P.success(index, null) :
        P.failure()
})

function nest<T>(parser: P.Parser<T>, fallback?: P.Parser<string>): P.Parser<T | string> {
    const inner = P.alt([
        P.sequence([nestable, parser], 1),
        fallback != null ? fallback : P.allChar
    ])
    return new P.Parser<T | string>((input, index, state) => {
        state.depth++;
        const result = inner.fn(input, index, state);
        state.depth--;
        return result;
    })
}

const language = P.createLanguage({
    fullParser: r => {
        return P.alt([
            r.bold,
            r.italic,
            r.strike,
            r.uline,
            r.small,
            r.codeInline,
            r.text
        ]).many(0);
    },

    inline: r => {
        return P.alt([
            r.bold,
            r.italic,
            r.strike,
            r.uline,
            r.small,
            r.codeInline,
            r.text
        ]);
    },

    italic: r => {
        const mark = P.strMatch("*")
        return seqOrText([
            mark,
            P.sequence([P.not(mark), nest(r.inline)], 1).many(1),
            mark,
        ]).map(result => {
            if(typeof result === 'string') return result;
            return N.italicNode(mergeText(result[1] as (N.MdInline | string)[]))
        })
    },

    bold: r => {
        const mark = P.strMatch("**")
        return seqOrText([
            mark,
            P.sequence([P.not(mark), nest(r.inline)], 1).many(1),
            mark,
        ]).map(result => {
            if(typeof result === 'string') return result;
            return N.boldNode(mergeText(result[1] as (N.MdInline | string)[]))
        })
    },

    boldItalic: r => {
        const mark = P.strMatch("***")
        return seqOrText([
            mark,
            P.sequence([P.not(mark), nest(r.inline)], 1).many(1),
            mark,
        ]).map(result => {
            if(typeof result === 'string') return result;
            return N.boldNode([N.italicNode(mergeText(result[1] as (N.MdInline | string)[]))])
        })
    },

    strike: r => {
        const mark = P.strMatch("~~")
        return seqOrText([
            mark,
            P.sequence([P.not(mark), nest(r.inline)], 1).many(1),
            mark,
        ]).map(result => {
            if(typeof result === 'string') return result;
            return N.strikeNode(mergeText(result[1] as (N.MdInline | string)[]))
        })
    },

    uline: r => {
        const mark = P.strMatch("__")
        return seqOrText([
            mark,
            P.sequence([P.not(mark), nest(r.inline)], 1).many(1),
            mark,
        ]).map(result => {
            if(typeof result === 'string') return result;
            return N.underlineNode(mergeText(result[1] as (N.MdInline | string)[]))
        })
    },

    small: r => {
        const open = P.strMatch("<s>")
        const close = P.strMatch("</s>")
        return seqOrText([
            open,
            P.sequence([P.not(close), nest(r.inline)], 1).many(1),
            close,
        ]).map(result => {
            if (typeof result === 'string') return result;
            return N.smallNode(mergeText(result[1] as (N.MdInline | string)[]))
        })
    },

    codeInline: r => {
        const mark = P.strMatch("`")
        return seqOrText([
            mark,
            P.sequence([P.not(mark), r.text], 1).many(1),
            mark
        ]).map(result => N.codeInlineNode(result[1].join('')))
    },

    text: r => { return P.allChar },
})

export function fullParse(input: string, nestLimit?: number) {
    const result = language.fullParser.fn(input, 0, {
        nestLimit: nestLimit != null ? nestLimit : 20,
        depth: 0
    }) as P.Success<any>
    return mergeText(result.value);
}