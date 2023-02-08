import { pricing } from '@lucid-framework/payments';

pricing({
	providers: {
		stripe: {
			apiKey: process.env.STRIPE_SK,
		},
	},
	plans: [
		{
			name: 'seat',
			description: 'Sass seat',
			recurring: {
				interval: 'month',
				usage_type: 'licensed',
			},
			features: {
				'feature:seat': {
					aggregate: 'perpetual',
					currencies: [
						{
							currency: 'usd',
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
						{
							currency: 'gbp',
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
					],
				},
			},
		},
		{
			name: 'storage',
			recurring: {
				interval: 'month',
				usage_type: 'metered',
			},
			features: {
				'feature:storage': {
					currencies: [
						{
							currency: 'usd',
							base: 10,
						},
					],
				},
			},
		},
	],
});
