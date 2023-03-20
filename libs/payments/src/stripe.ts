import Stripe from 'stripe';
import { TPricingProps } from '.';

/**
 * Executed during CI / CD or dev
 */
export async function sync({ providers, plans }: TPricingProps) {
	if (providers.stripe) {
		const stripe = new Stripe(providers.stripe.apiKey, {
			apiVersion: '2022-11-15',
		});

		const mapTiers = {
			up_to: 'up_to',
			base: 'flat_amount',
			price: 'unit_amount',
		} as const;

		plans.map(
			async ({ name, description, mode, recurring, features, ...props }) => {
				Object.entries(features).map(async (feature) => {
					// Create a product on Stripe
					const product = await stripe.products.create({
						name,
						description,
					});

					console.log('Created product', name);

					const currencies = feature[1].currencies;
					const primaryCurrency = currencies[0];

					const currency_options: Record<
						string,
						Stripe.PriceCreateParams.CurrencyOptions
					> = {};

					currencies.map(({ currency, tiers }, currencyIdx) => {
						if (currencyIdx !== 0) {
							currency_options[currency] = {
								tiers: tiers?.map((tier) => ({
									up_to: tier.upto || ('inf' as const),
									flat_amount: tier.base,
									unit_amount: tier.price,
								})),
							};
						}
					});

					const tiered =
						primaryCurrency.tiers && primaryCurrency.tiers.length > 0;

					await stripe.prices.create({
						currency: primaryCurrency.currency,
						product: product.id,
						unit_amount: primaryCurrency.base || primaryCurrency.price,
						billing_scheme: tiered ? 'tiered' : 'per_unit',
						tiers: tiered
							? primaryCurrency.tiers?.map((tier) => ({
									up_to: tier.upto || ('inf' as const),
									flat_amount: tier.base,
									unit_amount: tier.price,
							  }))
							: undefined,
						tiers_mode: tiered ? mode || 'graduated' : undefined,
						recurring,
						currency_options,
					});
				});
			},
		);
	}
}
