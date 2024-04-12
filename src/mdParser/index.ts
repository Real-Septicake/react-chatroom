// yeah this is pretty much just the SFM parser made by the Sharkey team...
// until this manages to branch out past that, here's the link to the relevant projects
// Sharkey: https://activitypub.software/TransFem-org/Sharkey
// SFM Parser: https://activitypub.software/TransFem-org/sfm-js

// I'm hoping I can make some actual step away from it effectively being a ctrl+c ctrl+v
// but unfortunately I'm not currently sure how-

export type Success<T> = {
    success: true,
    value: T,
    index: number
};

export type Failure = { success: false };

export type Result<T> = Success<T> | Failure;

export type ParserFn<T> = (input: string, index: number, state: any) => Result<T>

export function success<T>(idx: number, value: T): Success<T> {
    return {
        success: true,
        value: value,
        index: idx
    }
}

export function failure(): Failure {
    return { success: false }
}

export class Parser<T> {
    public fn: ParserFn<T>
    public name?: string;

    constructor(fn: ParserFn<T>) {
        this.fn = fn;
    }

    map<U>(mapFn: (value: T) => U): Parser<U> {
        return new Parser((input, index, state) => {
            const result = this.fn(input, index, state);
            if(!result.success) {
                return result;
            }
            return success(result.index, mapFn(result.value));
        })
    }

    text(): Parser<string> {
        return new Parser((input, index, state) => {
            const result = this.fn(input, index, state);
            if(!result.success) {
                return result;
            }
            return success(result.index, input.slice(index, result.index))
        })
    }

    many(minCount: number): Parser<T[]> {
        return new Parser((input, index, state) => {
            let result;
            let latest = index;
            const accum: T[] = []
            while(latest < input.length) {
                result = this.fn(input, latest, state);
                if(!result.success) {
                    break;
                }
                latest = result.index;
                accum.push(result.value);
            }
            if(accum.length < minCount) {
                return failure();
            }
            return success(latest, accum)
        })
    }

    sep(separator: Parser<any>, minCount: number): Parser<T[]> {
        if(minCount < 1) {
            throw new Error(`"min" must be a value creater than 1`)
        }
        return sequence([
            this,
            sequence([
                separator,
                this
            ], 1).many(minCount - 1),
        ]).map(result => [result[0], ...result[1]])
    }

    option(): Parser<T | null> {
        return alt([
            this,
            succeeded(null)
        ])
    }
}

export function strMatch<T extends string>(value: T): Parser<T> {
    return new Parser((input, index, _state) => {
        if(index + value.length > input.length) {
            return failure()
        }
        if(input.substring(index, index + value.length) !== value) {
            return failure()
        }
        return success(index + value.length, value);
    });
}

export function regexMatch<T extends RegExp>(pattern: T): Parser<string> {
    const exp = RegExp(`^(?:${pattern.source})`, pattern.flags)
    return new Parser((input, index, _state) => {
        const text = input.slice(index)
        const res = exp.exec(text)
        if(res === null) {
            return failure();
        }
        return success(index + res[0].length, res[0])
    })
}

export function sequence(parsers: Parser<any>[], select?: number): Parser<any> {
    return new Parser((input, index, state) => {
        let result;
        let latest = index;
        let accum = [];
        for(let parser of parsers) {
            result = parser.fn(input, index, state)
            if(!result.success) {
                return result;
            }
            latest = result.index;
            accum.push(result.value);
        }
        return success(latest, (select != null ? accum[select] : accum))
    })
}

export function alt(parsers: Parser<any>[]): Parser<any> {
    return new Parser((input, index, state) => {
        let result;
        for(let parser of parsers) {
            result = parser.fn(input, index, state);
            if(result.success) {
                return result
            }
        }
        return failure();
    })
}

function succeeded<T>(value: T): Parser<T> {
    return new Parser((_input, index, _state) => {
        return success(index, value);
    })
}

export function not(parser: Parser<any>): Parser<null> {
    return new Parser((input, index, state) => {
        const result = parser.fn(input, index, state)
        return result.success ? failure() : success(index, null);
    })
}

export function not_else(not: Parser<any>, include: Parser<any>): Parser<string> {
    return new Parser((input, index, state) => {
        const exclude = not.fn(input, index, state)
        if(exclude.success) {
            return failure();
        }
        return include.fn(input, index, state)
    })
}

export const cr = strMatch('\r')
export const lf = strMatch('\n')
export const crlf = strMatch('\r\n')
export const newLine = alt([crlf, cr, lf])

export const allChar = new Parser((input, index, _state) => {
    if(index + 1 > input.length) {
        return failure();
    }
    return success(index + 1, input.charAt(index))
})

export const lineStart = new Parser((input, index, state) => {
    if(index === 0) {
        return success(index, null)
    }
    if(cr.fn(input, index - 1, state).success || lf.fn(input, index - 1, state).success) {
        return success(index, null)
    }
    return failure();
})

export const lineEnd = new Parser((input, index, state) => {
    if(index === input.length) {
        return success(index, null);
    }
    if(cr.fn(input, index, state).success || lf.fn(input, index, state).success) {
        return success(index, null);
    }
    return failure();
})

export function lazy<T>(func: () => Parser<T>): Parser<T> {
    const parser: Parser<T> = new Parser((input, index, state) => {
        parser.fn = func().fn;
        return parser.fn(input, index, state)
    })
    return parser;
}

export function createLanguage<T>(syntaxes: { [K in keyof T]: (r: Record<string, Parser<any>>) => T[K] }): T {
    const rules: Record<string, Parser<any>> = {};
    for(const key of Object.keys(syntaxes)) {
        rules[key] = lazy(() => {
            const parser = (syntaxes as any)[key](rules)
            if(parser == null) {
                throw new Error('Syntax must return a Parser');
            }
            parser.name = key;
            return parser;
        })
    }
    return rules as any
}