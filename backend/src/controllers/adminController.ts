import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Restaurant, MenuItem } from '../db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const orders = await db.getOrders();
    const restaurants = await db.getRestaurants();
    const users = await db.getUsers();

    const totalSales = orders
      .filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
      .reduce((sum, o) => sum + o.pricing.total, 0);

    const activeOrders = orders.filter(o => 
      o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
    ).length;

    const categoryBreakdown: { [cat: string]: number } = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const rest = restaurants.find(r => r.id === o.restaurantId);
        const menuItem = rest?.menu.find(m => m.id === item.id);
        const cat = menuItem?.category || 'Other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + item.quantity;
      });
    });

    res.json({
      metrics: {
        totalSales,
        totalOrders: orders.length,
        totalRestaurants: restaurants.length,
        totalUsers: users.length,
        activeOrders
      },
      categoryBreakdown,
      recentOrders: orders.slice(-5).reverse()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addRestaurant = async (req: Request, res: Response) => {
  try {
    const { name, description, image, bannerImage, deliveryTime, distance, deliveryFee, openingHours, categories } = req.body;

    if (!name || !description || !image) {
      return res.status(400).json({ error: 'name, description, and image are required.' });
    }

    const newRest: Restaurant = {
      id: `rest-${uuidv4().substring(0, 8)}`,
      name,
      description,
      image,
      bannerImage: bannerImage || image,
      rating: 5.0,
      reviewCount: 1,
      deliveryTime: Number(deliveryTime) || 20,
      distance: Number(distance) || 1.0,
      deliveryFee: Number(deliveryFee) || 0,
      isOpen: true,
      openingHours: openingHours || '10:00 AM - 10:00 PM',
      categories: categories || ['Pizza'],
      menu: []
    };

    await db.addRestaurant(newRest);
    res.status(211).json({ message: 'Restaurant added successfully!', restaurant: newRest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addMenuItem = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { name, description, price, image, category, isVeg, isBestseller, calories, protein, carbs, fat, ingredients } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'name, price, and category are required.' });
    }

    const restaurants = await db.getRestaurants();
    const rest = restaurants.find(r => r.id === restaurantId);
    if (!rest) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    const newItem: MenuItem = {
      id: `dish-${uuidv4().substring(0, 8)}`,
      name,
      description: description || '',
      price: Number(price),
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop',
      category,
      isVeg: isVeg === true || isVeg === 'true',
      isBestseller: isBestseller === true || isBestseller === 'true',
      nutritionalInfo: calories ? {
        calories: Number(calories),
        protein: protein || '0g',
        carbs: carbs || '0g',
        fat: fat || '0g'
      } : undefined,
      ingredients: ingredients ? (typeof ingredients === 'string' ? ingredients.split(',').map((s: string) => s.trim()) : ingredients) : [],
      customizations: []
    };

    const nextMenu = [...rest.menu, newItem];
    await db.updateRestaurant(restaurantId, { menu: nextMenu });

    res.status(211).json({ message: 'Menu item added successfully!', menuItem: newItem });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
