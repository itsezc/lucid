use convert_case::{Case::Snake, Casing};
use std::collections::HashMap;

use swc_ecma_visit::Visit;

struct NameVisitor {
	name_map: HashMap<String, String>,
}

impl Visit for NameVisitor {
	fn visit_block_stmt(&mut self, n: &swc_ecma_ast::BlockStmt) {
		swc_ecma_visit::visit_block_stmt(self, n)
	}

	fn visit_block_stmt_or_expr(&mut self, n: &swc_ecma_ast::BlockStmtOrExpr) {
		swc_ecma_visit::visit_block_stmt_or_expr(self, n)
	}

	fn visit_class(&mut self, n: &swc_ecma_ast::Class) {
		swc_ecma_visit::visit_class(self, n)
	}

	fn visit_class_decl(&mut self, n: &swc_ecma_ast::ClassDecl) {
		let name = n.ident.sym.to_string();

		self.name_map.insert(name.clone(), name.to_case(Snake));

		for dec in n.class.decorators.iter() {
			if let Some(expr) = dec.expr.as_call() {
				if expr.args.len() == 1 {
					//There is a decent chance this is a table decorator, but let's verify.
				}
			}
		}
	}

	fn visit_cond_expr(&mut self, n: &swc_ecma_ast::CondExpr) {
		swc_ecma_visit::visit_cond_expr(self, n)
	}

	fn visit_constructor(&mut self, n: &swc_ecma_ast::Constructor) {
		swc_ecma_visit::visit_constructor(self, n)
	}

	fn visit_decl(&mut self, n: &swc_ecma_ast::Decl) {
		swc_ecma_visit::visit_decl(self, n)
	}

	fn visit_empty_stmt(&mut self, n: &swc_ecma_ast::EmptyStmt) {
		swc_ecma_visit::visit_empty_stmt(self, n)
	}

	fn visit_expr(&mut self, n: &swc_ecma_ast::Expr) {
		swc_ecma_visit::visit_expr(self, n)
	}

	fn visit_expr_or_spread(&mut self, n: &swc_ecma_ast::ExprOrSpread) {
		swc_ecma_visit::visit_expr_or_spread(self, n)
	}

	fn visit_expr_or_spreads(&mut self, n: &[swc_ecma_ast::ExprOrSpread]) {
		swc_ecma_visit::visit_expr_or_spreads(self, n)
	}

	fn visit_expr_stmt(&mut self, n: &swc_ecma_ast::ExprStmt) {
		swc_ecma_visit::visit_expr_stmt(self, n)
	}

	fn visit_exprs(&mut self, n: &[Box<swc_ecma_ast::Expr>]) {
		swc_ecma_visit::visit_exprs(self, n)
	}

	fn visit_fn_decl(&mut self, n: &swc_ecma_ast::FnDecl) {
		swc_ecma_visit::visit_fn_decl(self, n)
	}

	fn visit_fn_expr(&mut self, n: &swc_ecma_ast::FnExpr) {
		swc_ecma_visit::visit_fn_expr(self, n)
	}

	fn visit_for_in_stmt(&mut self, n: &swc_ecma_ast::ForInStmt) {
		swc_ecma_visit::visit_for_in_stmt(self, n)
	}

	fn visit_for_of_stmt(&mut self, n: &swc_ecma_ast::ForOfStmt) {
		swc_ecma_visit::visit_for_of_stmt(self, n)
	}

	fn visit_for_stmt(&mut self, n: &swc_ecma_ast::ForStmt) {
		swc_ecma_visit::visit_for_stmt(self, n)
	}

	fn visit_function(&mut self, n: &swc_ecma_ast::Function) {
		swc_ecma_visit::visit_function(self, n)
	}

	fn visit_getter_prop(&mut self, n: &swc_ecma_ast::GetterProp) {
		swc_ecma_visit::visit_getter_prop(self, n)
	}

	fn visit_ident(&mut self, n: &swc_ecma_ast::Ident) {
		swc_ecma_visit::visit_ident(self, n)
	}

	fn visit_if_stmt(&mut self, n: &swc_ecma_ast::IfStmt) {
		swc_ecma_visit::visit_if_stmt(self, n)
	}

	fn visit_import(&mut self, n: &swc_ecma_ast::Import) {
		swc_ecma_visit::visit_import(self, n)
	}

	fn visit_import_decl(&mut self, n: &swc_ecma_ast::ImportDecl) {
		swc_ecma_visit::visit_import_decl(self, n)
	}

	fn visit_module(&mut self, n: &swc_ecma_ast::Module) {
		swc_ecma_visit::visit_module(self, n)
	}

	fn visit_module_decl(&mut self, n: &swc_ecma_ast::ModuleDecl) {
		swc_ecma_visit::visit_module_decl(self, n)
	}

	fn visit_module_item(&mut self, n: &swc_ecma_ast::ModuleItem) {
		swc_ecma_visit::visit_module_item(self, n)
	}

	fn visit_module_items(&mut self, n: &[swc_ecma_ast::ModuleItem]) {
		swc_ecma_visit::visit_module_items(self, n)
	}

	fn visit_new_expr(&mut self, n: &swc_ecma_ast::NewExpr) {
		swc_ecma_visit::visit_new_expr(self, n)
	}

	fn visit_null(&mut self, n: &swc_ecma_ast::Null) {
		swc_ecma_visit::visit_null(self, n)
	}

	fn visit_number(&mut self, n: &swc_ecma_ast::Number) {
		swc_ecma_visit::visit_number(self, n)
	}

	fn visit_object_lit(&mut self, n: &swc_ecma_ast::ObjectLit) {
		swc_ecma_visit::visit_object_lit(self, n)
	}

	fn visit_object_pat(&mut self, n: &swc_ecma_ast::ObjectPat) {
		swc_ecma_visit::visit_object_pat(self, n)
	}

	fn visit_opt_block_stmt(&mut self, n: Option<&swc_ecma_ast::BlockStmt>) {
		swc_ecma_visit::visit_opt_block_stmt(self, n)
	}

	fn visit_opt_call(&mut self, n: &swc_ecma_ast::OptCall) {
		swc_ecma_visit::visit_opt_call(self, n)
	}

	fn visit_opt_expr(&mut self, n: Option<&Box<swc_ecma_ast::Expr>>) {
		swc_ecma_visit::visit_opt_expr(self, n)
	}

	fn visit_opt_expr_or_spread(&mut self, n: Option<&swc_ecma_ast::ExprOrSpread>) {
		swc_ecma_visit::visit_opt_expr_or_spread(self, n)
	}

	fn visit_opt_expr_or_spreads(&mut self, n: Option<&[swc_ecma_ast::ExprOrSpread]>) {
		swc_ecma_visit::visit_opt_expr_or_spreads(self, n)
	}

	fn visit_opt_ident(&mut self, n: Option<&swc_ecma_ast::Ident>) {
		swc_ecma_visit::visit_opt_ident(self, n)
	}

	fn visit_opt_module_items(&mut self, n: Option<&[swc_ecma_ast::ModuleItem]>) {
		swc_ecma_visit::visit_opt_module_items(self, n)
	}

	fn visit_opt_object_lit(&mut self, n: Option<&Box<swc_ecma_ast::ObjectLit>>) {
		swc_ecma_visit::visit_opt_object_lit(self, n)
	}

	fn visit_opt_pat(&mut self, n: Option<&swc_ecma_ast::Pat>) {
		swc_ecma_visit::visit_opt_pat(self, n)
	}

	fn visit_opt_span(&mut self, n: Option<&swc_common::Span>) {
		swc_ecma_visit::visit_opt_span(self, n)
	}

	fn visit_opt_stmt(&mut self, n: Option<&Box<swc_ecma_ast::Stmt>>) {
		swc_ecma_visit::visit_opt_stmt(self, n)
	}

	fn visit_opt_str(&mut self, n: Option<&Box<swc_ecma_ast::Str>>) {
		swc_ecma_visit::visit_opt_str(self, n)
	}

	fn visit_opt_true_plus_minus(&mut self, n: Option<&swc_ecma_ast::TruePlusMinus>) {
		swc_ecma_visit::visit_opt_true_plus_minus(self, n)
	}

	fn visit_opt_ts_entity_name(&mut self, n: Option<&swc_ecma_ast::TsEntityName>) {
		swc_ecma_visit::visit_opt_ts_entity_name(self, n)
	}

	fn visit_opt_ts_namespace_body(&mut self, n: Option<&swc_ecma_ast::TsNamespaceBody>) {
		swc_ecma_visit::visit_opt_ts_namespace_body(self, n)
	}

	fn visit_opt_ts_type(&mut self, n: Option<&Box<swc_ecma_ast::TsType>>) {
		swc_ecma_visit::visit_opt_ts_type(self, n)
	}

	fn visit_opt_ts_type_ann(&mut self, n: Option<&Box<swc_ecma_ast::TsTypeAnn>>) {
		swc_ecma_visit::visit_opt_ts_type_ann(self, n)
	}

	fn visit_opt_ts_type_param_decl(&mut self, n: Option<&Box<swc_ecma_ast::TsTypeParamDecl>>) {
		swc_ecma_visit::visit_opt_ts_type_param_decl(self, n)
	}

	fn visit_opt_ts_type_param_instantiation(
		&mut self,
		n: Option<&Box<swc_ecma_ast::TsTypeParamInstantiation>>,
	) {
		swc_ecma_visit::visit_opt_ts_type_param_instantiation(self, n)
	}

	fn visit_opt_var_decl_or_expr(&mut self, n: Option<&swc_ecma_ast::VarDeclOrExpr>) {
		swc_ecma_visit::visit_opt_var_decl_or_expr(self, n)
	}

	fn visit_opt_vec_expr_or_spreads(&mut self, n: &[Option<swc_ecma_ast::ExprOrSpread>]) {
		swc_ecma_visit::visit_opt_vec_expr_or_spreads(self, n)
	}

	fn visit_opt_vec_pats(&mut self, n: &[Option<swc_ecma_ast::Pat>]) {
		swc_ecma_visit::visit_opt_vec_pats(self, n)
	}

	fn visit_param(&mut self, n: &swc_ecma_ast::Param) {
		swc_ecma_visit::visit_param(self, n)
	}

	fn visit_param_or_ts_param_prop(&mut self, n: &swc_ecma_ast::ParamOrTsParamProp) {
		swc_ecma_visit::visit_param_or_ts_param_prop(self, n)
	}

	fn visit_param_or_ts_param_props(&mut self, n: &[swc_ecma_ast::ParamOrTsParamProp]) {
		swc_ecma_visit::visit_param_or_ts_param_props(self, n)
	}

	fn visit_params(&mut self, n: &[swc_ecma_ast::Param]) {
		swc_ecma_visit::visit_params(self, n)
	}

	fn visit_paren_expr(&mut self, n: &swc_ecma_ast::ParenExpr) {
		swc_ecma_visit::visit_paren_expr(self, n)
	}

	fn visit_pat(&mut self, n: &swc_ecma_ast::Pat) {
		swc_ecma_visit::visit_pat(self, n)
	}

	fn visit_pat_or_expr(&mut self, n: &swc_ecma_ast::PatOrExpr) {
		swc_ecma_visit::visit_pat_or_expr(self, n)
	}

	fn visit_pats(&mut self, n: &[swc_ecma_ast::Pat]) {
		swc_ecma_visit::visit_pats(self, n)
	}

	fn visit_private_method(&mut self, n: &swc_ecma_ast::PrivateMethod) {
		swc_ecma_visit::visit_private_method(self, n)
	}

	fn visit_private_name(&mut self, n: &swc_ecma_ast::PrivateName) {
		swc_ecma_visit::visit_private_name(self, n)
	}

	fn visit_private_prop(&mut self, n: &swc_ecma_ast::PrivateProp) {
		swc_ecma_visit::visit_private_prop(self, n)
	}

	fn visit_program(&mut self, n: &swc_ecma_ast::Program) {
		swc_ecma_visit::visit_program(self, n)
	}

	fn visit_prop(&mut self, n: &swc_ecma_ast::Prop) {
		swc_ecma_visit::visit_prop(self, n)
	}

	fn visit_prop_name(&mut self, n: &swc_ecma_ast::PropName) {
		swc_ecma_visit::visit_prop_name(self, n)
	}

	fn visit_regex(&mut self, n: &swc_ecma_ast::Regex) {
		swc_ecma_visit::visit_regex(self, n)
	}

	fn visit_reserved_unused(&mut self, n: &swc_ecma_ast::ReservedUnused) {
		swc_ecma_visit::visit_reserved_unused(self, n)
	}

	fn visit_rest_pat(&mut self, n: &swc_ecma_ast::RestPat) {
		swc_ecma_visit::visit_rest_pat(self, n)
	}

	fn visit_return_stmt(&mut self, n: &swc_ecma_ast::ReturnStmt) {
		swc_ecma_visit::visit_return_stmt(self, n)
	}

	fn visit_script(&mut self, n: &swc_ecma_ast::Script) {
		swc_ecma_visit::visit_script(self, n)
	}

	fn visit_span(&mut self, n: &swc_common::Span) {
		swc_ecma_visit::visit_span(self, n)
	}

	fn visit_spread_element(&mut self, n: &swc_ecma_ast::SpreadElement) {
		swc_ecma_visit::visit_spread_element(self, n)
	}

	fn visit_stmt(&mut self, n: &swc_ecma_ast::Stmt) {
		swc_ecma_visit::visit_stmt(self, n)
	}

	fn visit_stmts(&mut self, n: &[swc_ecma_ast::Stmt]) {
		swc_ecma_visit::visit_stmts(self, n)
	}

	fn visit_str(&mut self, n: &swc_ecma_ast::Str) {
		swc_ecma_visit::visit_str(self, n)
	}

	fn visit_ts_array_type(&mut self, n: &swc_ecma_ast::TsArrayType) {
		swc_ecma_visit::visit_ts_array_type(self, n)
	}

	fn visit_ts_as_expr(&mut self, n: &swc_ecma_ast::TsAsExpr) {
		swc_ecma_visit::visit_ts_as_expr(self, n)
	}

	fn visit_ts_call_signature_decl(&mut self, n: &swc_ecma_ast::TsCallSignatureDecl) {
		swc_ecma_visit::visit_ts_call_signature_decl(self, n)
	}

	fn visit_ts_conditional_type(&mut self, n: &swc_ecma_ast::TsConditionalType) {
		swc_ecma_visit::visit_ts_conditional_type(self, n)
	}

	fn visit_ts_const_assertion(&mut self, n: &swc_ecma_ast::TsConstAssertion) {
		swc_ecma_visit::visit_ts_const_assertion(self, n)
	}

	fn visit_ts_entity_name(&mut self, n: &swc_ecma_ast::TsEntityName) {
		swc_ecma_visit::visit_ts_entity_name(self, n)
	}

	fn visit_ts_expr_with_type_args(&mut self, n: &swc_ecma_ast::TsExprWithTypeArgs) {
		swc_ecma_visit::visit_ts_expr_with_type_args(self, n)
	}

	fn visit_ts_expr_with_type_args_vec(&mut self, n: &[swc_ecma_ast::TsExprWithTypeArgs]) {
		swc_ecma_visit::visit_ts_expr_with_type_args_vec(self, n)
	}

	fn visit_ts_external_module_ref(&mut self, n: &swc_ecma_ast::TsExternalModuleRef) {
		swc_ecma_visit::visit_ts_external_module_ref(self, n)
	}

	fn visit_ts_fn_or_constructor_type(&mut self, n: &swc_ecma_ast::TsFnOrConstructorType) {
		swc_ecma_visit::visit_ts_fn_or_constructor_type(self, n)
	}

	fn visit_ts_fn_param(&mut self, n: &swc_ecma_ast::TsFnParam) {
		swc_ecma_visit::visit_ts_fn_param(self, n)
	}

	fn visit_ts_fn_params(&mut self, n: &[swc_ecma_ast::TsFnParam]) {
		swc_ecma_visit::visit_ts_fn_params(self, n)
	}

	fn visit_ts_fn_type(&mut self, n: &swc_ecma_ast::TsFnType) {
		swc_ecma_visit::visit_ts_fn_type(self, n)
	}

	fn visit_ts_getter_signature(&mut self, n: &swc_ecma_ast::TsGetterSignature) {
		swc_ecma_visit::visit_ts_getter_signature(self, n)
	}

	fn visit_ts_import_type(&mut self, n: &swc_ecma_ast::TsImportType) {
		swc_ecma_visit::visit_ts_import_type(self, n)
	}

	fn visit_ts_infer_type(&mut self, n: &swc_ecma_ast::TsInferType) {
		swc_ecma_visit::visit_ts_infer_type(self, n)
	}

	fn visit_ts_instantiation(&mut self, n: &swc_ecma_ast::TsInstantiation) {
		swc_ecma_visit::visit_ts_instantiation(self, n)
	}

	fn visit_ts_interface_body(&mut self, n: &swc_ecma_ast::TsInterfaceBody) {
		swc_ecma_visit::visit_ts_interface_body(self, n)
	}

	fn visit_ts_interface_decl(&mut self, n: &swc_ecma_ast::TsInterfaceDecl) {
		swc_ecma_visit::visit_ts_interface_decl(self, n)
	}

	fn visit_ts_keyword_type(&mut self, n: &swc_ecma_ast::TsKeywordType) {
		swc_ecma_visit::visit_ts_keyword_type(self, n)
	}

	fn visit_ts_keyword_type_kind(&mut self, n: &swc_ecma_ast::TsKeywordTypeKind) {
		swc_ecma_visit::visit_ts_keyword_type_kind(self, n)
	}

	fn visit_ts_mapped_type(&mut self, n: &swc_ecma_ast::TsMappedType) {
		swc_ecma_visit::visit_ts_mapped_type(self, n)
	}

	fn visit_ts_method_signature(&mut self, n: &swc_ecma_ast::TsMethodSignature) {
		swc_ecma_visit::visit_ts_method_signature(self, n)
	}

	fn visit_ts_this_type_or_ident(&mut self, n: &swc_ecma_ast::TsThisTypeOrIdent) {
		swc_ecma_visit::visit_ts_this_type_or_ident(self, n)
	}

	fn visit_ts_type(&mut self, n: &swc_ecma_ast::TsType) {
		swc_ecma_visit::visit_ts_type(self, n)
	}

	fn visit_ts_type_operator_op(&mut self, n: &swc_ecma_ast::TsTypeOperatorOp) {
		swc_ecma_visit::visit_ts_type_operator_op(self, n)
	}

	fn visit_ts_type_param(&mut self, n: &swc_ecma_ast::TsTypeParam) {
		swc_ecma_visit::visit_ts_type_param(self, n)
	}

	fn visit_ts_type_param_decl(&mut self, n: &swc_ecma_ast::TsTypeParamDecl) {
		swc_ecma_visit::visit_ts_type_param_decl(self, n)
	}

	fn visit_ts_type_param_instantiation(&mut self, n: &swc_ecma_ast::TsTypeParamInstantiation) {
		swc_ecma_visit::visit_ts_type_param_instantiation(self, n)
	}

	fn visit_ts_type_params(&mut self, n: &[swc_ecma_ast::TsTypeParam]) {
		swc_ecma_visit::visit_ts_type_params(self, n)
	}

	fn visit_ts_type_query(&mut self, n: &swc_ecma_ast::TsTypeQuery) {
		swc_ecma_visit::visit_ts_type_query(self, n)
	}

	fn visit_ts_type_query_expr(&mut self, n: &swc_ecma_ast::TsTypeQueryExpr) {
		swc_ecma_visit::visit_ts_type_query_expr(self, n)
	}

	fn visit_ts_type_ref(&mut self, n: &swc_ecma_ast::TsTypeRef) {
		swc_ecma_visit::visit_ts_type_ref(self, n)
	}

	fn visit_ts_types(&mut self, n: &[Box<swc_ecma_ast::TsType>]) {
		swc_ecma_visit::visit_ts_types(self, n)
	}
}
