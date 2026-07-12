import { Response } from 'express';
import { db } from '../db';

export const getRestaurants = async (req: any, res: Response) => {
  try {
    let list = await db.getRestaurants();
    const { search, category, vegOnly, sortBy } = req.query;

    if (search) {
      const q = search.toString().toLowerCase();
      list = list.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.description.toLowerCase().includes(q) ||
        r.categories.some(c => c.toLowerCase().includes(q))
      );
    }

    if (category) {
      const cat = category.toString().toLowerCase();
      list = list.filter(r => 
        r.categories.some(c => c.toLowerCase() === cat)
      );
    }

    if (vegOnly === 'true') {
      list = list.filter(r => r.menu.some(m => m.isVeg));
    }

    // Sort by rating, deliveryTime, distance, deliveryFee
    if (sortBy) {
      if (sortBy === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'deliveryTime') {
        list.sort((a, b) => a.deliveryTime - b.deliveryTime);
      } else if (sortBy === 'distance') {
        list.sort((a, b) => a.distance - b.distance);
      } else if (sortBy === 'deliveryFee') {
        list.sort((a, b) => a.deliveryFee - b.deliveryFee);
      }
    }

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRestaurantById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const restaurants = await db.getRestaurants();
    const rest = restaurants.find(r => r.id === id);

    if (!rest) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(rest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleFavorite = async (req: any, res: Response) => {
  try {
    const { type, id } = req.body;
    const userId = req.userId;

    if (!type || !id) {
      return res.status(400).json({ error: 'type and id are required' });
    }

    const users = await db.getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'restaurant') {
      const idx = user.favorites.restaurants.indexOf(id);
      if (idx !== -1) {
        user.favorites.restaurants.splice(idx, 1);
      } else {
        user.favorites.restaurants.push(id);
      }
    } else if (type === 'dish') {
      const idx = user.favorites.dishes.indexOf(id);
      if (idx !== -1) {
        user.favorites.dishes.splice(idx, 1);
      } else {
        user.favorites.dishes.push(id);
      }
    } else {
      return res.status(400).json({ error: 'Invalid favorite type' });
    }

    await db.updateUser(userId, { favorites: user.favorites });
    res.json({ message: 'Favorites updated successfully', favorites: user.favorites });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
