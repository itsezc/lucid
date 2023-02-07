export class SMath {
	public static E = 'math::E';
	public static FRAC_1_PI = 'math::FRAC_1_PI';
	public static FRAC_1_SQRT_2 = 'math::FRAC_1_SQRT_2';
	public static FRAC_2_PI = 'math::FRAC_2_PI';
	public static FRAC_2_SQRT_PI = 'math::FRAC_2_SQRT_PI';
	public static FRAC_PI_2 = 'math::FRAC_PI_2';
	public static FRAC_PI_3 = 'math::FRAC_PI_3';
	public static FRAC_PI_4 = 'math::FRAC_PI_4';
	public static FRAC_PI_6 = 'math::FRAC_PI_6';
	public static FRAC_PI_8 = 'math::FRAC_PI_8';
	public static LN_2 = 'math::LN_2';
	public static LN_10 = 'math::LN_10';
	public static LOG2_E = 'math::LOG2_E';
	public static LOG10_2 = 'math::LOG10_2';
	public static LOG10_E = 'math::LOG10_E';
	public static LOG2_10 = 'math::LOG2_10';
	public static PI = 'math::PI';
	public static SQRT_2 = 'math::SQRT_2';
	public static TAU = 'math::TAU';

	public static abs(number: number) {
		return `math::abs(${number})`;
	}

	public static ceil(number: number) {
		return `math::ceil(${number})`;
	}

	public static fixed(number1: number, number2: number) {
		return `math::fixed(${number1}, ${number2})`;
	}

	public static floor(number: number) {
		return `math::flor(${number})`;
	}

	public static max(numbers: number[]) {
		return `math::max(${numbers})`;
	}

	public static mean(numbers: number[]) {
		return `math::mean(${numbers})`;
	}

	public static median(numbers: number[]) {
		return `math::median(${numbers})`;
	}

	public static min(numbers: number[]) {
		return `math::min(${numbers})`;
	}

	public static product(numbers: number[]) {
		return `math::product(${numbers})`;
	}

	public static round(number: number) {
		return `math::round(${number})`;
	}

	public static sqrt(number: number) {
		return `math::sqrt(${number})`;
	}

	public static sum(numbers: number[]) {
		return `math::sum(${numbers})`;
	}
}
