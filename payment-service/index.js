import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 8084;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.post('/payments', (req, res) => {
  const { bookingId, amount } = req.body;
  
  console.log(`[Payment] Processing payment for booking ${bookingId} with amount ${amount}...`);
  
  // Random success/fail logic (80% success)
  const isSuccess = Math.random() > 0.2;
  
  setTimeout(() => {
    if (isSuccess) {
      console.log(`[Payment] Payment successful for booking ${bookingId}`);
      res.json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: `TXN-${uuidv4()}`
      });
    } else {
      console.log(`[Payment] Payment failed for booking ${bookingId}`);
      res.status(400).json({
        success: false,
        message: 'Payment rejected by bank'
      });
    }
  }, 1000); // Simulate network delay
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
