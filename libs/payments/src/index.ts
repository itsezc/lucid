import { sync } from './stripe';

export type TPricingProps = {
	providers: {
		stripe?: {
			apiKey: string;
		};
	};
	plans: {
		name: string;
		description?: string;
		recurring?: {
			interval: 'day' | 'week' | 'month' | 'year';
			usage_type: 'licensed' | 'metered';
		};
		mode?: 'graduated' | 'volume';
		features: {
			[key: `feature:${string}`]: TPricingPlanFeature;
		};
	}[];
};

export type TPricingPlanFeatureCurrency = TPricingPlanFeatureTier & {
	currency: string;
	tiers?: TPricingPlanFeatureTier[];
};

type TPricingPlanFeatureTier = {
	upto?: number;
	base?: number;
	price?: number;
};

type TPricingPlanFeature = {
	aggregate?: 'graduated' | 'perpetual';
	currencies: TPricingPlanFeatureCurrency[];
};

/**
 *	@param {TPricingProps} props
 */
export function pricing(props: TPricingProps) {
	sync(props);
}
