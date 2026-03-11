const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route    POST api/payment/create-checkout-session
// @desc     Create a checkout session for subscription
// @access   Private
router.post('/create-checkout-session', auth, [
  body('plan', 'Plan is required').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan } = req.body;
    
    // Define plans
    const plans = {
      premium: {
        price: 999, // $9.99 in cents
        name: 'Premium',
        credits: 100
      },
      pro: {
        price: 2999, // $29.99 in cents
        name: 'Pro',
        credits: 500
      }
    };

    if (!plans[plan]) {
      return res.status(400).json({ msg: 'Invalid plan' });
    }

    const selectedPlan = plans[plan];
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${selectedPlan.name} Plan`,
                description: `${selectedPlan.credits} credits for video processing`
              },
              unit_amount: selectedPlan.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`,
        metadata: {
          userId: req.user.id,
          plan: plan
        }
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/payment/webhook
// @desc     Handle Stripe webhook
// @access   Public
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Update user subscription and credits
    try {
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      
      // Update user based on plan
      let creditsToAdd = 0;
      if (plan === 'premium') {
        creditsToAdd = 100;
      } else if (plan === 'pro') {
        creditsToAdd = 500;
      }
      
      await User.findByIdAndUpdate(userId, {
        $set: { 
          subscription: plan,
          subscriptionDate: new Date()
        },
        $inc: { credits: creditsToAdd }
      });
      
      console.log(`Updated user ${userId} subscription to ${plan}`);
    } catch (err) {
      console.error('Error updating user after payment:', err);
    }
  }

  res.json({ received: true });
});

// @route    POST api/payment/add-credits
// @desc     Add credits to user account
// @access   Private
router.post('/add-credits', auth, [
  body('credits', 'Credits amount is required').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { credits } = req.body;
    const creditCost = credits * 10; // $0.10 per credit

    // Create payment intent for additional credits
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: creditCost * 100, // Convert to cents
        currency: 'usd',
        metadata: {
          userId: req.user.id,
          credits: credits
        }
      });

      res.json({ 
        client_secret: paymentIntent.client_secret,
        credits: credits,
        cost: creditCost
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;