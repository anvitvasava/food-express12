import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';

// Define DB file path
const DB_FILE = path.join(__dirname, '..', 'database.json');

// Interface definitions (same as before)
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  addresses: {
    id: string;
    title: string;
    addressLine: string;
    instructions?: string;
  }[];
  paymentMethods: {
    id: string;
    type: 'card' | 'upi' | 'wallet';
    last4?: string;
    details?: string;
  }[];
  favorites: {
    restaurants: string[];
    dishes: string[];
  };
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isBestseller: boolean;
  nutritionalInfo?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  ingredients?: string[];
  customizations?: {
    title: string;
    required: boolean;
    multiSelect: boolean;
    options: { name: string; price: number }[];
  }[];
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  bannerImage: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  distance: number;
  deliveryFee: number;
  isOpen: boolean;
  openingHours: string;
  categories: string[];
  menu: MenuItem[];
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    customizations?: { [title: string]: string[] };
  }[];
  deliveryAddress: {
    title: string;
    addressLine: string;
  };
  deliveryInstructions?: string;
  scheduledTime?: string;
  paymentMethod: 'cod' | 'card' | 'upi' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'placed' | 'accepted' | 'preparing' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  deliveryPartner?: {
    name: string;
    phone: string;
    avatar: string;
    lat: number;
    lng: number;
  };
  pricing: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    packingFee: number;
    tip: number;
    discount: number;
    total: number;
  };
  couponCode?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  restaurants: Restaurant[];
  orders: Order[];
}

// Local File Database Helper Class
class LocalFileDatabase {
  private data: DatabaseSchema = { users: [], restaurants: [], orders: [] };

  constructor() {
    this.load();
  }

  public load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      }
    } catch (e) {
      console.error('Error loading local database:', e);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving local database:', e);
    }
  }

  public getUsers(): User[] { return this.data.users; }
  public getRestaurants(): Restaurant[] { return this.data.restaurants; }
  public getOrders(): Order[] { return this.data.orders; }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(userId: string, updatedFields: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updatedFields };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  public addRestaurant(restaurant: Restaurant) {
    this.data.restaurants.push(restaurant);
    this.save();
  }

  public updateRestaurant(restaurantId: string, updatedFields: Partial<Restaurant>) {
    const idx = this.data.restaurants.findIndex(r => r.id === restaurantId);
    if (idx !== -1) {
      this.data.restaurants[idx] = { ...this.data.restaurants[idx], ...updatedFields };
      this.save();
      return this.data.restaurants[idx];
    }
    return null;
  }

  public addOrder(order: Order) {
    this.data.orders.push(order);
    this.save();
  }

  public updateOrder(orderId: string, updatedFields: Partial<Order>) {
    const idx = this.data.orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updatedFields };
      this.save();
      return this.data.orders[idx];
    }
    return null;
  }
}

const localDb = new LocalFileDatabase();

// Unified Dual Database Wrapper Class
class Database {
  
  // 1. User Operations
  public async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data: users, error } = await supabase!
          .from('users')
          .select('id, name, email, phone, password_hash, role, created_at');

        if (error) throw error;
        if (!users) return [];

        const { data: addresses } = await supabase!.from('user_addresses').select('*');
        const { data: paymentMethods } = await supabase!.from('user_payment_methods').select('*');
        const { data: favorites } = await supabase!.from('user_favorites').select('*');

        return users.map(u => {
          const userAddresses = (addresses || [])
            .filter(a => a.user_id === u.id)
            .map(a => ({ id: a.id, title: a.title, addressLine: a.address_line, instructions: a.instructions }));

          const userPayments = (paymentMethods || [])
            .filter(p => p.user_id === u.id)
            .map(p => ({ id: p.id, type: p.type, last4: p.last4, details: p.details }));

          const favRests = (favorites || [])
            .filter(f => f.user_id === u.id && f.type === 'restaurant')
            .map(f => f.item_id);

          const favDishes = (favorites || [])
            .filter(f => f.user_id === u.id && f.type === 'dish')
            .map(f => f.item_id);

          return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            passwordHash: u.password_hash,
            addresses: userAddresses,
            paymentMethods: userPayments,
            favorites: { restaurants: favRests, dishes: favDishes },
            role: u.role as 'customer' | 'admin',
            createdAt: u.created_at
          };
        });
      } catch (err) {
        console.error('[Supabase Error] getUsers failed, falling back to local DB:', err);
      }
    }
    return localDb.getUsers();
  }

  public async addUser(user: User): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error: userError } = await supabase!
          .from('users')
          .insert([{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            password_hash: user.passwordHash,
            role: user.role
          }]);
        if (userError) throw userError;

        // Insert addresses if present
        if (user.addresses && user.addresses.length > 0) {
          const addrRows = user.addresses.map(a => ({
            id: a.id,
            user_id: user.id,
            title: a.title,
            address_line: a.addressLine,
            instructions: a.instructions
          }));
          await supabase!.from('user_addresses').insert(addrRows);
        }
        return;
      } catch (err) {
        console.error('[Supabase Error] addUser failed, falling back to local DB:', err);
      }
    }
    localDb.addUser(user);
  }

  public async updateUser(userId: string, updatedFields: Partial<User>): Promise<User | null> {
    if (isSupabaseConfigured()) {
      try {
        // Map top level user properties
        const userUpdates: any = {};
        if (updatedFields.name) userUpdates.name = updatedFields.name;
        if (updatedFields.email) userUpdates.email = updatedFields.email;
        if (updatedFields.phone) userUpdates.phone = updatedFields.phone;
        if (updatedFields.passwordHash) userUpdates.password_hash = updatedFields.passwordHash;
        if (updatedFields.role) userUpdates.role = updatedFields.role;

        if (Object.keys(userUpdates).length > 0) {
          const { error } = await supabase!
            .from('users')
            .update(userUpdates)
            .eq('id', userId);
          if (error) throw error;
        }

        // Handle addresses updates if provided
        if (updatedFields.addresses) {
          // Delete old
          await supabase!.from('user_addresses').delete().eq('user_id', userId);
          // Insert new
          if (updatedFields.addresses.length > 0) {
            const addrRows = updatedFields.addresses.map(a => ({
              id: a.id,
              user_id: userId,
              title: a.title,
              address_line: a.addressLine,
              instructions: a.instructions
            }));
            await supabase!.from('user_addresses').insert(addrRows);
          }
        }

        // Handle payment methods updates if provided
        if (updatedFields.paymentMethods) {
          await supabase!.from('user_payment_methods').delete().eq('user_id', userId);
          if (updatedFields.paymentMethods.length > 0) {
            const payRows = updatedFields.paymentMethods.map(p => ({
              id: p.id,
              user_id: userId,
              type: p.type,
              last4: p.last4,
              details: p.details
            }));
            await supabase!.from('user_payment_methods').insert(payRows);
          }
        }

        // Handle favorites updates if provided
        if (updatedFields.favorites) {
          await supabase!.from('user_favorites').delete().eq('user_id', userId);
          const favRows: any[] = [];
          updatedFields.favorites.restaurants.forEach(restId => {
            favRows.push({
              id: `fav-r-${userId}-${restId}`,
              user_id: userId,
              item_id: restId,
              type: 'restaurant'
            });
          });
          updatedFields.favorites.dishes.forEach(dishId => {
            favRows.push({
              id: `fav-d-${userId}-${dishId}`,
              user_id: userId,
              item_id: dishId,
              type: 'dish'
            });
          });
          if (favRows.length > 0) {
            await supabase!.from('user_favorites').insert(favRows);
          }
        }

        // Fetch and return the updated user object
        const allUsers = await this.getUsers();
        return allUsers.find(u => u.id === userId) || null;
      } catch (err) {
        console.error('[Supabase Error] updateUser failed, falling back to local DB:', err);
      }
    }
    return localDb.updateUser(userId, updatedFields);
  }

  // 2. Restaurant Operations
  public async getRestaurants(): Promise<Restaurant[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data: rests, error } = await supabase!
          .from('restaurants')
          .select('*');

        if (error) throw error;
        if (!rests) return [];

        const { data: menuItems } = await supabase!.from('menu_items').select('*');

        return rests.map(r => {
          const restMenu = (menuItems || [])
            .filter(m => m.restaurant_id === r.id)
            .map(m => ({
              id: m.id,
              name: m.name,
              description: m.description || '',
              price: m.price,
              image: m.image,
              category: m.category,
              isVeg: m.is_veg,
              isBestseller: m.is_bestseller,
              nutritionalInfo: m.nutritional_info || undefined,
              ingredients: m.ingredients || [],
              customizations: m.customizations || []
            }));

          return {
            id: r.id,
            name: r.name,
            description: r.description,
            image: r.image,
            bannerImage: r.banner_image,
            rating: Number(r.rating),
            reviewCount: r.review_count,
            deliveryTime: r.delivery_time,
            distance: Number(r.distance),
            deliveryFee: r.delivery_fee,
            isOpen: r.is_open,
            openingHours: r.opening_hours,
            categories: r.categories,
            menu: restMenu
          };
        });
      } catch (err) {
        console.error('[Supabase Error] getRestaurants failed, falling back to local DB:', err);
      }
    }
    return localDb.getRestaurants();
  }

  public async addRestaurant(restaurant: Restaurant): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase!
          .from('restaurants')
          .insert([{
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description,
            image: restaurant.image,
            banner_image: restaurant.bannerImage,
            rating: restaurant.rating,
            review_count: restaurant.reviewCount,
            delivery_time: restaurant.deliveryTime,
            distance: restaurant.distance,
            delivery_fee: restaurant.deliveryFee,
            is_open: restaurant.isOpen,
            opening_hours: restaurant.openingHours,
            categories: restaurant.categories
          }]);
        if (error) throw error;
        return;
      } catch (err) {
        console.error('[Supabase Error] addRestaurant failed, falling back to local DB:', err);
      }
    }
    localDb.addRestaurant(restaurant);
  }

  public async updateRestaurant(restaurantId: string, updatedFields: Partial<Restaurant>): Promise<Restaurant | null> {
    if (isSupabaseConfigured()) {
      try {
        const restUpdates: any = {};
        if (updatedFields.name) restUpdates.name = updatedFields.name;
        if (updatedFields.description) restUpdates.description = updatedFields.description;
        if (updatedFields.image) restUpdates.image = updatedFields.image;
        if (updatedFields.bannerImage) restUpdates.banner_image = updatedFields.bannerImage;
        if (updatedFields.rating !== undefined) restUpdates.rating = updatedFields.rating;
        if (updatedFields.reviewCount !== undefined) restUpdates.review_count = updatedFields.reviewCount;
        if (updatedFields.deliveryTime !== undefined) restUpdates.delivery_time = updatedFields.deliveryTime;
        if (updatedFields.distance !== undefined) restUpdates.distance = updatedFields.distance;
        if (updatedFields.deliveryFee !== undefined) restUpdates.delivery_fee = updatedFields.deliveryFee;
        if (updatedFields.isOpen !== undefined) restUpdates.is_open = updatedFields.isOpen;
        if (updatedFields.openingHours) restUpdates.opening_hours = updatedFields.openingHours;
        if (updatedFields.categories) restUpdates.categories = updatedFields.categories;

        if (Object.keys(restUpdates).length > 0) {
          const { error } = await supabase!
            .from('restaurants')
            .update(restUpdates)
            .eq('id', restaurantId);
          if (error) throw error;
        }

        // Handle menu item additions if menu is passed (e.g. replacing menu items)
        if (updatedFields.menu) {
          await supabase!.from('menu_items').delete().eq('restaurant_id', restaurantId);
          if (updatedFields.menu.length > 0) {
            const menuRows = updatedFields.menu.map(m => ({
              id: m.id,
              restaurant_id: restaurantId,
              name: m.name,
              description: m.description,
              price: m.price,
              image: m.image,
              category: m.category,
              is_veg: m.isVeg,
              is_bestseller: m.isBestseller,
              nutritional_info: m.nutritionalInfo,
              ingredients: m.ingredients,
              customizations: m.customizations
            }));
            await supabase!.from('menu_items').insert(menuRows);
          }
        }

        const rests = await this.getRestaurants();
        return rests.find(r => r.id === restaurantId) || null;
      } catch (err) {
        console.error('[Supabase Error] updateRestaurant failed, falling back to local DB:', err);
      }
    }
    return localDb.updateRestaurant(restaurantId, updatedFields);
  }

  // 3. Order Operations
  public async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data: orders, error } = await supabase!
          .from('orders')
          .select('*');

        if (error) throw error;
        if (!orders) return [];

        return orders.map(o => ({
          id: o.id,
          userId: o.user_id,
          restaurantId: o.restaurant_id,
          restaurantName: o.restaurant_name,
          items: o.items,
          deliveryAddress: o.delivery_address,
          deliveryInstructions: o.delivery_instructions || undefined,
          scheduledTime: o.scheduled_time || undefined,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          orderStatus: o.order_status,
          deliveryPartner: o.delivery_partner || undefined,
          pricing: o.pricing,
          couponCode: o.coupon_code || undefined,
          createdAt: o.created_at
        }));
      } catch (err) {
        console.error('[Supabase Error] getOrders failed, falling back to local DB:', err);
      }
    }
    return localDb.getOrders();
  }

  public async addOrder(order: Order): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase!
          .from('orders')
          .insert([{
            id: order.id,
            user_id: order.userId,
            restaurant_id: order.restaurantId,
            restaurant_name: order.restaurantName,
            items: order.items,
            delivery_address: order.deliveryAddress,
            delivery_instructions: order.deliveryInstructions,
            scheduled_time: order.scheduledTime,
            payment_method: order.paymentMethod,
            payment_status: order.paymentStatus,
            order_status: order.orderStatus,
            pricing: order.pricing,
            coupon_code: order.couponCode
          }]);
        if (error) throw error;
        return;
      } catch (err) {
        console.error('[Supabase Error] addOrder failed, falling back to local DB:', err);
      }
    }
    localDb.addOrder(order);
  }

  public async updateOrder(orderId: string, updatedFields: Partial<Order>): Promise<Order | null> {
    if (isSupabaseConfigured()) {
      try {
        const orderUpdates: any = {};
        if (updatedFields.paymentStatus) orderUpdates.payment_status = updatedFields.paymentStatus;
        if (updatedFields.orderStatus) orderUpdates.order_status = updatedFields.orderStatus;
        if (updatedFields.deliveryPartner) orderUpdates.delivery_partner = updatedFields.deliveryPartner;

        if (Object.keys(orderUpdates).length > 0) {
          const { error } = await supabase!
            .from('orders')
            .update(orderUpdates)
            .eq('id', orderId);
          if (error) throw error;
        }

        const orders = await this.getOrders();
        return orders.find(o => o.id === orderId) || null;
      } catch (err) {
        console.error('[Supabase Error] updateOrder failed, falling back to local DB:', err);
      }
    }
    return localDb.updateOrder(orderId, updatedFields);
  }
}

export const db = new Database();
