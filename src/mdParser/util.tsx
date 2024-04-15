import * as N from "./node"

// eslint-disable-next-line import/no-anonymous-default-export
export default function (rootAST: N.MdNode[]) {
    const genEl = (ast: N.MdNode[]) => ast.map((token): JSX.Element | string | (JSX.Element | string)[] => {
        switch (token.type) {
            case 'text': {
                return token.props.text.replace(/(\r\n|\n|\r)/g, '\n');
            }

            case 'bold': {
                return <b>{genEl(token.children)}</b>
            }

            case 'italic': {
                return <i>{genEl(token.children)}</i>
            }

            case 'strike': {
                return <del>{genEl(token.children)}</del>
            }

            case "uline": {
                return <u>{genEl(token.children)}</u>
            }

            case "small": {
                return <span style={{fontSize: "0.8em", opacity: 0.8}}>{genEl(token.children)}</span>
            }

            case "codeInline": {
                return <span style={{fontFamily: "monospace", padding: "3px", borderRadius: "3px", backgroundColor: "#414147"}}>{token.props.text}</span>
            }

            default: {
                console.error(`Unexpected node type: ${(token as any).type}`)
                return [];
            }
        }
    });

    return <span>{genEl(rootAST)}</span>
}