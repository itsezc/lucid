export type FieldJson = {
	name: string;
	type: {
		type: string;
		isArray: boolean;
		isObject: boolean;
		isPrimitive: boolean;
		isRelational: boolean;
		isEnum: boolean;
		isDate: boolean;
	};
	modifer: string;
	decorators: {
		name: string;
		arguments: {
			index: boolean;
			flexible: boolean;
			name: string;
		}[];
	}[];
};

export type TableJson = {
	[key: string]: {
		name: string;
		isTable: boolean;
		fields: {
			[key: string]: FieldJson;
		};
	};
};
