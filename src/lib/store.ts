import { Product, defaultProducts } from "./products";

const PRODUCTS_KEY = "pasar_online_products";
const USERNAME_KEY = "pasar_online_username";
const RATINGS_KEY = "pasar_online_ratings";

export function getProducts(): Product[] {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) {
    try {
      const custom = JSON.parse(stored) as Product[];
      return [...defaultProducts, ...custom];
    } catch {
      return defaultProducts;
    }
  }
  return defaultProducts;
}

export function addProduct(product: Omit<Product, "id" | "rating" | "ratingCount">) {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  const custom: Product[] = stored ? JSON.parse(stored) : [];
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    rating: 0,
    ratingCount: 0,
  };
  custom.push(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(custom));
  return newProduct;
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function setUsername(name: string) {
  localStorage.setItem(USERNAME_KEY, name);
}

export interface RatingEntry {
  productId: string;
  username: string;
  rating: number;
}

export function getRatings(): RatingEntry[] {
  const stored = localStorage.getItem(RATINGS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addRating(productId: string, username: string, rating: number) {
  const ratings = getRatings();
  const existing = ratings.findIndex(r => r.productId === productId && r.username === username);
  if (existing >= 0) {
    ratings[existing].rating = rating;
  } else {
    ratings.push({ productId, username, rating });
  }
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
}

export function getProductRating(productId: string): { avg: number; count: number } {
  const ratings = getRatings().filter(r => r.productId === productId);
  if (ratings.length === 0) return { avg: 0, count: 0 };
  const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  return { avg, count: ratings.length };
}
