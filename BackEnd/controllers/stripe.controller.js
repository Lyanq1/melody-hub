import Stripe from 'stripe'
import { env } from '../config/environment.js'

// Ensure Stripe is initialized with a valid secret key
const assertStripeConfigured = () => {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY in environment configuration')
  }
}

export const createCheckoutSession = async (req, res) => {
  try {
    assertStripeConfigured()
    const stripe = new Stripe(env.STRIPE_SECRET_KEY)

    const { amount, currency, description, metadata } = req.body || {}

    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing amount'
      })
    }

    // Default currency to VND if not provided
    const finalCurrency = (currency || 'vnd').toLowerCase()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: finalCurrency,
            product_data: {
              name: description || 'MelodyHub Order'
            },
            unit_amount: Number(amount)
          },
          quantity: 1
        }
      ],
      success_url: `${env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/cart`,
      metadata: metadata && typeof metadata === 'object' ? metadata : undefined
    })

    return res.status(201).json({
      success: true,
      url: session.url,
      id: session.id
    })
  } catch (error) {
    console.error('Stripe createCheckoutSession error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create Stripe Checkout Session',
      error: error.message
    })
  }
}

export const stripeWebhook = async (req, res) => {
  try {
    assertStripeConfigured()
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET in environment configuration')
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY)
    const signature = req.headers['stripe-signature']

    let event

    try {
      // req.body must be the raw buffer. See app.js where we mount the raw parser for this route
      event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('Checkout session completed:', session.id)
        // TODO: fulfill the order, mark paid in DB, send emails, etc.
        break
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('PaymentIntent succeeded:', paymentIntent.id)
        break
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        console.log('PaymentIntent failed:', paymentIntent.id)
        break
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Stripe webhook handler error:', error)
    return res.status(500).json({ error: error.message })
  }
}


