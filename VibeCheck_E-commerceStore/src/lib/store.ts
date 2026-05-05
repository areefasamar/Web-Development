import { Product, InventoryLog } from '../types';

const STORAGE_KEY_PRODUCTS = 'vibecheck_products';
const STORAGE_KEY_LOGS = 'vibecheck_logs';

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cyberpunk Graphics Tee',
    description: 'Oversized fit with neon reactive print. Standard issue for the digital street.',
    price: 45,
    category: 'New Arrivals',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Stealth Bomber Jacket',
    description: 'Structural nylon with water-resistant membrane. Tactical silhouette.',
    price: 245,
    category: 'Techwear',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    createdAt: Date.now() - 100000
  },
  {
    id: '3',
    name: 'Vibe-Sync Hoodie',
    description: 'Heavyweight loopback cotton with puff print details. 100% neural sync.',
    price: 120,
    category: 'New Arrivals',
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    createdAt: Date.now() - 200000
  },
  {
    id: '4',
    name: '90s Archive Windbreaker',
    description: 'Vintage silhouette reclaimed from the digital vault. Heritage vibes.',
    price: 185,
    category: 'Archives',
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=800&q=80',
    createdAt: Date.now() - 300000
  },
  {
    id: '5',
    name: 'Modular Utility Pants',
    description: 'Detachable pockets and adjustable strap system. Field tested.',
    price: 165,
    category: 'Techwear',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    createdAt: Date.now() - 400000
  },
  {
    id: '6',
    name: 'Limited Neon Vest',
    description: 'High-visibility structural piece. Only 50 units in the grid.',
    price: 310,
    category: 'Limited',
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
    createdAt: Date.now() - 500000
  },
  {
    id: '7',
    name: 'Neural Strap Cap',
    description: 'Adjustable tech-headwear with embroidered frequency logos.',
    price: 55,
    category: 'Limited',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    createdAt: Date.now() - 600000
  },
  {
    id: '8',
    name: 'Digital Camo Parka',
    description: 'Weather-shield technology with disrupted pattern aesthetics.',
    price: 395,
    category: 'Techwear',
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
    createdAt: Date.now() - 700000
  }
];

export const store = {
  getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  },

  saveProduct(product: Product) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Storage quota exceeded.', e);
      // Fallback: This usually means the image is still too big or there are too many products.
      alert('THE VAULT IS CRITICALLY FULL. TRY DELETING OLDER PRODUCTS OR CONTACT SYSTEM ADMIN.');
    }
    return products;
  },

  async compressImage(base64Str: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // More aggressive limits to save space (500px vs 800px)
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Using lower quality 0.5 JPEG to drastically reduce byte size
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
    });
  },

  purgeArchive() {
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    window.location.reload(); // Refresh to reset state
  },

  deleteProduct(id: string) {
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    return products;
  },

  getLogs(): InventoryLog[] {
    const data = localStorage.getItem(STORAGE_KEY_LOGS);
    return data ? JSON.parse(data) : [];
  },

  addLog(log: Omit<InventoryLog, 'id' | 'timestamp'>) {
    const logs = this.getLogs();
    const newLog: InventoryLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    return logs;
  }
};
