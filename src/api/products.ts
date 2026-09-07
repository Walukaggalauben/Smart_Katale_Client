import axios from "axios"
import { API_URL } from "../configs"
import type { ProductDetailsProps } from "../interfaces/products.interfaces";

let All_Categories:string[] = []
let All_Brands:string[] = []
const categoryBrandMap: Record<string, string[]> = {};



export const FetchAllProducts = async (limit: number) => {
    try {
        const res = await axios.get(`${API_URL}/products/?limit=${limit}`);
        if (res?.status === 200) {
            const productsData = res.data;
            
            // Reset arrays
            All_Categories = [];
            All_Brands = [];

            // Reset category/brand mapping on every fetch.
            Object.keys(categoryBrandMap).forEach((key) => {
                delete categoryBrandMap[key];
            });

            
            productsData.forEach((product: any) => {
                const productCategories = product.categories ?? [];
                const productBrands = product.brands ?? [];
                
                // Collect unique categories
                productCategories.forEach((name: string) => {
                    if (!All_Categories.includes(name)) {
                        All_Categories.push(name);
                    }
                });
                
                // Collect unique brands
                productBrands.forEach((name: string) => {
                    if (!All_Brands.includes(name)) {
                        All_Brands.push(name);
                    }
                });
                
                // Build category-brand mapping as plain object
                productCategories.forEach((category: string) => {
                    if (!categoryBrandMap[category]) {
                        categoryBrandMap[category] = [];
                    }
                    
                    productBrands.forEach((brand: string) => {
                        if (!categoryBrandMap[category].includes(brand)) {
                            categoryBrandMap[category].push(brand);
                        }
                    });
                });
            });
            
            // Convert to array format if needed for your slice
            const categoryBrandsArray = Object.entries(categoryBrandMap).map(([category, brands]) => ({
                cat: category,
                brands: brands
            }));
            
            return {
                Categories: All_Categories,
                Brands: All_Brands,
                Products: productsData,
                Category_Brands_Map: categoryBrandsArray 
            };
        }
        return { Categories: [], Brands: [], Products: [], Category_Brands_Map: [] };
    } catch (error) {
        console.error('Error fetching products:', error);
        return { Categories: [], Brands: [], Products: [], Category_Brands_Map: [] };
    }
};

export interface ProductTaxonomy {
    [source: string]: {
        [category: string]: string[];
    };
}

const productTaxonomyCache = new Map<string, ProductTaxonomy>();
const productTaxonomyRequests = new Map<
    string,
    Promise<ProductTaxonomy>
>();

export const FetchProductTaxonomy = async (
    source = "mobileshop.ug"
): Promise<ProductTaxonomy> => {
    const cacheKey = source.trim().toLowerCase();

    // Return the already-loaded taxonomy without another HTTP request.
    const cached = productTaxonomyCache.get(cacheKey);

    if (cached) {
        return cached;
    }

    // Share an in-flight request if another component is already loading
    // the same taxonomy.
    const existingRequest = productTaxonomyRequests.get(cacheKey);

    if (existingRequest) {
        return existingRequest;
    }

    const request = axios.get(
        `${API_URL}/products/taxonomy/?source=${encodeURIComponent(source)}`
    )
        .then((response) => {
            if (response?.status === 200 && response.data) {
                const data = response.data as ProductTaxonomy;

                productTaxonomyCache.set(cacheKey, data);

                return data;
            }

            return {};
        })
        .catch((error) => {
            console.error("Error fetching product taxonomy:", error);
            return {};
        })
        .finally(() => {
            productTaxonomyRequests.delete(cacheKey);
        });

    productTaxonomyRequests.set(cacheKey, request);

    return request;
};

export const FetchProductsBySourceFilter = async (
    source = "mobileshop.ug",
    sourceCategory = "",
    sourceSubcategory = "",
    limit = 5000
) => {
    try {
        const params = new URLSearchParams();

        params.set("source", source);
        params.set("limit", String(limit));

        if (sourceCategory) {
            params.set("source_category", sourceCategory);
        }

        if (sourceSubcategory) {
            params.set("source_subcategory", sourceSubcategory);
        }

        const response = await axios.get(
            `${API_URL}/products/?${params.toString()}`
        );

        if (response?.status === 200 && Array.isArray(response.data)) {
            return response.data;
        }

        return [];
    } catch (error) {
        console.error("Error fetching source-filtered products:", error);
        return [];
    }
};

export const SearchProduct = async (search_term: string, limit = 50) => {
    try {
        const response = await axios.get(`${API_URL}/products/?name=${search_term}&limit=${limit}`);

        
        if (response?.status === 200) {
return response?.data
           
        }
        return [];
    } catch (error) {
        console.error('Error searching products:', error);
        return [];
    }
};

export const FetchProductData = async (product_id: string|number) : Promise<ProductDetailsProps | null> => {
    try {
        const response = await axios.get(`${API_URL}/products/${product_id}`);
        if (response?.status === 200) {
            return response.data as ProductDetailsProps;
        }
        return null;
    } catch (error) {
        console.error('Error fetching product data:', error);
        return null;
    }
};

export const UpdateProduct = async (product_id: string|number, updatedData: any) => {
    try {
        const response = await axios.put(`${API_URL}/products/${product_id}/`, JSON.stringify({
            name: updatedData.product_name,
            description: updatedData.product_description,
            price: updatedData.product_price,
            stock: updatedData.product_stock,
            categories: updatedData.product_categories,
            brands: updatedData.product_brands,
            image_url: updatedData.product_image_url
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

      return response} 
      
        catch (error) {
        console.error('Error updating product:', error);
        }
    }
export const UpdateOrderStatus = async (order_id: string|number, status: string) => {
    console.log({order_id,status})
    try {
        const response = await axios.put(`${API_URL}/orders/${order_id}/`, JSON.stringify({
            status
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200){
    return response} 
        }

  
      
        catch (error) {
        console.error('Error updating product:', error);
        }
    }

export const DeleteProduct = async (product_id: string|number) => {
    try {
        const response = await axios.delete(`${API_URL}/products/${product_id}/`);
        return response?.data;
    }catch (error) {
        console.error('Error deleting product:', error);
        return null;
    }


}

