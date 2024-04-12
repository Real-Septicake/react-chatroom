export type MdNode = MdInline

export type MdInline = MdItalic | MdBold | MdText | MdStrike | MdUnderline | MdSmall

export type MdItalic = {
    type: 'italic',
    props?: Record<string, unknown>,
    children: MdInline[] 
}
export const italicNode = (children: MdInline[]): MdItalic => { return { type: 'italic', children: children} }

export type MdBold = {
    type: 'bold',
    props?: Record<string, unknown>,
    children: MdInline[]
}
export const boldNode = (children: MdInline[]): MdBold => { return { type: 'bold', children: children } }

export type MdStrike = {
    type: 'strike',
    props?: Record<string, unknown>,
    children: MdInline[]
}

export const strikeNode = (children: MdInline[]): MdStrike => { return { type: 'strike', children: children } }

export type MdUnderline = {
    type: 'uline',
    props?: Record<string, unknown>,
    children: MdInline[]
}

export const underlineNode = (children: MdInline[]): MdUnderline => { return { type: 'uline', children: children } }

export type MdSmall = {
    type: 'small',
    props?: Record<string, unknown>,
    children: MdInline[]
}

export const smallNode = (children: MdInline[]): MdSmall => { return { type: 'small', children: children } }

export type MdText = {
    type: 'text'
    props: {
        text: string
    }
    children?: []
}
export const textNode = (value: string): MdText => { return { type: 'text', props: { text: value } } }