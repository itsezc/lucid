use std::path::PathBuf;

use clap::Parser;
use swc_common::{sync::Lrc, SourceMap};
use swc_ecma_parser::{lexer::Lexer, Parser as swc_parse, StringInput, Syntax, TsConfig};
use swc_ecma_visit::VisitWith;


mod ident;
mod parser;

#[derive(Parser, Debug)]
struct Args {
	///The directory containing the TS models to be parsed.
	source_dir: PathBuf,
}

fn main() {
	let cli = Args::parse();

	let start_time = std::time::Instant::now();
	let ts_files = collect_ts_files(&cli.source_dir);

	let cm: Lrc<SourceMap> = Default::default();
	let mut modules = vec![];

	for file in &ts_files {
		let fm = cm.load_file(&file).unwrap();
		let lexer = Lexer::new(
			Syntax::Typescript(TsConfig {
				decorators: true,
				..Default::default()
			}),
			Default::default(),
			StringInput::from(&*fm),
			None,
		);
		let mut parser = swc_parse::new_from(lexer);

		if let Ok(module) = parser.parse_module() {
			modules.push(module);
		}
	}

	let tables = modules.iter_mut().map(|mut module| {
        let mut visitor: crate::parser::table::Table = Default::default();

        for module in module.body.iter() {
            module.visit_with(&mut visitor);
        }
    }).collect::<Vec<_>>();

	/*

	let tables = modules
		.iter_mut()
		.map(|mut module| parse_module(&mut module))
		.collect::<Vec<_>>();

	 */

	println!(
		"Parsed {} modules in {:?}",
		modules.len(),
		start_time.elapsed()
	);

	//println!("{:#?}", &ts_files.iter().map(|f| f.as_path().to_str().unwrap()).collect::<Vec<&str>>())
}

//Collects all the ts files in the directory and returns them.
fn collect_ts_files(dir: &PathBuf) -> Vec<PathBuf> {
	let entries = std::fs::read_dir(dir).unwrap();

	let mut ts_files = vec![];

	for entry in entries {
		if let Some(entry) = entry.ok() {
			let path = entry.path();

			if path.is_dir() && path.file_name().unwrap() != "node_modules" {
				ts_files.extend(collect_ts_files(&path));
			} else if path.extension().map_or(false, |ext| ext == "ts") {
				ts_files.push(path);
			}
		}
	}

	ts_files
}
