import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Order } from '../db';

let io: any = null;

const activeSimulations: { [orderId: string]: NodeJS.Timeout } = {};

export const setIO = (ioInstance: any) => {
  io = ioInstance;
};

const riderPathPoints = [
  { lat: 21.1702, lng: 72.8311 },
  { lat: 21.1750, lng: 72.8350 },
  { lat: 21.1800, lng: 72.8400 },
  { lat: 21.1850, lng: 72.8450 },
  { lat: 21.1900, lng: 72.8500 },
];

const runOrderSimulation = (orderId: string) => {
  const statuses: Order['orderStatus'][] = [
    'accepted',
    'preparing',
    'picked_up',
    'on_the_way',
    'delivered'
  ];

  let currentIdx = 0;
  let pathIdx = 0;

  const interval = setInterval(async () => {
    const orders = await db.getOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      clearInterval(interval);
      delete activeSimulations[orderId];
      return;
    }

    if (order.orderStatus === 'on_the_way') {
      if (pathIdx < riderPathPoints.length) {
        const point = riderPathPoints[pathIdx];
        const deliveryPartner = {
          name: 'Rajesh Kumar',
          phone: '+919876500112',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
          ...point
        };

        await db.updateOrder(orderId, { deliveryPartner });
        if (io) {
          io.to(`order_${orderId}`).emit('rider_moved', deliveryPartner);
        }
        pathIdx++;
      } else {
        const updated = await db.updateOrder(orderId, { orderStatus: 'delivered' });
        if (io) {
          io.to(`order_${orderId}`).emit('status_changed', updated);
        }
        clearInterval(interval);
        delete activeSimulations[orderId];
      }
    } else {
      const nextStatus = statuses[currentIdx];
      currentIdx++;

      const updateFields: Partial<Order> = { orderStatus: nextStatus };

      if (nextStatus === 'picked_up' || nextStatus === 'on_the_way') {
        updateFields.deliveryPartner = {
          name: 'Rajesh Kumar',
          phone: '+919876500112',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
          lat: riderPathPoints[0].lat,
          lng: riderPathPoints[0].lng
        };
      }

      const updated = await db.updateOrder(orderId, updateFields);
      if (io) {
        io.to(`order_${orderId}`).emit('status_changed', updated);
      }

      if (nextStatus === 'delivered') {
        clearInterval(interval);
        delete activeSimulations[orderId];
      }
    }
  }, 10000);

  activeSimulations[orderId] = interval;
};

export const createOrder = async (req: any, res: Response) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      deliveryInstructions,
      scheduledTime,
      paymentMethod,
      couponCode,
      tipAmount
    } = req.body;

    if (!restaurantId || !items || !items.length || !deliveryAddress) {
      return res.status(400).json({ error: 'restaurantId, items, and deliveryAddress are required.' });
    }

    const restaurants = await db.getRestaurants();
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const menuItem = restaurant.menu.find(m => m.id === item.id);
      if (!menuItem) {
        throw new Error(`Menu item ${item.name} not found in this restaurant.`);
      }
      let itemPrice = menuItem.price;
      if (item.customizations) {
        Object.entries(item.customizations).forEach(([title, options]: any) => {
          const menuCust = menuItem.customizations?.find(c => c.title === title);
          if (menuCust) {
            options.forEach((optName: string) => {
              const optObj = menuCust.options.find(o => o.name === optName);
              if (optObj) {
                itemPrice += optObj.price;
              }
            });
          }
        });
      }

      subtotal += itemPrice * item.quantity;
      return {
        id: item.id,
        name: item.name,
        price: itemPrice,
        quantity: item.quantity,
        customizations: item.customizations
      };
    });

    const deliveryFee = restaurant.deliveryFee;
    const packingFee = 10;
    const tax = Math.round(subtotal * 0.05);
    const tip = tipAmount || 0;
    let discount = 0;

    if (couponCode === 'EXPRESS50') {
      discount = Math.min(100, Math.round(subtotal * 0.5));
    } else if (couponCode === 'FREEDEL') {
      discount = deliveryFee;
    }

    const total = subtotal + deliveryFee + packingFee + tax + tip - discount;

    const newOrder: Order = {
      id: `ord-${uuidv4().substring(0, 8)}`,
      userId: req.userId,
      restaurantId,
      restaurantName: restaurant.name,
      items: orderItems,
      deliveryAddress,
      deliveryInstructions,
      scheduledTime,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'placed',
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        packingFee,
        tip,
        discount,
        total
      },
      couponCode,
      createdAt: new Date().toISOString()
    };

    await db.addOrder(newOrder);

    runOrderSimulation(newOrder.id);

    res.status(211).json({
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getOrders = async (req: any, res: Response) => {
  try {
    const orders = await db.getOrders();
    const userOrders = orders.filter(o => o.userId === req.userId);
    userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(userOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrderById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const orders = await db.getOrders();
    const order = orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await db.updateOrder(id, { orderStatus: status });
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (io) {
      io.to(`order_${id}`).emit('status_changed', updated);
    }

    res.json({ message: 'Order status updated successfully', order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
