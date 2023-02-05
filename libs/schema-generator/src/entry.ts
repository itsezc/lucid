import * as ts from 'typescript';
import { parseTable } from './table';
import { tsquery } from '@phenomnomnominal/tsquery';
import { parseScope } from './scope';

const cfgFile = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');

if (!cfgFile) {
    //Can't read the tsconfig.
    throw new Error('Cannot find tsconfig! tsconfig is required to parse the schema.');
}

const { config } = ts.readConfigFile(cfgFile, ts.sys.readFile);

config.compilerOptions.noEmit = true;

const { options, fileNames, errors } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd());

export let program = ts.createProgram(fileNames, options);
export let checker = program.getTypeChecker();

//Generates a full SurrealQL Schema for the project at the specified directory.
export function generateSchema(): string {
    const { diagnostics } = program.emit()

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(diagnostics, errors);

    //Print any warnings that Typescript has detected.
    if (allDiagnostics.length) {
        const formatHost: ts.FormatDiagnosticsHost = {
            getCanonicalFileName: (path) => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine,
        }
        const message = ts.formatDiagnostics(allDiagnostics, formatHost)
        console.error('Cannot generate a schema for a project with active Typescript errors!\n  ' + message);
        console.warn("Exiting with error.");
        process.exit();
    }

    //The resulting schema in its entirety.
    const resultSchema = program.getSourceFiles().map(sf => parseSourceFile(sf)).filter(n => n !== '').join('\n');

    return resultSchema;
}

//Parse a source file in its entirety and returns a SurrealQL Schema as a string.
function parseSourceFile(src: ts.SourceFile): string {
    //Pick out all ClassDeclarations with the 'Table' decorator.
    const tableDeclarations = tsquery(src, 'ClassDeclaration:has(Identifier[name="Table"])');
    const scopeDeclarations = tsquery(src , 'VariableDeclaration:has(Identifier[name="ISurrealScope"])');

    //Since every Table results in at least one query, we do not need to filter out empty strings.
    return tableDeclarations.map(td => parseTable(td)).join('\n')
    + scopeDeclarations.map(sd => parseScope(sd as ts.VariableDeclaration)).join('\n');
}