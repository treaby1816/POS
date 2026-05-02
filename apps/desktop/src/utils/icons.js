import { 
  Package, Smartphone, Pill, CupSoda, Coffee, Wheat, Utensils, Waves, Shirt, Book, Zap, Hammer, Watch 
} from 'lucide-react';

export const ICON_MAP = [
  { keywords: ['tile', 'cement', 'paint', 'brick', 'tool', 'hardware', 'hammer', 'nail'], icon: Hammer },
  { keywords: ['shoe', 'bag', 'watch', 'jewel', 'fashion', 'accessory'], icon: Watch },
  { keywords: ['phone', 'tablet', 'gadget', 'mobile', 'laptop', 'computer'], icon: Smartphone },
  { keywords: ['medicine', 'tablet', 'pill', 'drug', 'capsule', 'health'], icon: Pill },
  { keywords: ['drink', 'coke', 'pepsi', 'fanta', 'water', 'beverage', 'juice', 'wine', 'beer'], icon: CupSoda },
  { keywords: ['milk', 'yoghurt', 'dairy', 'cheese', 'peak', 'cream'], icon: Coffee },
  { keywords: ['bread', 'flour', 'rice', 'wheat', 'indomie', 'noodles', 'grain'], icon: Wheat },
  { keywords: ['food', 'meal', 'eat', 'restaurant'], icon: Utensils },
  { keywords: ['soap', 'wash', 'clean', 'detergent', 'dettol', 'shampoo'], icon: Waves },
  { keywords: ['cloth', 'shirt', 'dress', 'wear', 'garment'], icon: Shirt },
  { keywords: ['book', 'pen', 'pencil', 'paper', 'stationery', 'office'], icon: Book },
  { keywords: ['electronics', 'power', 'zap', 'electric', 'bulb'], icon: Zap },
];

export const getSmartIcon = (product) => {
  const name = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  const combined = `${name} ${cat}`;
  
  for (const entry of ICON_MAP) {
    if (entry.keywords.some(k => combined.includes(k))) {
      return entry.icon;
    }
  }
  return Package;
};
