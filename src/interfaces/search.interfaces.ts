import type { FilterState } from "../types/search";

export interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  sortBy: string;
  status: string;
  setSortBy: (sort: string) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  categories: string[];
  totalResults: number;
  onClearFilters: () => void;
  sortOptions: Array<{
    field: string;
    label: string;
    order: 'asc' | 'desc';
  }>;
  itemsPerPageOptions: number[];
  hideFilters?: boolean;
  onSearch?: () => void;
}

/*
 * Search dropdown suggestions are now PRODUCT ONLY.
 *
 * We intentionally do not use separate
 * product / brand / category suggestion types.
 */
export interface SearchSuggestion {
  id: string | number;
  label: string;
  type: 'product';
  value: string;
  productId: string | number;
  image?: string;
  price?: number;
}
