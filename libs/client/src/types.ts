
export interface TRootAuth {
	user: string;
	pass: string;
}

export interface TNamespaceAuth {
	NS: string;
	user: string;
	pass: string;
}

export interface TDatabaseAuth {
	NS: string;
	DB: string;
	user: string;
	pass: string;
}

export interface TScopeAuth {
	NS: string;
	DB: string;
	SC: string;
	[key: string]: unknown;
}

export interface TTokenAuth {
	token: string;
}

export type TCredentialDetails =
	| TRootAuth
	| TNamespaceAuth
	| TDatabaseAuth
	| TScopeAuth
	| TTokenAuth;