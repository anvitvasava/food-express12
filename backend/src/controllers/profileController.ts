import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.userId;

    const updatedUser = await db.updateUser(userId, { name, email, phone });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        addresses: updatedUser.addresses,
        role: updatedUser.role,
        favorites: updatedUser.favorites
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addAddress = async (req: any, res: Response) => {
  try {
    const { title, addressLine, instructions } = req.body;
    const userId = req.userId;

    if (!title || !addressLine) {
      return res.status(400).json({ error: 'title and addressLine are required.' });
    }

    const users = await db.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newAddress = {
      id: `addr-${uuidv4().substring(0, 8)}`,
      title,
      addressLine,
      instructions
    };

    const nextAddresses = [...user.addresses, newAddress];
    const updatedUser = await db.updateUser(userId, { addresses: nextAddresses });

    res.json({ message: 'Address added successfully!', addresses: updatedUser?.addresses || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAddress = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const users = await db.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const nextAddresses = user.addresses.filter(addr => addr.id !== id);
    const updatedUser = await db.updateUser(userId, { addresses: nextAddresses });

    res.json({ message: 'Address deleted successfully!', addresses: updatedUser?.addresses || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addPaymentMethod = async (req: any, res: Response) => {
  try {
    const { type, last4, details } = req.body;
    const userId = req.userId;

    if (!type) {
      return res.status(400).json({ error: 'type is required.' });
    }

    const users = await db.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newMethod = {
      id: `pm-${uuidv4().substring(0, 8)}`,
      type,
      last4,
      details
    };

    const nextPayments = [...user.paymentMethods, newMethod];
    const updatedUser = await db.updateUser(userId, { paymentMethods: nextPayments });

    res.json({ message: 'Payment method added successfully!', paymentMethods: updatedUser?.paymentMethods || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
