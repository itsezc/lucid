export class SDateTime {
	public static day(time: string) {
		return `time::day(${time})`;
	}

	public static floor(time: string, duration: string) {
		return `time::floor(${time}, ${duration})`;
	}

	public static group(
		time: string,
		group: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
	) {
		return `time::group(${time}, ${group})`;
	}

	public static hour(time: string) {
		return `time::hour(${time})`;
	}

	public static mins(time: string) {
		return `time::mins(${time})`;
	}

	public static month(time: string) {
		return `time::month(${time})`;
	}

	public static nano(time: string) {
		return `time::nano(${time})`;
	}

	public static now() {
		return 'time::now()';
	}

	public static round(time: string, duration: string) {
		return `time::round(${time}, ${duration})`;
	}

	public static secs(time: string) {
		return `time::secs(${time})`;
	}

	public static unix(time: string) {
		return `time::unix(${time})`;
	}

	public static wday(time: string) {
		return `time::wday(${time})`;
	}

	public static week(time: string) {
		return `time::week(${time})`;
	}

	public static yday(time: string) {
		return `time::yday(${time})`;
	}

	public static year(time: string) {
		return `time::year(${time})`;
	}
}
