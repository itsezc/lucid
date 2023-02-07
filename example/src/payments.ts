import { pricing } from '@lucid-framework/payments';

pricing({
	plans: [
		{
			name: 'seat',
			interval: 'monthly',
			features: {
				'feature:seat': {
					aggregrate: 'perpetual',
					tiers: [
						{
							upto: 5,
							base: 0,
						},
						{
							price: 9900,
						},
					],
				},
			},
		},
		{
			name: 'storage',
			interval: 'monthly',
			features: {
				'feature:storage': {
					base: 10,
				},
			},
		},
	],
});
