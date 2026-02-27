// Dummy product data for the marketplace
export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  condition: 'New' | 'Used' | 'Refurbished';
  shipping: string;
  freeShipping: boolean;
  seller: {
    name: string;
    rating: number;
    totalReviews: number;
  };
  watchers: number;
  topRated?: boolean;
  bestSeller?: boolean;
  description?: string;
  specifications?: Record<string, string>;
}

export const products: Product[] = [
  {
    id: '1',
    title: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium - Unlocked',
    price: 1099.99,
    originalPrice: 1199.99,
    image: '/iphone-15-pro-max-titanium-smartphone.jpg',
    condition: 'New',
    shipping: 'Free 2-day shipping',
    freeShipping: true,
    seller: { name: 'TechZone', rating: 99.2, totalReviews: 12453 },
    watchers: 234,
    topRated: true,
    description:
      'Brand new iPhone 15 Pro Max with A17 Pro chip, titanium design, and advanced camera system.',
    specifications: {
      Brand: 'Apple',
      Model: 'iPhone 15 Pro Max',
      Storage: '256GB',
      Color: 'Natural Titanium',
      Network: 'Unlocked',
    },
  },
  {
    id: '2',
    title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones - Black',
    price: 328.0,
    originalPrice: 399.99,
    image: '/sony-wh1000xm5-wireless-headphones-black.jpg',
    condition: 'New',
    shipping: 'Free shipping',
    freeShipping: true,
    seller: { name: 'AudioWorld', rating: 98.7, totalReviews: 8921 },
    watchers: 156,
    bestSeller: true,
    description:
      'Industry-leading noise cancellation with exceptional sound quality.',
    specifications: {
      Brand: 'Sony',
      Model: 'WH-1000XM5',
      Color: 'Black',
      'Battery Life': '30 hours',
      Connectivity: 'Bluetooth 5.2',
    },
  },
  {
    id: '3',
    title: 'Nintendo Switch OLED Model - White Joy-Con',
    price: 349.99,
    image: '/nintendo-switch-oled-white-gaming-console.jpg',
    condition: 'New',
    shipping: '$4.99 shipping',
    freeShipping: false,
    seller: { name: 'GameStop_Official', rating: 97.5, totalReviews: 45123 },
    watchers: 89,
    description:
      'Enhanced gaming experience with a vibrant 7-inch OLED screen.',
    specifications: {
      Brand: 'Nintendo',
      Model: 'Switch OLED',
      'Screen Size': '7 inches',
      Storage: '64GB',
      Color: 'White',
    },
  },
  {
    id: '4',
    title: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    price: 649.99,
    originalPrice: 749.99,
    image: '/dyson-v15-cordless-vacuum-cleaner.jpg',
    condition: 'Refurbished',
    shipping: 'Free shipping',
    freeShipping: true,
    seller: { name: 'Dyson_Outlet', rating: 99.1, totalReviews: 23456 },
    watchers: 312,
    topRated: true,
    description:
      'Powerful cordless vacuum with laser dust detection technology.',
    specifications: {
      Brand: 'Dyson',
      Model: 'V15 Detect',
      'Run Time': '60 minutes',
      'Bin Volume': '0.76L',
      Weight: '6.8 lbs',
    },
  },
  {
    id: '5',
    title: 'Vintage Rolex Submariner Watch - 1980s - Excellent Condition',
    price: 12500.0,
    image: '/vintage-rolex-submariner-watch-1980s.jpg',
    condition: 'Used',
    shipping: 'Free expedited shipping',
    freeShipping: true,
    seller: { name: 'LuxuryWatches', rating: 100, totalReviews: 892 },
    watchers: 78,
    description:
      'Authentic vintage Rolex Submariner from the 1980s in excellent condition.',
    specifications: {
      Brand: 'Rolex',
      Model: 'Submariner',
      Year: '1980s',
      'Case Size': '40mm',
      Material: 'Stainless Steel',
    },
  },
  {
    id: '6',
    title: 'Samsung 65" Class OLED 4K S90C Smart TV',
    price: 1599.99,
    originalPrice: 1999.99,
    image: '/samsung-65-inch-oled-4k-smart-tv.jpg',
    condition: 'New',
    shipping: 'Free shipping',
    freeShipping: true,
    seller: { name: 'ElectroDeals', rating: 98.9, totalReviews: 15678 },
    watchers: 445,
    bestSeller: true,
    description:
      'Stunning OLED display with Quantum HDR and Neural Quantum Processor.',
    specifications: {
      Brand: 'Samsung',
      Model: 'S90C',
      'Screen Size': '65"',
      Resolution: '4K UHD',
      'Display Type': 'OLED',
    },
  },
  {
    id: '7',
    title: 'LEGO Star Wars Millennium Falcon Ultimate Collector Series',
    price: 849.99,
    image: '/lego-millennium-falcon-ultimate-collector-set.jpg',
    condition: 'New',
    shipping: '$9.99 shipping',
    freeShipping: false,
    seller: { name: 'BrickMasters', rating: 99.8, totalReviews: 5643 },
    watchers: 623,
    topRated: true,
    description: 'The ultimate LEGO Star Wars set with 7,541 pieces.',
    specifications: {
      Brand: 'LEGO',
      Theme: 'Star Wars',
      Pieces: '7,541',
      'Age Range': '16+',
      Dimensions: '33" x 22" x 8"',
    },
  },
  {
    id: '8',
    title: 'MacBook Pro 16" M3 Max - 36GB RAM - 1TB SSD - Space Black',
    price: 3499.0,
    image: '/macbook-pro-16-inch-m3-max-space-black.jpg',
    condition: 'New',
    shipping: 'Free 2-day shipping',
    freeShipping: true,
    seller: { name: 'AppleReseller', rating: 99.5, totalReviews: 34521 },
    watchers: 189,
    description: 'The most powerful MacBook Pro ever with M3 Max chip.',
    specifications: {
      Brand: 'Apple',
      Model: 'MacBook Pro 16"',
      Chip: 'M3 Max',
      RAM: '36GB',
      Storage: '1TB SSD',
    },
  },
];

export const categories = [
  { name: 'Electronics', icon: 'laptop', href: '/category/electronics' },
  { name: 'Fashion', icon: 'shirt', href: '/category/fashion' },
  { name: 'Home & Garden', icon: 'home', href: '/category/home-garden' },
  { name: 'Motors', icon: 'car', href: '/category/motors' },
  { name: 'Collectibles', icon: 'gem', href: '/category/collectibles' },
  { name: 'Sports', icon: 'dumbbell', href: '/category/sports' },
  { name: 'Toys', icon: 'gamepad', href: '/category/toys' },
  { name: 'Books', icon: 'book', href: '/category/books' },
  { name: 'Music', icon: 'music', href: '/category/music' },
  { name: 'Jewelry', icon: 'watch', href: '/category/jewelry' },
  { name: 'Health', icon: 'heart', href: '/category/health' },
  { name: 'Business', icon: 'briefcase', href: '/category/business' },
];

export const dealProducts: Product[] = [
  {
    id: 'd1',
    title: 'Apple AirPods Pro 2nd Gen with MagSafe Case',
    price: 189.99,
    originalPrice: 249.99,
    image: '/airpods-pro.jpg',
    condition: 'New',
    shipping: 'Free shipping',
    freeShipping: true,
    seller: { name: 'TechDeals', rating: 98.5, totalReviews: 9876 },
    watchers: 567,
    description: 'Premium wireless earbuds with active noise cancellation.',
    specifications: {
      Brand: 'Apple',
      Model: 'AirPods Pro 2nd Gen',
      'Noise Cancellation': 'Yes',
      'Battery Life': '6 hours',
    },
  },
  {
    id: 'd2',
    title: 'Samsung Galaxy Watch 6 Classic 47mm - Silver',
    price: 299.99,
    originalPrice: 429.99,
    image: '/samsung-galaxy-watch-6-classic-silver.jpg',
    condition: 'New',
    shipping: 'Free shipping',
    freeShipping: true,
    seller: { name: 'MobileWorld', rating: 97.8, totalReviews: 6543 },
    watchers: 234,
    description:
      'Premium smartwatch with rotating bezel and advanced health tracking.',
    specifications: {
      Brand: 'Samsung',
      Model: 'Galaxy Watch 6 Classic',
      Size: '47mm',
      Color: 'Silver',
    },
  },
  {
    id: 'd3',
    title: 'Bose QuietComfort Ultra Earbuds',
    price: 249.0,
    originalPrice: 299.0,
    image: '/bose-quietcomfort-ultra-earbuds.jpg',
    condition: 'New',
    shipping: 'Free shipping',
    freeShipping: true,
    seller: { name: 'AudioPro', rating: 99.0, totalReviews: 4321 },
    watchers: 189,
    description: 'World-class noise cancellation with immersive audio.',
    specifications: {
      Brand: 'Bose',
      Model: 'QuietComfort Ultra',
      'Noise Cancellation': 'Yes',
      'Battery Life': '6 hours',
    },
  },
  {
    id: 'd4',
    title: 'PlayStation 5 Slim Console - Digital Edition',
    price: 399.99,
    originalPrice: 449.99,
    image: '/playstation-5-slim-digital-edition-console.jpg',
    condition: 'New',
    shipping: 'Free shipping',
    freeShipping: true,
    seller: { name: 'GameCenter', rating: 98.2, totalReviews: 12345 },
    watchers: 892,
    description: 'Next-gen gaming with the slimmer PS5 design.',
    specifications: {
      Brand: 'Sony',
      Model: 'PlayStation 5 Slim',
      Edition: 'Digital',
      Storage: '1TB SSD',
    },
  },
];
