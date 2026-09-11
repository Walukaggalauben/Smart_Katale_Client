// Slices/productSlice.ts
import { type PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  FetchAllProducts,
  FetchProductTaxonomy,
  FetchProductsBySourceFilter,
  SearchProduct
} from '../api/products';
import type { FetchProductsResponse, ProductsState, Product } from '../types/product.types';
import { API_URL } from '../configs';
import axios from 'axios';

// Define the initial state
const Initial: ProductsState = {
  categories: null,
  brands: null,
  category_brands_mapping: null,
  products: null,
  filteredProducts: null,
  loading: false,
  error: null,
  sourceFiltering: false,
  searchTerm: '',
  filters: {
    category: '',
    brand: '',
    sourceCategory: '',
    sourceSubcategory: '',
    minPrice: '',
    maxPrice: '',
    status: '',
  },
  sortBy: 'rating-desc'
};

export const FetchProductTaxonomyThunk = createAsyncThunk(
  'products/taxonomy',
  async (source: string = 'mobileshop.ug') => {
    return await FetchProductTaxonomy(source);
  }
);

export const FetchAllProductsThunk = createAsyncThunk(
  'all-products/fetch',
  async (limit: number) => {
    const response = await FetchAllProducts(limit);
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as {
        products: ProductsState;
      };

      // Do not refetch the main catalogue if it is
      // already loaded in Redux.
      if (
        Array.isArray(state.products?.products) &&
        state.products.products.length > 0
      ) {
        return false;
      }

      // Also prevent another request while the first
      // catalogue request is still running.
      if (state.products?.loading) {
        return false;
      }

      return true;
    },
  }
);

export const FetchSourceFilteredProductsThunk = createAsyncThunk(
  'products/source-filter',
  async ({
    source = 'mobileshop.ug',
    sourceCategory = '',
    sourceSubcategory = ''
  }: {
    source?: string;
    sourceCategory?: string;
    sourceSubcategory?: string;
  }) => {
    return await FetchProductsBySourceFilter(
      source,
      sourceCategory,
      sourceSubcategory
    );
  }
);

export const SearchProductThunk = createAsyncThunk(
  'products/search', 
  async(search_term: string) => {
    const response = await SearchProduct(search_term);
    return response;
  }
);
export const SearchWithSuggestionsThunk = createAsyncThunk(
  'products/searchWithSuggestions',
  async (search_term: string, _) => {
    const response = await SearchProduct(search_term);
    return response;
  }
);

export const DeleteProductThunk = createAsyncThunk(
  'products/delete',
  async (product_id: string|number, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/products/${product_id}/`);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to delete product');
    }
  }
);

export const UpdateProductThunk = createAsyncThunk(
  'products/update',
  async ({ product_id, updatedData }: { product_id: string|number, updatedData: Partial<Product> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/products/${product_id}/`, updatedData);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to update product');
    }
  }
);


// Helper function to safely get string value
const getSafeString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

const getSafeNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const Products = createSlice({
  name: 'products',
  initialState: Initial,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    
    applyFiltersAndSort: (state) => {
      if (!state.products) {
        return;
      }
      
      let results = [...state.products];

      if (state.searchTerm && state.searchTerm.trim() !== '') {
        const term = state.searchTerm.toLowerCase().trim();
        results = results.filter(item => {
          const searchable = [
            item.name, item.description, item.category, item.brand,
            item.source_category, item.source_subcategory, item.source,
            item.normalized_brand, item.normalized_model, item.normalized_storage,
            item.normalized_ram, item.normalized_condition,
            ...(Array.isArray(item.categories) ? item.categories : []),
            ...(Array.isArray(item.brands) ? item.brands : []),
          ].map(getSafeString).join(' ').toLowerCase();

          return searchable.includes(term);
        });
      }

      // Source taxonomy filters.
      if (
        state.filters.sourceCategory &&
        state.filters.sourceCategory !== ''
      ) {
        const sourceCategory = String(
          state.filters.sourceCategory
        );

        results = results.filter((item: Product) => {
          return getSafeString(
            item.source_category
          ) === sourceCategory;
        });

      }

      if (
        state.filters.sourceSubcategory &&
        state.filters.sourceSubcategory !== ''
      ) {
        const sourceSubcategory = String(
          state.filters.sourceSubcategory
        );

        results = results.filter((item: Product) => {
          return getSafeString(
            item.source_subcategory
          ) === sourceSubcategory;
        });

      }

      // Legacy category/brand filters.
      // Do not apply them when the new source taxonomy filters
      // are active, because MobileShop uses its own taxonomy:
      // source_category and source_subcategory.
      if (
        !state.filters.sourceCategory &&
        !state.filters.sourceSubcategory &&
        state.filters.category &&
        state.filters.category !== ''
      ) {
        const filterCategory: string = String(state.filters.category);
        results = results.filter((item: Product): boolean => {
          return Array.isArray(item.categories) &&
            item.categories.includes(filterCategory);
        });
      }

      if (
        !state.filters.sourceCategory &&
        !state.filters.sourceSubcategory &&
        state.filters.brand &&
        state.filters.brand !== ''
      ) {
        const filterBrand: string = String(state.filters.brand);
        results = results.filter((item: Product): boolean => {
          return Array.isArray(item.brands) &&
            item.brands.includes(filterBrand);
        });
      }

      if (state.filters.minPrice && state.filters.minPrice !== '') {
        const min = Number(state.filters.minPrice);
        if (!isNaN(min)) {
          results = results.filter(item => getSafeNumber(item.price) >= min);
        }
      }
      
      if (state.filters.maxPrice && state.filters.maxPrice !== '') {
        const max = Number(state.filters.maxPrice);
        if (!isNaN(max)) {
          results = results.filter(item => getSafeNumber(item.price) <= max);
        }
      }

      // Apply status filter
      if (state.filters.status && state.filters.status !== '') {
        const status = String(state.filters.status);
        if (status) {
          results = results.filter(item => getSafeString(item.status || item.condition || item.normalized_condition) === status);
        }
      }

      // Apply sorting
      if (state.sortBy) {
        const [field, order] = state.sortBy.split('-') as [string, 'asc' | 'desc'];
        
        results.sort((a, b) => {
          let comparison = 0;
          
          if (field === 'price') {
            comparison = getSafeNumber(a.price) - getSafeNumber(b.price);
          } 
          else if (field === 'rating') {
            comparison = getSafeNumber(a.rating) - getSafeNumber(b.rating);
          } 
          else if (field === 'name') {
            const valueA = getSafeString(a.name).toLowerCase();
            const valueB = getSafeString(b.name).toLowerCase();
            comparison = valueA.localeCompare(valueB);
          }
          else if (field === 'date') {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            comparison = dateA - dateB;
          }
          
          return order === 'asc' ? comparison : -comparison;
        });
      }

      state.filteredProducts = results;
    },
    
    clearFilters: (state) => {
      state.filters = {
        category: '',
        brand: '',
        sourceCategory: '',
        sourceSubcategory: '',
        minPrice: '',
        maxPrice: '',
        status: ''
      };
      state.searchTerm = '';
      state.sortBy = 'rating-desc';
      state.filteredProducts = state.products ? [...state.products] : null;
    },
    localSearch: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      if (!state.products) return;
      
      if (!action.payload.trim()) {
        state.filteredProducts = [...state.products];
        return;
      }
      
      const term = action.payload.toLowerCase().trim();
      const results = state.products.filter(item => {
        const searchable = [
          item.name, item.description, item.category, item.brand,
          item.source_category, item.source_subcategory, item.source,
          item.normalized_brand, item.normalized_model, item.normalized_storage,
          item.normalized_ram, item.normalized_condition,
          ...(Array.isArray(item.categories) ? item.categories : []),
          ...(Array.isArray(item.brands) ? item.brands : []),
        ].map(getSafeString).join(' ').toLowerCase();
        return searchable.includes(term);
      });
      
      state.filteredProducts = results;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle FetchAllProductsThunk states
      .addCase(FetchAllProductsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
.addCase(
    FetchAllProductsThunk.fulfilled,
    (state, action: PayloadAction<FetchProductsResponse>) => {
        state.loading = false;
        state.error = null;

        if (action.payload?.Categories) {
            state.categories = action.payload.Categories;
        }
        
        if (action.payload?.Brands) {
            state.brands = action.payload.Brands;
        }

        if (action.payload?.Category_Brands_Map) {
            state.category_brands_mapping = action.payload.Category_Brands_Map;
           
        }

        if (action.payload?.Products && Array.isArray(action.payload.Products)) {
            state.products = action.payload.Products.map(product => ({
                ...product,
                id: product.id || '',
                name: String(product.name || ''),
                price: Number(product.price) || 0,
                description: String(product.description || ''),
                image_url: product.image_url || '',
                rating: Number(product.rating) || 0,
                reviews_count: Number(product.reviews_count) || 0,
                stock: Number(product.stock) || 100,
                created_at: product.created_at || new Date().toISOString(),
                updated_at: product.updated_at || new Date().toISOString(),
                categories: product.categories || [],
                brands: product.brands || [],
                category: product.categories?.[0] || null,
                brand: product.brands?.[0] || null,
                source: product.source || '',
                source_id: product.source_id || '',
                source_category: product.source_category || '',
                source_subcategory: product.source_subcategory || ''
            }));
            
            state.filteredProducts = [...state.products];
        } else {
            state.products = [];
            state.filteredProducts = [];
            state.category_brands_mapping = [];
        }
    }
)
      .addCase(FetchAllProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load the product catalogue.';
        console.error('Failed to fetch products:', action.error);
      })
      
      // Handle source taxonomy filtering.
      // The main state.products catalogue remains untouched.
      // Only filteredProducts is replaced by the source-specific
      // API result.
      .addCase(FetchSourceFilteredProductsThunk.pending, (state) => {
        state.sourceFiltering = true;
      })
      .addCase(FetchSourceFilteredProductsThunk.fulfilled, (state, action) => {
        state.sourceFiltering = false;

        if (Array.isArray(action.payload)) {
          state.filteredProducts = action.payload.map((product: any) => ({
            ...product,
            id: product.id || '',
            name: String(product.name || ''),
            price: Number(product.price) || 0,
            description: String(product.description || ''),
            image_url: product.image_url || '',
            rating: Number(product.rating) || 0,
            reviews_count: Number(product.reviews_count) || 0,
            stock: Number(product.stock) || 0,
            created_at: product.created_at || new Date().toISOString(),
            updated_at: product.updated_at || new Date().toISOString(),
            categories: product.categories || [],
            brands: product.brands || [],
            category: product.categories?.[0] || null,
            brand: product.brands?.[0] || null,
            source: product.source || '',
            source_id: product.source_id || '',
            source_category: product.source_category || '',
            source_subcategory: product.source_subcategory || ''
          }));
        } else {
          state.filteredProducts = [];
        }
      })
      .addCase(FetchSourceFilteredProductsThunk.rejected, (state, action) => {
        state.sourceFiltering = false;
        console.error(
          'Failed to fetch source-filtered products:',
          action.error
        );
        state.filteredProducts = [];
      })

      // Handle SearchProductThunk states
      .addCase(SearchProductThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(SearchProductThunk.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload && Array.isArray(action.payload) && action.payload.length > 0) {
          state.products = action.payload.map((product: any) => ({
            ...product,
            id: product.id || '',
            name: String(product.name || ''),
            price: Number(product.price) || 0,
            description: String(product.description || ''),
            image_url: product.image_url || '',
            rating: Number(product.rating) || 0,
            reviews_count: Number(product.reviews_count) || 0,
            stock: Number(product.stock) || 0,
            created_at: product.created_at || new Date().toISOString(),
            updated_at: product.updated_at || new Date().toISOString(),
            categories: product.categories || [],
            brands: product.brands || [],
            category: product.categories?.[0] || null,
            brand: product.brands?.[0] || null,
            source: product.source || '',
            source_id: product.source_id || '',
            source_category: product.source_category || '',
            source_subcategory: product.source_subcategory || ''
          }));
          
          state.filteredProducts = [...state.products];
        } else {
          state.products = [];
          state.filteredProducts = [];
        }
      })
      .addCase(SearchProductThunk.rejected, (state, action) => {
        state.loading = false;
        console.error('Failed to search products:', action.error);
      })
      
      // Handle SearchWithSuggestionsThunk
      .addCase(SearchWithSuggestionsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(SearchWithSuggestionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && Array.isArray(action.payload)) {
          state.products = action.payload;
          state.filteredProducts = action.payload;
        }
      })
      .addCase(SearchWithSuggestionsThunk.rejected, (state) => {
        state.loading = false;
      })
      // Handle DeleteProductThunk
      .addCase(DeleteProductThunk.pending, (state) => {
        state.loading = true;})
      .addCase(DeleteProductThunk.fulfilled, (state, action) => {
        console.log('Delete response:', action.payload);
        state.loading = false;
        const deletedProductId = action.payload?.data?.id;
        if (deletedProductId) {
          state.products = state.products?.filter(product => product.id !== deletedProductId) || null;
          state.filteredProducts = state.filteredProducts?.filter(product => product.id !== deletedProductId) || null;
        }
      })
      .addCase(DeleteProductThunk.rejected, (state) => {
        state.loading = false;
      })
      
      
      ;
  }
});

export const { 
  setSearchTerm, 
  setFilters, 
  setSortBy, 
  applyFiltersAndSort,
  clearFilters,
  localSearch 
} = Products.actions;

export default Products.reducer;