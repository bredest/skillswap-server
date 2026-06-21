const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin123', 10);

    await User.create({
      name: 'Admin',
      email: 'admin@skillswap.com',
      password: hashedPassword,
      image: 'https://ui-avatars.com/api/?name=Admin',
      role: 'admin',
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@skillswap.com');
    console.log('Password: Admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
