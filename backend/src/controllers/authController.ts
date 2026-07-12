import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, User } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'foodexpress_super_secret_key_123';

// Helper to generate JWT
const generateToken = (user: User) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields (name, email, phone, password) are required.' });
    }

    const users = await db.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    if (users.find(u => u.phone === phone)) {
      return res.status(400).json({ error: 'Mobile number already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: `user-${uuidv4().substring(0, 8)}`,
      name,
      email,
      phone,
      passwordHash,
      addresses: address ? [{ id: `addr-${uuidv4().substring(0, 8)}`, title: 'Home', addressLine: address }] : [],
      paymentMethods: [],
      favorites: { restaurants: [], dishes: [] },
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    await db.addUser(newUser);

    const token = generateToken(newUser);
    res.status(211).json({
      message: 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        addresses: newUser.addresses,
        role: newUser.role,
        favorites: newUser.favorites
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role,
        favorites: user.favorites
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Simulated OTP Storage (phone -> otp)
const otpStore: { [phone: string]: string } = {};

export const requestOTP = (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  // Generate a random 6 digit OTP (e.g. 123456)
  const otp = '123456'; // Constant mock OTP for easy testing
  otpStore[phone] = otp;

  console.log(`[OTP Mock] Sent OTP ${otp} to phone number ${phone}`);
  res.json({ message: 'OTP sent successfully! (Use default: 123456 for testing)' });
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required.' });
  }

  const savedOtp = otpStore[phone];
  if (savedOtp && savedOtp === otp) {
    delete otpStore[phone];

    // Find or create user
    const users = await db.getUsers();
    let user = users.find(u => u.phone === phone);

    if (!user) {
      // Create user automatically
      user = {
        id: `user-${uuidv4().substring(0, 8)}`,
        name: `User ${phone.substring(phone.length - 4)}`,
        email: `${phone.replace('+', '')}@foodexpress.mock`,
        phone,
        passwordHash: '', // no password for OTP signups initially
        addresses: [],
        paymentMethods: [],
        favorites: { restaurants: [], dishes: [] },
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      await db.addUser(user);
    }

    const token = generateToken(user);
    return res.json({
      message: 'OTP verification successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role,
        favorites: user.favorites
      }
    });
  }

  res.status(400).json({ error: 'Invalid or expired OTP.' });
};

// Get current user details from JWT token
export const getCurrentUser = async (req: any, res: Response) => {
  const users = await db.getUsers();
  const user = users.find(u => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    addresses: user.addresses,
    role: user.role,
    favorites: user.favorites
  });
};
