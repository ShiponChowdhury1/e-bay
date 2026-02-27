import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// ─── Import Models ───
import User from "./models/User";
import Category from "./models/Category";
import { Product } from "./models/Product";

const MONGODB_URI = process.env.MONGODB_URI || "";

// ─── Helper: slugify ───
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Categories Data ───
const categoriesData = [
  { name: "Electronics", icon: "laptop", description: "Phones, laptops, gadgets and more" },
  { name: "Fashion", icon: "shirt", description: "Clothing, shoes and accessories" },
  { name: "Home & Garden", icon: "home", description: "Furniture, decor and garden supplies" },
  { name: "Motors", icon: "car", description: "Cars, motorcycles and parts" },
  { name: "Collectibles", icon: "gem", description: "Rare and collectible items" },
  { name: "Sports", icon: "dumbbell", description: "Sports equipment and gear" },
  { name: "Toys", icon: "gamepad", description: "Toys, games and hobbies" },
  { name: "Books", icon: "book", description: "Books, magazines and comics" },
  { name: "Music", icon: "music", description: "Musical instruments and audio" },
  { name: "Jewelry", icon: "watch", description: "Jewelry, watches and accessories" },
  { name: "Health", icon: "heart", description: "Health, beauty and personal care" },
  { name: "Business", icon: "briefcase", description: "Business and industrial supplies" },
];

// ─── Seller Users Data ───
const sellersData = [
  { name: "TechZone", email: "techzone@ebay.com", role: "seller" as const },
  { name: "AudioWorld", email: "audioworld@ebay.com", role: "seller" as const },
  { name: "GameStop Official", email: "gamestop@ebay.com", role: "seller" as const },
  { name: "Dyson Outlet", email: "dyson@ebay.com", role: "seller" as const },
  { name: "LuxuryWatches", email: "luxurywatches@ebay.com", role: "seller" as const },
  { name: "ElectroDeals", email: "electrodeals@ebay.com", role: "seller" as const },
  { name: "BrickMasters", email: "brickmasters@ebay.com", role: "seller" as const },
  { name: "AppleReseller", email: "applereseller@ebay.com", role: "seller" as const },
  { name: "TechDeals", email: "techdeals@ebay.com", role: "seller" as const },
  { name: "MobileWorld", email: "mobileworld@ebay.com", role: "seller" as const },
  { name: "AudioPro", email: "audiopro@ebay.com", role: "seller" as const },
  { name: "GameCenter", email: "gamecenter@ebay.com", role: "seller" as const },
];

// ─── Admin User ───
const adminData = {
  name: "Admin",
  email: "admin@ebay.com",
  role: "admin" as const,
};

// ─── Products Data (mapped to sellers by seller name) ───
const productsData = [
  {
    title: "Apple iPhone 15 Pro Max 256GB - Natural Titanium - Unlocked",
    price: 1099.99,
    originalPrice: 1199.99,
    images: ["https://placehold.co/600x600/1a1a1a/ffffff?text=iPhone+15+Pro"],
    condition: "new" as const,
    shipping: "Free 2-day shipping",
    freeShipping: true,
    sellerName: "TechZone",
    categoryName: "Electronics",
    watchers: 234,
    isFeatured: true,
    description: "Brand new iPhone 15 Pro Max with A17 Pro chip, titanium design, and advanced camera system.",
    specifications: { Brand: "Apple", Model: "iPhone 15 Pro Max", Storage: "256GB", Color: "Natural Titanium", Network: "Unlocked" },
    tags: ["iphone", "apple", "smartphone", "unlocked"],
  },
  {
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones - Black",
    price: 328.0,
    originalPrice: 399.99,
    images: ["https://placehold.co/600x600/000000/ffffff?text=Sony+WH-1000XM5"],
    condition: "new" as const,
    shipping: "Free shipping",
    freeShipping: true,
    sellerName: "AudioWorld",
    categoryName: "Electronics",
    watchers: 156,
    isFeatured: true,
    description: "Industry-leading noise cancellation with exceptional sound quality.",
    specifications: { Brand: "Sony", Model: "WH-1000XM5", Color: "Black", "Battery Life": "30 hours", Connectivity: "Bluetooth 5.2" },
    tags: ["sony", "headphones", "wireless", "noise-cancelling"],
  },
  {
    title: "Nintendo Switch OLED Model - White Joy-Con",
    price: 349.99,
    images: ["https://placehold.co/600x600/e60012/ffffff?text=Nintendo+Switch"],
    condition: "new" as const,
    shipping: "$4.99 shipping",
    freeShipping: false,
    shippingCost: 4.99,
    sellerName: "GameStop Official",
    categoryName: "Electronics",
    watchers: 89,
    description: "Enhanced gaming experience with a vibrant 7-inch OLED screen.",
    specifications: { Brand: "Nintendo", Model: "Switch OLED", "Screen Size": "7 inches", Storage: "64GB", Color: "White" },
    tags: ["nintendo", "switch", "gaming", "console"],
  },
  {
    title: "Dyson V15 Detect Cordless Vacuum Cleaner",
    price: 649.99,
    originalPrice: 749.99,
    images: ["https://placehold.co/600x600/6c1d5f/ffffff?text=Dyson+V15"],
    condition: "refurbished" as const,
    shipping: "Free shipping",
    freeShipping: true,
    sellerName: "Dyson Outlet",
    categoryName: "Home & Garden",
    watchers: 312,
    isFeatured: true,
    description: "Powerful cordless vacuum with laser dust detection technology.",
    specifications: { Brand: "Dyson", Model: "V15 Detect", "Run Time": "60 minutes", "Bin Volume": "0.76L", Weight: "6.8 lbs" },
    tags: ["dyson", "vacuum", "cordless", "home"],
  },
  {
    title: "Vintage Rolex Submariner Watch - 1980s - Excellent Condition",
    price: 12500.0,
    images: ["https://placehold.co/600x600/003d29/FFD700?text=Rolex+Submariner"],
    condition: "used" as const,
    shipping: "Free expedited shipping",
    freeShipping: true,
    sellerName: "LuxuryWatches",
    categoryName: "Jewelry",
    watchers: 78,
    description: "Authentic vintage Rolex Submariner from the 1980s in excellent condition.",
    specifications: { Brand: "Rolex", Model: "Submariner", Year: "1980s", "Case Size": "40mm", Material: "Stainless Steel" },
    tags: ["rolex", "watch", "vintage", "luxury"],
  },
  {
    title: 'Samsung 65" Class OLED 4K S90C Smart TV',
    price: 1599.99,
    originalPrice: 1999.99,
    images: ["https://placehold.co/600x600/1428a0/ffffff?text=Samsung+TV"],
    condition: "new" as const,
    shipping: "Free shipping",
    freeShipping: true,
    sellerName: "ElectroDeals",
    categoryName: "Electronics",
    watchers: 445,
    isFeatured: true,
    description: "Stunning OLED display with Quantum HDR and Neural Quantum Processor.",
    specifications: { Brand: "Samsung", Model: "S90C", "Screen Size": '65"', Resolution: "4K UHD", "Display Type": "OLED" },
    tags: ["samsung", "tv", "oled", "4k", "smart-tv"],
  },
  {
    title: "LEGO Star Wars Millennium Falcon Ultimate Collector Series",
    price: 849.99,
    images: ["https://placehold.co/600x600/ffcb05/000000?text=LEGO+Star+Wars"],
    condition: "new" as const,
    shipping: "$9.99 shipping",
    freeShipping: false,
    shippingCost: 9.99,
    sellerName: "BrickMasters",
    categoryName: "Toys",
    watchers: 623,
    isFeatured: true,
    description: "The ultimate LEGO Star Wars set with 7,541 pieces.",
    specifications: { Brand: "LEGO", Theme: "Star Wars", Pieces: "7,541", "Age Range": "16+", Dimensions: '33" x 22" x 8"' },
    tags: ["lego", "star-wars", "collectible", "toys"],
  },
  {
    title: 'MacBook Pro 16" M3 Max - 36GB RAM - 1TB SSD - Space Black',
    price: 3499.0,
    images: ["https://placehold.co/600x600/000000/ffffff?text=MacBook+Pro"],
    condition: "new" as const,
    shipping: "Free 2-day shipping",
    freeShipping: true,
    sellerName: "AppleReseller",
    categoryName: "Electronics",
    watchers: 189,
    description: "The most powerful MacBook Pro ever with M3 Max chip.",
    specifications: { Brand: "Apple", Model: 'MacBook Pro 16"', Chip: "M3 Max", RAM: "36GB", Storage: "1TB SSD" },
    tags: ["apple", "macbook", "laptop", "m3-max"],
  },
  // Deal products
  {
    title: "Apple AirPods Pro 2nd Gen with MagSafe Case",
    price: 189.99,
    originalPrice: 249.99,
    images: ["https://placehold.co/600x600/ffffff/000000?text=AirPods+Pro"],
    condition: "new" as const,
    shipping: "Free shipping",
    freeShipping: true,
    sellerName: "TechDeals",
    categoryName: "Electronics",
    watchers: 567,
    isFeatured: true,
    description: "Premium wireless earbuds with active noise cancellation.",
    specifications: { Brand: "Apple", Model: "AirPods Pro 2nd Gen", "Noise Cancellation": "Yes", "Battery Life": "6 hours" },
    tags: ["apple", "airpods", "earbuds", "wireless"],
  },
  {
    title: "Samsung Galaxy Watch 6 Classic 47mm - Silver",
    price: 299.99,
    originalPrice: 429.99,
    images: ["https://placehold.co/600x600/c0c0c0/000000?text=Galaxy+Watch"],
    condition: "new" as const,
    shipping: "Free shipping",
    freeShipping: true,
    sellerName: "MobileWorld",
    categoryName: "Electronics",
    watchers: 234,
    description: "Premium smartwatch with rotating bezel and advanced health tracking.",
    specifications: { Brand: "Samsung", Model: "Galaxy Watch 6 Classic", Size: "47mm", Color: "Silver" },
    tags: ["samsung", "smartwatch", "wearable"],
  },
  {
    title: "Bose QuietComfort Ultra Earbuds",
    price: 249.0,
    originalPrice: 299.0,
    images: ["https://placehold.co/600x600/000000/ffffff?text=Bose+Earbuds"],
    condition: "new" as const,
    shipping: "Free shipping",
    freeShipping: true,
    sellerName: "AudioPro",
    categoryName: "Electronics",
    watchers: 189,
    description: "World-class noise cancellation with immersive audio.",
    specifications: { Brand: "Bose", Model: "QuietComfort Ultra", "Noise Cancellation": "Yes", "Battery Life": "6 hours" },
    tags: ["bose", "earbuds", "noise-cancelling", "wireless"],
  },
  {
    title: "PlayStation 5 Slim Console - Digital Edition",
    price: 399.99,
    originalPrice: 449.99,
    images: ["https://placehold.co/600x600/003791/ffffff?text=PlayStation+5"],
    condition: "new" as const,
    shipping: "Free shipping",
    freeShipping: true,
    sellerName: "GameCenter",
    categoryName: "Electronics",
    watchers: 892,
    description: "Next-gen gaming with the slimmer PS5 design.",
    specifications: { Brand: "Sony", Model: "PlayStation 5 Slim", Edition: "Digital", Storage: "1TB SSD" },
    tags: ["sony", "playstation", "ps5", "console", "gaming"],
  },
];

// ═══════════════════════════════════════════════
// ─── SEED FUNCTION ───
// ═══════════════════════════════════════════════
async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB!\n");

    // ─── Clear existing data ───
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log("✅ Existing data cleared\n");

    // ─── Seed Categories ───
    console.log("📁 Seeding categories...");
    const categoryDocs = await Category.insertMany(
      categoriesData.map((cat) => ({
        name: cat.name,
        slug: slugify(cat.name),
        description: cat.description,
        isActive: true,
      }))
    );
    console.log(`✅ ${categoryDocs.length} categories created`);

    // Build a lookup map: category name -> _id
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();
    for (const cat of categoryDocs) {
      categoryMap.set(cat.name, cat._id as mongoose.Types.ObjectId);
    }

    // ─── Seed Admin User ───
    console.log("\n👤 Seeding admin user...");
    const hashedPassword = await bcrypt.hash("password123", 12);
    const admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      isVerified: true,
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // ─── Seed Seller Users ───
    console.log("\n🏪 Seeding seller users...");
    const sellerDocs = await User.insertMany(
      sellersData.map((seller) => ({
        name: seller.name,
        email: seller.email,
        password: hashedPassword, // already hashed
        role: seller.role,
        isVerified: true,
      }))
    );
    console.log(`✅ ${sellerDocs.length} sellers created`);

    // Build a lookup map: seller name -> _id
    const sellerMap = new Map<string, mongoose.Types.ObjectId>();
    for (const seller of sellerDocs) {
      sellerMap.set(seller.name, seller._id as mongoose.Types.ObjectId);
    }

    // ─── Seed a Buyer User ───
    console.log("\n👤 Seeding buyer user...");
    const buyer = await User.create({
      name: "John Doe",
      email: "buyer@ebay.com",
      password: hashedPassword,
      role: "buyer",
      isVerified: true,
    });
    console.log(`✅ Buyer created: ${buyer.email}`);

    // ─── Seed Products ───
    console.log("\n📦 Seeding products...");
    const productInsertData = productsData.map((p) => {
      const sellerId = sellerMap.get(p.sellerName);
      const categoryId = categoryMap.get(p.categoryName);

      if (!sellerId) throw new Error(`Seller not found: ${p.sellerName}`);
      if (!categoryId) throw new Error(`Category not found: ${p.categoryName}`);

      return {
        title: p.title,
        slug: slugify(p.title),
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        images: p.images,
        category: categoryId,
        seller: sellerId,
        condition: p.condition,
        productType: "buy_now" as const,
        stock: 10,
        specifications: p.specifications,
        tags: p.tags,
        isActive: true,
        isFeatured: p.isFeatured || false,
        freeShipping: p.freeShipping,
        shippingCost: p.shippingCost || 0,
        shippingInfo: p.shipping,
        watchers: p.watchers,
      };
    });

    const productDocs = await Product.insertMany(productInsertData);
    console.log(`✅ ${productDocs.length} products created`);

    // ─── Summary ───
    console.log("\n═══════════════════════════════════════");
    console.log("🎉 Database seeded successfully!");
    console.log("═══════════════════════════════════════");
    console.log(`📁 Categories: ${categoryDocs.length}`);
    console.log(`👤 Admin: admin@ebay.com / password123`);
    console.log(`🏪 Sellers: ${sellerDocs.length}`);
    console.log(`👤 Buyer: buyer@ebay.com / password123`);
    console.log(`📦 Products: ${productDocs.length}`);
    console.log("═══════════════════════════════════════\n");

  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
