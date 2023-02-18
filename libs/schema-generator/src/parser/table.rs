use swc_ecma_visit::Visit;

use crate::parser::{field::Field, perms::Permissions};

#[derive(Default)]
pub struct Table {
	pub qualified_name: String,
	pub fields: Vec<Field>,
    pub permissions: Option<Permissions>,
    pub edge: bool
}


impl Visit for Table {
	
	//Overwrites parent set name with explicit name if it exists.
	fn visit_decorator(&mut self, n: &swc_ecma_ast::Decorator) {
		if let Some(call) = n.expr.as_call() {
			//TODO: fix this garbage.
			if (call.callee.as_expr().unwrap().as_ident().unwrap().sym.to_string() == "Table") {
				for arg in call.args.iter() {
					if let Some(obj) = arg.expr.as_object() {
						//If its an object literal, parse it and try to find the name.
						for prop in obj.props.iter() {
							if let Some(ident) = prop.as_ident() {
								if ident.sym.to_string() == "name" {
									if let Some(lit) = prop.value.as_lit() {
										if let Some(str) = lit.as_str() {
											self.qualified_name = str.value.to_string();
										}
									}
								}
							}
						}
					}
					else {
						panic!("Invalid Table decorator.");
					}
				}
			}
		}
	}

	fn visit_class(&mut self, n: &swc_ecma_ast::Class) {
		swc_ecma_visit::visit_class(self, n)
	}

	fn visit_class_expr(&mut self, n: &swc_ecma_ast::ClassExpr) {
		swc_ecma_visit::visit_class_expr(self, n)
	}

	fn visit_class_members(&mut self, n: &[swc_ecma_ast::ClassMember]) {
		swc_ecma_visit::visit_class_members(self, n)
	}

	fn visit_class_method(&mut self, n: &swc_ecma_ast::ClassMethod) {
		todo!("Futures/Events");
	}

	fn visit_class_prop(&mut self, n: &swc_ecma_ast::ClassProp) {
		swc_ecma_visit::visit_class_prop(self, n)
	}
}
