import React, { useState, useEffect } from 'react';
import {
  Box,
  Sheet,
  FormControl,
  FormLabel,
  Select,
  Option,
  Button,
  Stack,
  Chip,
  Typography,
  Autocomplete,
} from '@mui/joy';
import {
  Search,
  FilterList,
  Sort,
  Close,
} from '@mui/icons-material';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';
import type { FilterState } from '../../types/search';
import { useAppSelector } from '../../types/hooks.types';
import type {
  SearchInputProps,
  SearchSuggestion,
} from '../../interfaces/search.interfaces';

const SearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  sortBy,
  setSortBy,
  itemsPerPage,
  setItemsPerPage,
  showFilters,
  setShowFilters,
  categories,
  totalResults,
  onClearFilters,
  sortOptions,
  itemsPerPageOptions,
  hideFilters = false,
  onSearch,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isShopPage = location.pathname === '/shop';

  // Kept for compatibility with the parent component.
  void categories;

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [inputValue, setInputValue] = useState(searchTerm);
  const [open, setOpen] = useState(false);

  const { products } = useAppSelector(
    (state) => state.products
  );

  const [taxonomy, setTaxonomy] = useState<{
    categories: string[];
    subcategories: string[];
    conditions: string[];
  }>({
    categories: [],
    subcategories: [],
    conditions: [],
  });

  useEffect(() => {
    // Build taxonomy from the complete master catalogue so filters
    // include Jumia, MobileShop, 256 Genuine Gadgets and legacy stock.
    const sourceProducts = (products || []).filter((product: any) =>
      String(product.source_category || '').trim() ||
      String(product.source_subcategory || '').trim()
    );

    const categories = Array.from(
      new Set(
        sourceProducts
          .map((product: any) => String(product.source_category || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    const selectedCategory = filters.sourceCategory || '';

    const subcategories = Array.from(
      new Set(
        sourceProducts
          .filter((product: any) =>
            !selectedCategory ||
            String(product.source_category || '').trim() === selectedCategory
          )
          .map((product: any) => String(product.source_subcategory || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    const conditions = Array.from(new Set(
      sourceProducts.map((product: any) => String(product.status || product.condition || product.normalized_condition || '').trim()).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));

    setTaxonomy({ categories, subcategories, conditions });
  }, [products, filters.sourceCategory]);

  /*
   * Keep the local input synchronized with Redux.
   */
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  /*
   * Generate simple product suggestions.
   *
   * The dropdown shows PRODUCTS only.
   * It does not show "Product:", "Brand:",
   * or "Category:" labels.
   */
  useEffect(() => {
    const term = inputValue.trim().toLowerCase();

    if (!term) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      const newSuggestions: SearchSuggestion[] = [];

      if (products && products.length > 0) {
        products.forEach((product: any) => {
          const name =
            typeof product.name === 'string'
              ? product.name
              : '';

          if (!name) {
            return;
          }

          const brand =
            typeof product.brand === 'string'
              ? product.brand
              : '';

          const category =
            typeof product.category === 'string'
              ? product.category
              : '';

          /*
           * Allow searching by product name,
           * brand or category, but ALWAYS display
           * the actual product as the result.
           */
          const searchableText = [
            name, brand, category,
            product.source_category, product.source_subcategory,
            product.source, product.normalized_brand, product.normalized_model,
            product.normalized_storage, product.normalized_ram, product.normalized_condition,
            ...(Array.isArray(product.categories) ? product.categories : []),
            ...(Array.isArray(product.brands) ? product.brands : []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!searchableText.includes(term)) {
            return;
          }

          const productId =
            product.id ??
            product.product_id;

          if (
            productId === undefined ||
            productId === null
          ) {
            return;
          }

          const image =
            product.image ||
            product.image_url ||
            product.thumbnail ||
            (
              Array.isArray(product.images)
                ? product.images[0]
                : ''
            ) ||
            '';

          const price = Number(
            product.price || 0
          );

          newSuggestions.push({
            id: `product-${productId}`,
            label: name,
            type: 'product',
            value: name,
            productId,
            image,
            price,
          });
        });
      }

      /*
       * Remove duplicate products.
       */
      const uniqueSuggestions =
        newSuggestions.filter(
          (item, index, array) =>
            array.findIndex(
              (other) =>
                String(other.productId) ===
                String(item.productId)
            ) === index
        );

      /*
       * Keep the dropdown clean.
       */
      setSuggestions(
        uniqueSuggestions.slice(0, 8)
      );

      setOpen(
        uniqueSuggestions.length > 0
      );
    }, 120);

    return () => clearTimeout(timer);
  }, [inputValue, products]);

  /*
   * Search immediately while typing.
   */
  useEffect(() => {
    const term = inputValue.trim();

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        setSearchTerm(term);

        if (onSearch) {
          await onSearch();
        }
      } catch (error) {
        console.error('Live search error:', error);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | number
  ) => {
    setFilters({
      ...filters,
      [key]:
        value === ''
          ? ''
          : typeof value === 'string' &&
              !isNaN(Number(value))
            ? Number(value)
            : value,
    });
  };

  const handleSearch = async () => {
    setLoading(true);

    try {
      setSearchTerm(inputValue.trim());

      if (onSearch) {
        await onSearch();
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }

    setOpen(false);
  };

  const handleSuggestionSelect = (
    _event: React.SyntheticEvent,
    value: SearchSuggestion | string | null
  ) => {
    if (!value) {
      return;
    }

    /*
     * If the user enters text manually,
     * keep it in the search field.
     */
    if (typeof value === 'string') {
      setInputValue(value);
      setSearchTerm(value);
      setOpen(false);
      return;
    }

    /*
     * When a PRODUCT is selected from the
     * dropdown, go directly to its details page.
     */
    if (
      value.type === 'product' &&
      value.productId !== undefined &&
      value.productId !== null
    ) {
      setOpen(false);

      navigate(
        `/product-details/${value.productId}`
      );

      return;
    }

    setOpen(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }

    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'transparent',
      }}
    >
      <Sheet
        variant="plain"
        sx={{
          p: 0,
          width: '100%',
          backgroundColor: 'transparent',
        }}
      >
        <Stack spacing={2} sx={{ width: '100%' }}>

          {/* =====================================================
              PREMIUM SEARCH BAR
          ===================================================== */}
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              gap: 0,
              alignItems: 'stretch',
              border: '2px solid',
              borderColor: 'success.500',
              borderRadius: 'lg',
              overflow: 'hidden',
              bgcolor: '#fff',
              boxShadow:
                '0 3px 14px rgba(0,0,0,0.07)',
              transition: 'all .2s ease',
              '&:focus-within': {
                boxShadow:
                  '0 5px 20px rgba(0,105,92,0.18)',
              },
            }}
          >
            <Autocomplete
              placeholder="Search for products..."
              value={inputValue}
              onInputChange={(_, newValue) => {
                setInputValue(newValue);
              }}
              inputValue={inputValue}
              options={suggestions}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }

                return option.label;
              }}
              isOptionEqualToValue={(
                option,
                value
              ) => {
                if (typeof value === 'string') {
                  return false;
                }

                return option.id === value?.id;
              }}
              onChange={handleSuggestionSelect}
              onKeyDown={handleKeyDown}
              onOpen={() => {
                if (suggestions.length > 0) {
                  setOpen(true);
                }
              }}
              onClose={() => setOpen(false)}
              open={
                open &&
                suggestions.length > 0
              }
              loading={loading}
              freeSolo
              autoComplete={false}
              startDecorator={
                <Search
                  sx={{
                    color: 'success.600',
                    fontSize: 24,
                  }}
                />
              }
              size="lg"
              sx={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                '--Input-focusedThickness': '0px',
                '& .MuiInput-root': {
                  border: 'none',
                  boxShadow: 'none',
                  minHeight: 56,
                },
                '& input': {
                  fontSize: {
                    xs: '0.88rem',
                    sm: '0.95rem',
                  },
                },
              }}
              renderOption={(
                props,
                option
              ) => {
                const {
                  key,
                  ...otherProps
                } = props as any;

                return (
                  <li
                    key={key}
                    {...otherProps}
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        width: '100%',
                        py: 0.8,
                      }}
                    >
                      {/* Product image */}
                      <Box
                        sx={{
                          width: 58,
                          height: 58,
                          minWidth: 58,
                          borderRadius: 'sm',
                          overflow: 'hidden',
                          bgcolor: '#f5f7f8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {option.image ? (
                          <img
                            src={option.image}
                            alt={option.label}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        ) : (
                          <Search
                            sx={{
                              color: 'success.400',
                              fontSize: 24,
                            }}
                          />
                        )}
                      </Box>

                      {/* Product name + price */}
                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Typography
                          level="body-sm"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {option.label}
                        </Typography>

                        {option.price !== undefined &&
                          option.price > 0 && (
                            <Typography
                              level="body-sm"
                              sx={{
                                fontWeight: 800,
                                color: 'success.700',
                                mt: 0.25,
                              }}
                            >
                              UGX{' '}
                              {option.price.toLocaleString()}
                            </Typography>
                          )}
                      </Box>
                    </Box>
                  </li>
                );
              }}
            />

            <Button
              variant="solid"
              color="success"
              loading={loading}
              onClick={handleSearch}
              startDecorator={
                !loading && (
                  <Search
                    sx={{
                      fontSize: 21,
                    }}
                  />
                )
              }
              size="lg"
              sx={{
                minWidth: {
                  xs: 58,
                  sm: 120,
                },
                px: {
                  xs: 1.5,
                  sm: 3,
                },
                borderRadius: 0,
                fontWeight: 900,
                alignSelf: 'stretch',
              }}
            >
              <Box
                sx={{
                  display: {
                    xs: 'none',
                    sm: 'block',
                  },
                }}
              >
                {loading
                  ? 'Searching…'
                  : 'Search'}
              </Box>
            </Button>
          </Box>

          {/* =====================================================
              LIVE SEARCH STATUS
          ===================================================== */}
          {loading && inputValue.trim() && (
            <Typography
              level="body-xs"
              sx={{
                color: 'success.700',
                fontWeight: 700,
                mt: -1,
                px: 0.5,
              }}
            >
              Searching for “{inputValue}”…
            </Typography>
          )}

          {/* =====================================================
              FILTERS
          ===================================================== */}
          {isShopPage && !hideFilters && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  mb: 2,
                  gap: 1.5,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <Button
                  variant={
                    showFilters
                      ? 'solid'
                      : 'outlined'
                  }
                  color="success"
                  startDecorator={
                    <FilterList />
                  }
                  onClick={() =>
                    setShowFilters(
                      !showFilters
                    )
                  }
                  sx={{
                    borderRadius: 'lg',
                    fontWeight: 800,
                  }}
                >
                  Filters
                </Button>

                <FormControl
                  sx={{
                    minWidth: {
                      xs: 'calc(50% - 8px)',
                      sm: 180,
                    },
                  }}
                >
                  <FormLabel
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Sort by
                  </FormLabel>

                  <Select
                    size="sm"
                    value={
                      sortBy || ''
                    }
                    startDecorator={<Sort />}
                    onChange={(
                      _,
                      value
                    ) => {
                      const option =
                        sortOptions.find(
                          (item) =>
                            `${item.field}-${item.order}` ===
                            value
                        );

                      if (option) {
                        setSortBy(
                          option as any
                        );
                      }
                    }}
                  >
                    {sortOptions.map(
                      (option) => (
                        <Option
                          key={`${option.field}-${option.order}`}
                          value={`${option.field}-${option.order}`}
                        >
                          {option.label}
                        </Option>
                      )
                    )}
                  </Select>
                </FormControl>

                <FormControl
                  sx={{
                    minWidth: {
                      xs: 'calc(50% - 8px)',
                      sm: 150,
                    },
                  }}
                >
                  <FormLabel
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Products per page
                  </FormLabel>

                  <Select
                    size="sm"
                    value={itemsPerPage}
                    onChange={(
                      _,
                      value
                    ) => {
                      if (value) {
                        setItemsPerPage(
                          Number(value)
                        );
                      }
                    }}
                  >
                    {itemsPerPageOptions.map(
                      (option) => (
                        <Option
                          key={option}
                          value={option}
                        >
                          {option}
                        </Option>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>

              {showFilters && (
                <Box sx={{ width: '100%' }}>
                  <Box
                    sx={{
                      display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(4, 1fr)',
                    },
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <FormControl>
                    <FormLabel
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      Category
                    </FormLabel>

                    <Select
                      size="sm"
                      value={
                        filters.sourceCategory || null
                      }
                      placeholder="All categories"
                      onChange={(_, value) => {
                        setFilters({
                          ...filters,
                          sourceCategory: value || '',
                          sourceSubcategory: '',
                        });
                      }}
                    >
                      {taxonomy.categories.map(
                        (category) => (
                          <Option
                            key={category}
                            value={category}
                          >
                            {category}
                          </Option>
                        )
                      )}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      Subcategory
                    </FormLabel>

                    <Select
                      size="sm"
                      value={
                        filters.sourceSubcategory || null
                      }
                      placeholder="All subcategories"
                      onChange={(_, value) => {
                        setFilters({
                          ...filters,
                          sourceSubcategory: value || '',
                        });
                      }}
                    >
                      {taxonomy.subcategories.map(
                        (subcategory) => (
                          <Option
                            key={subcategory}
                            value={subcategory}
                          >
                            {subcategory}
                          </Option>
                        )
                      )}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      Condition
                    </FormLabel>

                    <Select
                      size="sm"
                      value={filters.status || null}
                      placeholder="All conditions"
                      onChange={(_, value) => setFilters({ ...filters, status: value || '' })}
                    >
                      {taxonomy.conditions.map((condition) => (
                        <Option key={condition} value={condition}>{condition}</Option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      Min price
                    </FormLabel>

                    <input
                      type="number"
                      value={
                        filters.minPrice || ''
                      }
                      placeholder="Minimum"
                      onChange={(event) =>
                        setFilters({
                          ...filters,
                          minPrice: event.target.value,
                        })
                      }
                      style={{
                        height: 40,
                        borderRadius: 8,
                        border: '1px solid #dce9e1',
                        padding: '0 10px',
                        fontSize: 14,
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      Max price
                    </FormLabel>

                    <input
                      type="number"
                      value={
                        filters.maxPrice || ''
                      }
                      placeholder="Maximum"
                      onChange={(event) =>
                        setFilters({
                          ...filters,
                          maxPrice: event.target.value,
                        })
                      }
                      style={{
                        height: 40,
                        borderRadius: 8,
                        border: '1px solid #dce9e1',
                        padding: '0 10px',
                        fontSize: 14,
                      }}
                    />
                  </FormControl>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    p: 1.5,
                    borderRadius: 'lg',
                    bgcolor: '#f7faf8',
                    border:
                      '1px solid #dce9e1',
                  }}
                >
                  {filters.category && (
                    <Chip
                      size="sm"
                      color="success"
                      variant="soft"
                      endDecorator={
                        <Close
                          sx={{
                            fontSize: 15,
                          }}
                        />
                      }
                      onClick={() =>
                        handleFilterChange(
                          'category',
                          ''
                        )
                      }
                    >
                      {filters.category}
                    </Chip>
                  )}

                  {filters.brand && (
                    <Chip
                      size="sm"
                      color="success"
                      variant="soft"
                      endDecorator={
                        <Close
                          sx={{
                            fontSize: 15,
                          }}
                        />
                      }
                      onClick={() =>
                        handleFilterChange(
                          'brand',
                          ''
                        )
                      }
                    >
                      {filters.brand}
                    </Chip>
                  )}

                  {(filters.minPrice ||
                    filters.maxPrice) && (
                    <Chip
                      size="sm"
                      color="success"
                      variant="soft"
                    >
                      Price filter
                    </Chip>
                  )}

                  {totalResults >= 0 && (
                    <Typography
                      level="body-xs"
                      sx={{
                        alignSelf:
                          'center',
                        ml: 'auto',
                        fontWeight: 700,
                        color:
                          'text.secondary',
                      }}
                    >
                      {totalResults.toLocaleString()}{' '}
                      results
                    </Typography>
                  )}

                  <Button
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={
                      onClearFilters
                    }
                  >
                    Clear all
                  </Button>
                </Box>
                </Box>
              )}
            </>
          )}
        </Stack>
      </Sheet>
    </Box>
  );
};

export default SearchInput;
