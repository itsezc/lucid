export class Migration {
	public constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly timestamp: number,
	) {}
}
