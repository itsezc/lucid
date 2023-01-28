type TSurrealAuth = {
	user: string;
	pass: string;
}

export type TRootAuth = TSurrealAuth;

export type TNamespaceAuth = { 
	NS: string 
};

export type TDatabaseAuth = {
	NS: string;
	DB: string;
};

export type TScopeAuth = {
	NS: string;
	DB: string;
	SC: string;
	[key: string]: unknown;
};

export type TTokenAuth = {
	token: string;
};

export type TCredentialDetails =
	| TRootAuth
	| TNamespaceAuth
	| TDatabaseAuth
	| TScopeAuth
	| TTokenAuth;