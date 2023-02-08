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

					feature[1].currencies?.map(async (pricingCurrency) => {
						const tiered =
							pricingCurrency.tiers && pricingCurrency.tiers.length > 0;

						console.log(
							'Creating product pricing for',
							name,
							pricingCurrency.currency,
						);

						const productPricing = tiered
							? {
									tiers: pricingCurrency.tiers?.map((tier) => ({
										up_to: tier.upto || ('inf' as const),
										flat_amount: tier.base,
										unit_amount: tier.price,
									})),
							  }
							: {};

						// Create pricing for stripe
						await stripe.prices.create({
							currency: pricingCurrency.currency ?? 'usd',
							product: product.id,
							unit_amount: !tiered
								? pricingCurrency.base || pricingCurrency.price
								: undefined,
							billing_scheme: tiered ? 'tiered' : 'per_unit',
							tiers_mode: tiered ? mode || 'graduated' : undefined,
							recurring,
							...productPricing,
						});

						console.log('Created pricing for', name);
					});
				});
			},
		);
	}
}
