import * as ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { checker } from './entry';
import { toSnakeCase } from './util';

//Takes an expression and parses it into equivalent SurrealQL. 
//Constraint is to only allow valid types of expressions. other types should throw an error.
//This is primarily used for parsing permission and assertion expressions.

export function parseExpression(expr: ts.Node | ts.TypeNode | null): string {
    if (!expr) {
        return '';
    }

    return parseExpressionInternal(expr)
        .replaceAll('GeoPoint', 'geometry(point)')
        .replaceAll('GeoPolygon', 'geometry(polygon)')
        .replaceAll('GeoCollection', 'geometry(collection)')
        .replaceAll('Float', 'float')
        .replaceAll('Decimal', 'decimal')
        .replaceAll('number', 'int')
        .replaceAll('boolean', 'bool');
}

function parseExpressionInternal(expr: ts.Node | ts.TypeNode | null): string {
    if (!expr) {
        return '';
    }
    
    switch (expr.kind) {
        case ts.SyntaxKind.BinaryExpression:
                return parseBinaryExpression(expr as ts.BinaryExpression);
        case ts.SyntaxKind.UnionType:
                return parseUnionType(expr as ts.UnionTypeNode);
        case ts.SyntaxKind.Identifier:
            return parseIdentifier(expr as ts.Identifier);
        case ts.SyntaxKind.ParenthesizedExpression:
            return parseParentesizedExpression(expr as ts.ParenthesizedExpression);
        case ts.SyntaxKind.TrueKeyword:
            return 'FULL';
        case ts.SyntaxKind.FalseKeyword:
            return 'NONE';
        case ts.SyntaxKind.StringLiteral:
            return (expr as ts.StringLiteral).text;
        case ts.SyntaxKind.PropertyAccessExpression:
            return parsePropAccess(expr as ts.PropertyAccessExpression);
        case ts.SyntaxKind.NullKeyword:
            return 'null';
        case ts.SyntaxKind.NumericLiteral:
            return (expr as ts.NumericLiteral).text;
        case ts.SyntaxKind.TypeReference:
            return parseExpression((expr as ts.TypeReferenceNode).typeName);
        case ts.SyntaxKind.ObjectLiteralExpression:
            return 'object';
        case ts.SyntaxKind.CallExpression:
            return parseCallExpr(expr as ts.CallExpression)
        case ts.SyntaxKind.StringKeyword:
            return 'string';
        case ts.SyntaxKind.BooleanKeyword:
            return 'bool';
        case ts.SyntaxKind.NumberKeyword:
            return 'int';
        default:
            throw new Error(`Unsupported expression type: ${ts.SyntaxKind[expr.kind]} 
        Please refer to documentation for supported types.`);
    }
}

function parseCallExpr(expr: ts.CallExpression) {
    if (expr.expression.getText() === 'count') {
        return `count(${expr.arguments[0].getText().replace('SArray.', 'array::')})`
    }

    return '';
}

function parseBinaryExpression(expr: ts.BinaryExpression): string {
    const left = parseExpressionInternal(expr.left);
    const right = parseExpressionInternal(expr.right);

    //Parse left and right sides of the expression and return the result.

    const sanitizedOperator = expr.operatorToken.getText()
        .replaceAll('===', '==')
        .replaceAll('!==', '!=');

    return `${left} ${sanitizedOperator} ${right}`;
}

function parseUnionType(expr: ts.UnionTypeNode): string {
    return `$value IN [${expr.types.map(lt => {
        return `'${parseExpressionInternal(tsquery(lt, 'LiteralType > StringLiteral')[0])}'`;
    }).join(',')}]`;
}

function parseParentesizedExpression(expr: ts.ParenthesizedExpression): string {
    //Recursively parse the inner-expression.
    return `(${parseExpressionInternal(expr.expression)})`;
}

function parseIdentifier(ident: ts.Identifier): string {
    try {
        const sym = checker?.getSymbolAtLocation(ident);
    
        let decl: ts.Declaration | null;
        
        if (!sym) {
            throw new Error();
        }

        //Check if the symbol is aliased,
        //if it is, we need to resolve the aliased symbol to get the actual declaration.
        if (sym.flags & ts.SymbolFlags.Alias) {
            const aliasedSym = checker?.getAliasedSymbol(sym);

            //@ts-ignore
            decl = aliasedSym ? aliasedSym.getDeclarations()[0] : null;
        }
        else {
            //@ts-ignore
            decl = sym?.getDeclarations()[0];
        }


        //Whether or not this declaration inherits from ISurrealScope.
        const isScope = decl ? tsquery(decl, 'TypeReference > Identifier[name="ISurrealScope"]').length > 0 : null;

        if(isScope && decl) {
            const scopeName = tsquery(decl, 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="name"]) > StringLiteral');

            //Return the interpreted scopeName.
            //TODO: investigate if scopeName has an implicit value as well.
            return `$scope == '${(scopeName[0] as ts.StringLiteral).text}'`;
        }
        //If it is not a scope, it must be a type declaration since the symbol actually resolved to something here.
        else if (decl && decl.kind === ts.SyntaxKind.ClassDeclaration) {
            const classDecl = decl as ts.ClassDeclaration;

            const implicitClassName = toSnakeCase(classDecl?.name?.getText() ?? '');

            const explicitClassName = tsquery(decl, 'Decorator > CallExpression > ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="name"]) > StringLiteral')[0] as ts.StringLiteral;
    
            const className = explicitClassName?.text || implicitClassName;

            return `record(${className})`;
        }   

        let classDec = sym.getDeclarations()[0].parent;
        let iterations = 0;

        while (iterations < 11 && classDec?.kind !== ts.SyntaxKind.ClassDeclaration) {
            iterations++;
            classDec = classDec?.parent;
        }

        const indexedSym = tsquery(classDec, `PropertyDeclaration > Identifier[name="${ident.text}"]`)[0];

        if (indexedSym) {
            const propDec = indexedSym.parent;
            
            const decName = tsquery(propDec, 'Decorator > CallExpression > ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="name"]) > StringLiteral')[0];

            return (decName as ts.StringLiteral).text;
        }

        return ident.text;
    }
    catch (ex) {
        //If the symbol cannot be located, its likely to just be an inline reference. Return it directly.

        return ident.text;
    }

}

function parsePropAccess(pa: ts.PropertyAccessExpression): string {
    //Transparently pass the property access through since it is already in terms of the applicable types.
    return pa.getText();
}