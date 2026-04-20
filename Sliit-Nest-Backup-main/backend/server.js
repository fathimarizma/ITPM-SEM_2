require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/utils/errorHandler');
const listingRoutes = require('./src/routes/listingRoutes');
const authRoutes = require('./src/routes/authRoutes');
const roommateRoutes = require('./src/routes/roommateRoutes');
const connectionRoutes = require('./src/routes/connectionRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const boardingsRoute = require('./src/routes/boardingsRoute');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); // logging

// Serve uploaded photos as static assets
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/listings', listingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roommates', roommateRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/boardings', boardingsRoute);

// Generic Root
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
