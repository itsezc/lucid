import * as ts from 'typescript';
import { toSnakeCase, escapeString } from './util';
import { tsquery } from '@phenomnomnominal/tsquery';
import { parseExpression } from './expression';

export function parseField(field: ts.PropertyDeclaration | ts.PropertySignature, tableName: string, rootName = '', subscriptName = ''): string {
    const implicitName = toSnakeCase(field.name.getText());
    const explicitName = tsquery(field, 'Decorator:has(Identifier[name="Field"]) > CallExpression > ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="name"]) > StringLiteral')[0]?.getText();

    //ORs the implicit name with the explicit name provided.
    const name =  escapeString(explicitName) || implicitName;
    let type = getFieldType(field)
        .toLowerCase()
        .replaceAll('boolean', 'bool')
        .replaceAll('number', 'int');

    //TODO: fortify this to respect type constraint.
    const required = (field as ts.PropertyDeclaration).exclamationToken;
    const optional = field.questionToken;

    //The assertion implicitly made in a union type.
    let unionAssertion;

    if (type == 'union') {
        type = 'string';
        unionAssertion = "\n\t ASSERT " + parseExpression(field.type ?? null) + ';';
    }

    let fieldSchema = `\nDEFINE FIELD ${subscriptName}${name} ON ${tableName}${rootName} TYPE ${type}`;
    fieldSchema += parseFieldDecorator(tsquery(field, 'Decorator:has(Identifier[name="Field"])')[0]);
    
    if (type == 'object') {
        //We must recursively parse the contents of this object into their own schemas.
        //return fieldSchema + '' + tsquery(field, 'TypeLiteral > PropertySignature').map((prop) => parseField(prop as ts.PropertySignature, tableName, name + '.'));
        const props = tsquery(field, 'TypeLiteral > PropertySignature');

        props.forEach(prop => {
            fieldSchema += parseField(prop as ts.PropertySignature, tableName, `.${name}`);
        });
    }

    if (type == 'array') {
        //The array type must also be recursively parsed, but very carefully.
        const arr = tsquery(field, 'ArrayType')[0] as ts.ArrayTypeNode;

        if (arr.elementType.kind == ts.SyntaxKind.TypeReference) {
            //Constrain array children to this type.
            const refType = parseExpression(arr.elementType);

            fieldSchema += `\nDEFINE FIELD ${name}.* ON ${tableName}${rootName} TYPE ${refType};`;
        }
        else if (arr.elementType.kind == ts.SyntaxKind.TypeLiteral) {
            //A anonymous object is being used as the array type.

            //We must insert an additional schema for the array object itself.
            fieldSchema += `\nDEFINE FIELD ${name}.*${rootName ? '.' + rootName : ''} ON ${tableName} TYPE object;`;

            const props = tsquery(arr.elementType, 'TypeLiteral > PropertySignature');
            props.forEach(prop => {
                fieldSchema += parseField(prop as ts.PropertySignature, tableName, '', name + '.*.');
            });
        }
        else {
            throw new Error(`Unsupported array type: ${arr.elementType.getText()}`);
        }
    }

    //Append the union assert.
    fieldSchema += unionAssertion ?? '';

    //Append a semicolon where neccessary.
    if (!unionAssertion && !fieldSchema.endsWith(';')) {
        fieldSchema += ';';
    }
    return fieldSchema;
}


function getFieldType(field: ts.PropertyDeclaration | ts.PropertySignature): string {
    switch(field.type?.kind) {
        case ts.SyntaxKind.StringKeyword:
            return 'string';
        case ts.SyntaxKind.NumberKeyword:
            return 'number';
        case ts.SyntaxKind.BooleanKeyword:
            return 'boolean';
        case ts.SyntaxKind.ArrayType:
            return 'array';
        case ts.SyntaxKind.TypeReference:
            return parseExpression(field.type);
        case ts.SyntaxKind.TypeLiteral:
            return 'object';
        case ts.SyntaxKind.UnionType:
            return 'union';
        default:
            throw new Error(`Unknown field type: ${field.type?.getText()}`);
    }
}

function parseFieldDecorator(decorator?: ts.Node): string {
    if (decorator) {
        const perms = tsquery(decorator, 'CallExpression > ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="permissions"]) > ArrowFunction > ParenthesizedExpression > ObjectLiteralExpression')[0];

        let decoratorSchema = '';

        if (perms) {
            tsquery(perms, 'PropertyAssignment').forEach((untypedProp) => {
                const prop = untypedProp as ts.PropertyAssignment;

                const parsedExpr = parseExpression(prop.initializer);

                if(decoratorSchema == '') {
                    decoratorSchema += '\n\tPERMISSIONS';
                }
        
                decoratorSchema += `\n\t\tFOR ${prop.name.getText().toUpperCase()} ${parsedExpr.includes('FULL') || parsedExpr.includes('NONE') ? parsedExpr: `WHERE ${parsedExpr}`},`;
            });
        }

        //Remove trailing comma from string generated (it is replaced w/ a semicolon).
        return decoratorSchema.slice(0, -1);
    }

    return '';
}