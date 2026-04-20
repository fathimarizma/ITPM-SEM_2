require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ role: 'Admin' });
    if (adminExists) {
      console.log('Super Admin already exists! You can log in using:');
      console.log('Email:', adminExists.email);
      process.exit(0);
    }

    await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@sliitnest.com',
      password: 'adminpassword123',
      role: 'Admin',
      isVerified: true,
    });

    console.log('Super Admin account has been securely seeded!');
    console.log('Email: admin@sliitnest.com');
    console.log('Password: adminpassword123');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
