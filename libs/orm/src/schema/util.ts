import * as ts from 'byots';
import { program } from './entry';

//Gets a root level declaration with the specified identifier.
export function getDeclaration(src: ts.SourceFile, ident: string, searchDepth: number = 5): ts.Node {
    let declaration: ts.Node;
    let matches = false;
    
    recurseToDepth((n: ts.Node) => {
        const childIdent = n.getChildren().filter(c => ts.isIdentifier(c));

        childIdent?.forEach(i => {
            if (i.getText() == ident) {
                declaration = n;
                matches = true;
            }
        });

        if (matches) {
            return n;
        }

        return;
    }, src.getChildAt(0), searchDepth);

    return declaration;
}

export function recurseToDepth(
    callback: (n: ts.Node) => ts.Node | void,
    n: ts.Node, 
    depth: number
) {
    if (depth === 0) return;

    n.getChildren()?.forEach((child: ts.Node) => {
        callback(child);
        recurseToDepth(callback, child, depth - 1);
    });
}

export function parseBinaryExpression(n: ts.Node) {
    let schema = '';

	n.getChildren().forEach(expr => {
        switch (expr.kind) {
            case ts.SyntaxKind.StringLiteral:
                schema += `'${expr.getText()}'`;
                break;
            case ts.SyntaxKind.EqualsEqualsEqualsToken:
                schema += '==';
                break;;
            case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                schema += '!=';
                break;
            default:
                schema += `${parseType(expr)}`;
        }
    });

    return schema;
}

export function parseType(n: ts.Node) {
	let schema = '';
	
	switch (n.kind) {
		case ts.SyntaxKind.BinaryExpression:
			schema += parseBinaryExpression(n);
			break;
	
		case ts.SyntaxKind.PropertyAccessExpression:
			if (n.getText().includes('this.')) { 
				// .. grab local field OR query builder
			}
            else {
                schema += ' ' + n.getText();
            }
			break;

		case ts.SyntaxKind.ParenthesizedExpression: 
            //Todo, make this a bit more robust. Support other nested types in parentheses.
            const binExpr = n.getChildren().find(c => ts.isBinaryExpression(c));

            const children = n.getChildren();
            children.forEach(child => {
                // console.log(ts.SyntaxKind[child.kind]);
                if (child.kind == ts.SyntaxKind.BinaryExpression || 
                    child.kind == ts.SyntaxKind.PropertyAccessExpression ||
                    child.kind == ts.SyntaxKind.Identifier ||
                    child.kind == ts.SyntaxKind.CallExpression ||
                    child.kind == ts.SyntaxKind.ParenthesizedExpression ||
                    child.kind == ts.SyntaxKind.StringLiteral 
                ) {
                    schema += `( ${parseType(child)})`;
                }
            });
			break;

		case ts.SyntaxKind.CallExpression:
			schema += `${n.getChildAt(0).getText().toLowerCase()}(${parseType(n.getChildAt(1))})`;
			break;
		
        case ts.SyntaxKind.Identifier:
            const pos = ts.GoToDefinition.getDefinitionAndBoundSpan(program, n.getSourceFile(), n.getStart());

            const identSrc = program.getSourceFile(pos?.definitions[0].fileName);


            if (identSrc) {
                const declaration = getDeclaration(identSrc, n.getText());

    
                //Get the object literal off declaration.
                const objLit = declaration?.getChildren().find(c => ts.isObjectLiteralExpression(c));
                const syntaxList = objLit?.getChildren().find(c => c.kind == ts.SyntaxKind.SyntaxList);
                const propAssignments = syntaxList?.getChildren().filter(c => ts.isPropertyAssignment(c));
    
                let scopeName;
    
                propAssignments?.forEach(prop => {
                    let name = prop.getChildAt(0).getText();
                    let value = prop.getChildAt(2).getText();
    
                    if (name == 'name') {
                         scopeName = value;
                    }
                });
                
                if(scopeName) {
                    schema += `$scope = ${scopeName}`
                }

                else {
                    schema += n.getText()
                }
            }
            break;
		default:
			schema += n.getText()
	}

    return schema + ' ';
}
