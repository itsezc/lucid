import { test, expect, describe, it } from 'bun:test';
import { Stringify, escapeString, toSnakeCase } from '@/src/util';

test('Stringify generates valid SQL object', () => {
	expect(Stringify({ 'email': 'chiru@example.com', passKey: 'passKey' }))
		.toBe('{ email: "chiru@example.com", passKey: "passKey" }');
});

test('Escape string properly', () => {
	expect(escapeString("'example'")).toBe('example');
});

describe('Snake casing', () => {
	it('Generate from underscore', () => {
		expect(toSnakeCase('_test')).toBe('_test');
	});

	it('Generate from camel case', () => {
		expect(toSnakeCase('snakeCase')).toBe('snake_case');
	});

	it('Generate from pascal case', () => {
		expect(toSnakeCase('PascalCase')).toBe('pascal_case');
	});
});