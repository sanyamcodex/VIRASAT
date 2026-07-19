import Razorpay from 'razorpay';

// Only instantiated when keys are present, so the app runs in dev without them.
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('Razorpay not configured — checkout will return 503');
}

export default razorpay;
