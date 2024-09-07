import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto'; // You need to import crypto for signature verification

dotenv.config(); // Access env values

const app = express();
const RAZORPAY_KEY_ID="rzp_test_KMhctEDTUeyrRC"
const RAZORPAY_KEY_SECRET="kCiY9ua7A8FVxMpAQaDVP5BJ"


const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET, // Corrected here, it should be RAZORPAY_KEY_SECRET
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Adjust this to match your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); // Parse JSON bodies

// Test route to check if the server is running
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// API Call for creating the order
app.post('/create-order', async (req, res) => {
    console.log("Create order");
    console.log("body", req.body);

    try {
        const options = {
            amount: req.body.amount * 100, // Amount should be in paisa (multiply by 100 for INR)
            currency: 'INR',
            receipt: 'receipt_' + Math.random().toString(36).substring(7), // Unique and random receipt ID
        };
        const order = await razorpay.orders.create(options);
        console.log("Order created:", order);
        res.status(200).json(order);
    } catch (err) {
        console.error("Error creating order:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// API Call for verifying the payment of the order
app.post('/verify-payment', async (req, res) => {
    console.log("Verify order");

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Create the expected signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        // Verify if the signatures match
        if (razorpay_signature === expectedSign) {
            console.log("Payment verified successfully");
            res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            console.log("Invalid payment signature");
            res.status(400).json({ error: 'Invalid payment signature' });
        }
    } catch (err) {
        console.error("Error verifying payment:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});
