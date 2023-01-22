import * as ts from 'typescript';
import { parseTable } from './table';
import * as path from 'path';
import { tsquery } from '@phenomnomnominal/tsquery';

export let checker: ts.TypeChecker | null;
export let program: ts.Program | null;

//Generates a full SurrealQL Schema for the project at the specified directory.
function generateSchema(path: string) {
    process.chdir(path);

    const cfgFile = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
    const { config } = ts.readConfigFile(cfgFile, ts.sys.readFile);

    //Do not emit JS into the user's project directory.
    config.compilerOptions.noEmit = true;

    const { options, fileNames, errors } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd());

    program = ts.createProgram(fileNames, options);
    checker = program.getTypeChecker();

    const { diagnostics, emitSkipped } = program.emit()

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(diagnostics, errors)

    //Print any warnings that Typescript has detected.
    if (allDiagnostics.length) {
        const formatHost: ts.FormatDiagnosticsHost = {
            getCanonicalFileName: (path) => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine,
        }
        const message = ts.formatDiagnostics(allDiagnostics, formatHost)
        console.warn('Cannot generate a schema for a project with active Typescript errors!\n  ' + message);
    }


    //The resulting schema in its entirety.
    const resultSchema = program.getSourceFiles().map(sf => parseSourceFile(sf)).filter(n => n != '').join('\n');

    console.log(resultSchema);
}


//Parse a source file in its entirety and returns a SurrealQL Schema as a string.
function parseSourceFile(src: ts.SourceFile): string {
    //Pick out all ClassDeclarations with the 'Table' decorator.
    const tableDeclarations = tsquery(src, 'ClassDeclaration:has(Identifier[name="Table"])');

    //Since every Table results in at least one query, we do not need to filter out empty strings.
    return tableDeclarations.map(td => parseTable(td)).join('\n');
}

//The actual call to generateSchema. This will be abstracted away into either a vite plugin or a file watcher.
generateSchema('../../../../example');
