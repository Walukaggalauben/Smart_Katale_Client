// types/product.types.ts

export interface Product {
  id: string | number;
  name?: string;
  price?: number;
  description?: string;
  brands?: any[];
  categories?: any[];
  images?: string[];
  rating?: number;
  date?: string;
  category?: string;  
  brand?: string;    
  [key: string]: any; 
}

export interface ProductsState {
  categories: string[] | null;
  brands: string[] | null;
  category_brands_mapping: any;
  products: Product[] | null;
  filteredProducts: Product[] | null;
  loading: boolean;
  sourceFiltering: boolean;
  searchTerm: string;
  filters: {
    category: string;
    brand: string;
    sourceCategory: string;
    sourceSubcategory: string;
    minPrice: string | number;
    maxPrice: string | number;
    status: string;
  };
  sortBy: string;
  discount?: number;
}

export interface FetchProductsResponse {
  Category_Brands_Map: any;
  Categories: string[];
  Brands: string[];
  Products: Product[];
}