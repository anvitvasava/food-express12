d-- FoodExpress Supabase PostgreSQL Schema & Seed Data

-- 1. CLEANUP PREVIOUS TABLES IF THEY EXIST
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_payment_methods CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE TABLES

-- A. Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. User Addresses Table (Foreign Key to users)
CREATE TABLE user_addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (title IN ('Home', 'Work', 'Other')),
    address_line TEXT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. User Payment Methods Table (Foreign Key to users)
CREATE TABLE user_payment_methods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('card', 'upi', 'wallet')),
    last4 TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- D. User Favorites Table (Foreign Key to users)
CREATE TABLE user_favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL, -- Can be restaurant_id or dish_id
    type TEXT NOT NULL CHECK (type IN ('restaurant', 'dish')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id, type)
);

-- E. Restaurants Table
CREATE TABLE restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    banner_image TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    delivery_time INTEGER DEFAULT 20, -- In minutes
    distance NUMERIC(4, 2) DEFAULT 1.0, -- In km
    delivery_fee INTEGER DEFAULT 0,
    is_open BOOLEAN DEFAULT TRUE,
    opening_hours TEXT NOT NULL DEFAULT '10:00 AM - 10:00 PM',
    categories TEXT[] NOT NULL, -- PostgreSQL Array of text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- F. Menu Items Table (Foreign Key to restaurants)
CREATE TABLE menu_items (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    is_veg BOOLEAN DEFAULT TRUE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    nutritional_info JSONB, -- Stores calories, protein, carbs, fat
    ingredients TEXT[], -- Array of ingredients
    customizations JSONB, -- Array of customization categories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- G. Orders Table (Foreign Key to users and restaurants)
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    restaurant_name TEXT NOT NULL,
    items JSONB NOT NULL, -- Detailed JSON array of ordered items + customization selections
    delivery_address JSONB NOT NULL, -- { title, addressLine }
    delivery_instructions TEXT,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'card', 'upi', 'wallet')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    order_status TEXT NOT NULL DEFAULT 'placed' CHECK (order_status IN ('placed', 'accepted', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),
    delivery_partner JSONB, -- Details of rider: { name, phone, avatar, lat, lng }
    pricing JSONB NOT NULL, -- { subtotal, deliveryFee, tax, packingFee, tip, discount, total }
    coupon_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX idx_user_addresses_uid ON user_addresses(user_id);
CREATE INDEX idx_user_payment_uid ON user_payment_methods(user_id);
CREATE INDEX idx_user_favorites_uid ON user_favorites(user_id);
CREATE INDEX idx_menu_items_rest_id ON menu_items(restaurant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 4. SEED DATA INSERTION

-- A. Default Users
-- admin@foodexpress.com / admin123
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
('admin-1', 'FoodExpress Administrator', 'admin@foodexpress.com', '+919999999999', '$2a$10$tZ264UptF3G6L.r7oDswW.Z69Qc/G0kXfQzK7U5zX5Y58Y.WfDqea', 'admin');

-- john@example.com / password123
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
('user-1', 'John Doe', 'john@example.com', '+919876543210', '$2a$10$wN31VbJ4T1kOcrFvj/49Hulr6C6C26uP0yF3Wd.5r2iZqK3pB58N.', 'customer');

-- B. Default Addresses
INSERT INTO user_addresses (id, user_id, title, address_line, instructions) VALUES
('addr-admin-1', 'admin-1', 'Other', '101, Admin Tower, Silicon Valley, Gujarat', NULL),
('addr-1', 'user-1', 'Home', 'Flat 402, Green Heights, Bardoli, Gujarat', 'Leave at the gate'),
('addr-2', 'user-1', 'Work', 'Web Labs, Technology Park, Surat, Gujarat', NULL);

-- C. Default Payment Methods
INSERT INTO user_payment_methods (id, user_id, type, last4, details) VALUES
('pm-1', 'user-1', 'card', '4242', 'Visa ending in 4242');

-- D. Default Restaurants
INSERT INTO restaurants (id, name, description, image, banner_image, rating, review_count, delivery_time, distance, delivery_fee, is_open, opening_hours, categories) VALUES
(
  'rest-1',
  'Pizza Palace',
  'Gourmet Italian Woodfired Pizzas & Pastas',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop',
  4.6,
  340,
  25,
  2.4,
  15,
  TRUE,
  '11:00 AM - 11:00 PM',
  ARRAY['Pizza', 'Italian', 'Desserts']
),
(
  'rest-2',
  'Burger Club',
  'American Smashed Burgers, Crispy Fries & Thick Shakes',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop',
  4.4,
  512,
  18,
  1.1,
  20,
  TRUE,
  '10:00 AM - 11:30 PM',
  ARRAY['Burger', 'Fast Food', 'Drinks']
),
(
  'rest-3',
  'Biryani Express',
  'Authentic Hyderabadi Dum Biryani & Kebabs',
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=1200&auto=format&fit=crop',
  4.8,
  920,
  30,
  3.5,
  0,
  TRUE,
  '12:00 PM - 10:30 PM',
  ARRAY['Biryani', 'South Indian', 'Mughlai']
);

-- E. Default Favorites
INSERT INTO user_favorites (id, user_id, item_id, type) VALUES
('fav-1', 'user-1', 'rest-1', 'restaurant');

-- F. Default Menu Items
INSERT INTO menu_items (id, restaurant_id, name, description, price, image, category, is_veg, is_bestseller, nutritional_info, ingredients, customizations) VALUES
(
  'dish-1',
  'rest-1',
  'Double Cheese Margherita',
  'Loaded with extra Mozzarella Cheese & Basil leaves',
  249,
  'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&auto=format&fit=crop',
  'Pizza',
  TRUE,
  TRUE,
  '{"calories": 290, "protein": "12g", "carbs": "34g", "fat": "11g"}'::jsonb,
  ARRAY['Mozzarella', 'Tomato Sauce', 'Fresh Basil', 'Olive Oil'],
  '[
    {
      "title": "Size",
      "required": true,
      "multiSelect": false,
      "options": [
        {"name": "Regular (7\")", "price": 0},
        {"name": "Medium (10\")", "price": 150},
        {"name": "Large (12\")", "price": 280}
      ]
    },
    {
      "title": "Extra Toppings",
      "required": false,
      "multiSelect": true,
      "options": [
        {"name": "Extra Cheese", "price": 60},
        {"name": "Olives & Jalapenos", "price": 40},
        {"name": "Mushrooms", "price": 50}
      ]
    }
  ]'::jsonb
),
(
  'dish-2',
  'rest-1',
  'Spicy Paneer Tikka Pizza',
  'Spiced paneer, onions, capsicum & red paprika',
  329,
  'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop',
  'Pizza',
  TRUE,
  FALSE,
  '{"calories": 340, "protein": "14g", "carbs": "38g", "fat": "14g"}'::jsonb,
  ARRAY['Paneer Tikka', 'Capsicum', 'Onion', 'Red Paprika', 'Cheese'],
  '[
    {
      "title": "Crust",
      "required": true,
      "multiSelect": false,
      "options": [
        {"name": "Classic Hand Tossed", "price": 0},
        {"name": "Cheese Burst", "price": 90},
        {"name": "Wheat Crust", "price": 40}
      ]
    }
  ]'::jsonb
),
(
  'dish-3',
  'rest-2',
  'The Ultimate Cheese Smashed Burger',
  'Double grilled patty, melting cheddar, secret relish sauce, toasted brioche bun',
  189,
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop',
  'Burger',
  FALSE,
  TRUE,
  '{"calories": 520, "protein": "28g", "carbs": "40g", "fat": "24g"}'::jsonb,
  ARRAY['Beef Patty', 'Brioche Bun', 'Cheddar Cheese', 'Pickles', 'Relish'],
  '[
    {
      "title": "Add-ons",
      "required": false,
      "multiSelect": true,
      "options": [
        {"name": "Extra Cheese Slice", "price": 20},
        {"name": "Grilled Bacon", "price": 50},
        {"name": "Jalapenos", "price": 15}
      ]
    }
  ]'::jsonb
),
(
  'dish-4',
  'rest-2',
  'Crispy Veggie Burger',
  'Crispy herb patty, fresh lettuce, tomatoes, and spicy creamy mayo',
  129,
  'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&auto=format&fit=crop',
  'Burger',
  TRUE,
  TRUE,
  '{"calories": 380, "protein": "9g", "carbs": "45g", "fat": "12g"}'::jsonb,
  ARRAY['Potato & Peas Patty', 'Lettuce', 'Tomato', 'Spicy Mayo'],
  '[]'::jsonb
),
(
  'dish-5',
  'rest-3',
  'Hyderabadi Chicken Dum Biryani',
  'Long grain basmati rice layered with spiced chicken, saffron, and fried onions',
  279,
  'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop',
  'Biryani',
  FALSE,
  TRUE,
  '{"calories": 650, "protein": "35g", "carbs": "70g", "fat": "18g"}'::jsonb,
  ARRAY['Basmati Rice', 'Chicken', 'Yogurt', 'Saffron', 'Spices'],
  '[
    {
      "title": "Portion Size",
      "required": true,
      "multiSelect": false,
      "options": [
        {"name": "Half (Serves 1)", "price": 0},
        {"name": "Full (Serves 2-3)", "price": 180}
      ]
    },
    {
      "title": "Spice Level",
      "required": true,
      "multiSelect": false,
      "options": [
        {"name": "Medium", "price": 0},
        {"name": "Spicy", "price": 0},
        {"name": "Double Spicy", "price": 0}
      ]
    }
  ]'::jsonb
);
