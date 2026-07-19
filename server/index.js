import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB(process.env.MONGODB_URI);
    }
    app.listen(PORT, () => {
      console.log(`VIRASAT server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
