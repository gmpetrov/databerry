import Stripe from 'stripe';

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2022-11-15',
// });

export const stripe = new Stripe('sk_test_51NF6J3KolXEHwg6BJ2oJakcoPaNn1urc1aCAUskhsqemKUA1WPFYgjEZUn1aJxxVsoRwLQi9rj7NdYxNvprlWhiz00px5y1Sz5', { apiVersion: '2022-11-15', });
