import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16"
});

export async function chargeUser(): Promise<string> {
  // For demo/test, creates a PaymentIntent with test payment method
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 2900,
    currency: 'usd',
    payment_method_types: ['card'],
    description: 'ViralX: Mint Thread Art NFT + Token',
    // optionally use a test payment method for demo
    payment_method: 'pm_card_visa', // test card
    confirm: true,
  });
  return paymentIntent.id;
}
