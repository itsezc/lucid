import { command, run, number, positional, optional, option, multioption, array, string } from 'cmd-ts';
import { Directory, File } from 'cmd-ts/batteries/fs';
import { Url } from 'cmd-ts/batteries/url';
import { writeFileSync } from 'fs';
import { generateSchema } from '@surreal-tools/schema-generator';

import SurrealRest from '@surreal-tools/client/src/client.rest';

const cmd = command({
    name: 'SQLSG',
    description: 'Generates SurrealQL schemas from typescript source files.',
    version: '0.0.1',
    args: {
        project: positional({ type: Directory, displayName: 'The project to generate a schema for.'}),
        outputFile: option({
            type: File,
            long: 'output',
            short: 'o' ,
            defaultValue: null
        }),
        host: multioption(
            { type: array(string), long: 'host', short: 'h' },   
        )
    },
    handler: (args) => {
        //Go into the directory of this project.
        process.chdir(args.project);

        const generatedOutput = generateSchema();

        if (args.output) {
            writeFileSync(args.output, generatedOutput);
        }

        if (args.url) {
            //The schema needs to be applied to the database as a commit.
            
        }
    }
});

run(cmd, process.argv.slice(2));