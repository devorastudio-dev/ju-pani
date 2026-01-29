export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isFeatured: boolean;
  isFavorite: boolean;
  popularityScore: number;
  active: boolean;
  ingredients?: string;
  calories?: number | null;
  prepTimeMinutes?: number | null;
  yieldInfo?: string | null;
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  itemNotes?: string | null;
};

export type Cart = {
  items: CartItem[];
  notes?: string;
  updatedAt: string;
};
