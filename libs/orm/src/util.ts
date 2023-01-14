export function extrapolateTableName(name: string): string {
	let newName = '';
	for (let i = 0; i < name.length; i++) {
		if (name[i] === name[i].toUpperCase()) {
			if (i === 0) {
				newName += name[i].toLowerCase();
			} else {
				newName += `_${name[i].toLowerCase()}`;
			}
		} else {
			newName += name[i];
		}
	}
	return newName;
}

export function joinFields(arr?: string[][] | number[]) {
	if (arr) {
		if (arr[0] instanceof Array) {
			let res = `['${arr[0].join("', '")}']`;
			for (let i = 1; i < arr.length; i++) {
				res += `..['${(arr[i] as string[]).join("', '")}']`;
			}
			return res;
		} else {
			const seperator = '..';
			let res = '';
			for (let i = arr.length; i--; ) res = (i ? seperator : '') + arr[i] + res;
			return res;
		}
	}
	return '';
}
