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
