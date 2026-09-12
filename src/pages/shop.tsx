import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Typography,
  Grid,
  Box,
  Sheet,
  CircularProgress,
  Button,
  IconButton,
  Chip,
  Divider,
} from '@mui/joy';
import {
  Search,
  Tune,
  Close,
  ChevronLeft,
  ChevronRight,
  ShoppingBagOutlined,
  LocalShippingOutlined,
  VerifiedOutlined,
  CompareArrows,
  Close as CloseIcon,
} from '@mui/icons-material';

import SearchInput from '../components/common/searchInput';
import ProductCard from '../components/ui/product_card';
import { useAppDispatch, useAppSelector } from '../types/hooks.types';
import {
  setSearchTerm,
  setFilters,
  setSortBy,
  clearFilters,
  applyFiltersAndSort,
  localSearch,
  FetchAllProductsThunk,
} from '../Slices/productSlice';
import { removeFromCompare, clearCompare } from '../Slices/compareSlice';

const Shop: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    categories,
    loading,
    searchTerm,
    filters,
    sortBy,
    products,
    filteredProducts,
    error: productsError,
  } = useAppSelector((state) => state.products);

  const compareItems = useAppSelector((state) => state.compare.items);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  const searchBarVariants: Variants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 90,
        damping: 18,
      },
    },
  };

  useEffect(() => {
    if (location.state) {
      const initialSearchTerm = location.state.searchTerm;

      if (initialSearchTerm) {
        dispatch(setSearchTerm(initialSearchTerm));
        dispatch(localSearch(initialSearchTerm));

        navigate(location.pathname, {
          replace: true,
          state: {},
        });
      }
    }
  }, [location, dispatch, navigate]);

  useEffect(() => {
    if (!products) return;

    // Source taxonomy is now filtered against the complete master
    // catalogue. Do not replace it with MobileShop-only results.
    dispatch(applyFiltersAndSort());
  }, [
    searchTerm,
    filters.sourceCategory,
    filters.sourceSubcategory,
    filters.category,
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.status,
    sortBy,
    products,
    dispatch,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortBy, filteredProducts?.length]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSetSearchTerm = (term: string) => {
    dispatch(setSearchTerm(term));
    dispatch(localSearch(term));
  };

  const handleSetFilters = (
    newFilters: Partial<typeof filters>
  ) => {
    dispatch(setFilters(newFilters));
  };

  const handleSetSortBy = (sort: string) => {
    dispatch(setSortBy(sort));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Keep the customer-facing catalogue clean when multiple source records
  // represent the same product. We do not delete the underlying records.
  const results = useMemo(() => {
    const sourceResults = filteredProducts || [];
    const seen = new Set<string>();
    const unique: typeof sourceResults = [];

    for (const item of sourceResults) {
      const normalizedName = String(item.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const normalizedStatus = String(item.status || item.condition || '')
        .toLowerCase()
        .trim();
      const key = `${normalizedName}|${normalizedStatus}`;

      if (!normalizedName || seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }

    return unique;
  }, [filteredProducts]);

  const displayedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return results.slice(startIndex, startIndex + itemsPerPage);
  }, [results, currentPage, itemsPerPage]);

  const totalResults = results.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(filters.category) ||
    Boolean(filters.brand) ||
    Boolean(filters.sourceCategory) ||
    Boolean(filters.sourceSubcategory) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.status);

  const initialCatalogueLoading = loading && !products;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '#f7f9f8',
        pb: 10,
      }}
    >
      {/* =========================================================
          SHOP HERO
      ========================================================= */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, #003d22 0%, #006b3c 55%, #008f55 100%)',
          color: '#fff',
          px: { xs: 2, md: 5 },
          py: { xs: 4, md: 5 },
          mb: 3,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
            right: -80,
            top: -120,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
            right: 120,
            bottom: -110,
          }}
        />

        <Box
          sx={{
            maxWidth: 1400,
            mx: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Chip
            variant="soft"
            sx={{
              mb: 1.5,
              bgcolor: 'rgba(255,255,255,0.12)',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            MINIFY GADGETS
          </Chip>

          <Typography
            level="h1"
            sx={{
              color: '#fff',
              fontWeight: 900,
              fontSize: {
                xs: '2rem',
                sm: '2.5rem',
                md: '3.2rem',
              },
              lineHeight: 1.05,
              maxWidth: 700,
            }}
          >
            Shop the latest gadgets
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.82)',
              mt: 1.5,
              maxWidth: 650,
              fontSize: { xs: '0.95rem', md: '1.05rem' },
            }}
          >
            Discover smartphones, tablets and more from trusted
            brands at competitive prices.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              mt: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.5,
                py: 0.8,
                borderRadius: '999px',
                bgcolor: 'rgba(255,255,255,0.1)',
              }}
            >
              <VerifiedOutlined sx={{ fontSize: 18 }} />
              <Typography level="body-sm" sx={{ color: '#fff' }}>
                Quality Products
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.5,
                py: 0.8,
                borderRadius: '999px',
                bgcolor: 'rgba(255,255,255,0.1)',
              }}
            >
              <LocalShippingOutlined sx={{ fontSize: 18 }} />
              <Typography level="body-sm" sx={{ color: '#fff' }}>
                Fast Delivery
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.5,
                py: 0.8,
                borderRadius: '999px',
                bgcolor: 'rgba(255,255,255,0.1)',
              }}
            >
              <ShoppingBagOutlined sx={{ fontSize: 18 }} />
              <Typography level="body-sm" sx={{ color: '#fff' }}>
                Easy Shopping
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          px: { xs: 1.5, sm: 2, md: 4 },
        }}
      >
        {initialCatalogueLoading && (
          <Sheet variant="soft" color="success" sx={{ mb: 2, p: 1.5, borderRadius: 'lg', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size="sm" color="success" />
            <Typography level="body-sm" sx={{ fontWeight: 700 }}>Loading the catalogue…</Typography>
          </Sheet>
        )}
        {productsError && (
          <Sheet variant="soft" color="danger" sx={{ mb: 2, p: 1.5, borderRadius: 'lg', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography level="body-sm" sx={{ fontWeight: 700 }}>We could not load the catalogue. Your search will work again once the connection is restored.</Typography>
            <Button size="sm" color="success" onClick={() => dispatch(FetchAllProductsThunk(5000))}>Retry</Button>
          </Sheet>
        )}

        {/* =========================================================
            SEARCH / FILTER AREA
        ========================================================= */}
        <motion.div
          variants={searchBarVariants}
          initial="hidden"
          animate="visible"
        >
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: 'xl',
              p: { xs: 1.5, md: 2 },
              bgcolor: '#fff',
              boxShadow: 'sm',
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: { xs: 1, md: 1.5 },
              }}
            >
              <Box>
                <Typography
                  level="title-lg"
                  sx={{ fontWeight: 800 }}
                >
                  Find your gadget
                </Typography>

                <Typography
                  level="body-sm"
                  textColor="text.secondary"
                >
                  Search our latest collection
                </Typography>
              </Box>

              <Button
                size="sm"
                variant={showFilters ? 'solid' : 'outlined'}
                color="success"
                startDecorator={<Tune />}
                onClick={() => setShowFilters((value) => !value)}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  borderRadius: 'lg',
                }}
              >
                Filters
              </Button>
            </Box>

            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={handleSetSearchTerm}
              filters={filters}
              setFilters={handleSetFilters}
              sortBy={sortBy}
              setSortBy={handleSetSortBy}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              categories={categories?.map((cat) => cat) || []}
              totalResults={totalResults}
              onClearFilters={handleClearFilters}
              sortOptions={[
                {
                  field: 'name',
                  order: 'asc',
                  label: 'Name (A to Z)',
                },
                {
                  field: 'name',
                  order: 'desc',
                  label: 'Name (Z to A)',
                },
                {
                  field: 'price',
                  order: 'asc',
                  label: 'Price (Low to High)',
                },
                {
                  field: 'price',
                  order: 'desc',
                  label: 'Price (High to Low)',
                },
                {
                  field: 'date',
                  order: 'desc',
                  label: 'Newest First',
                },
                {
                  field: 'date',
                  order: 'asc',
                  label: 'Oldest First',
                },
              ]}
              itemsPerPageOptions={[
                10,
                20,
                30,
                50,
                100,
                200,
              ]}
              hideFilters={false}
              status="all"
              onSearch={() => {}}
            />
          </Sheet>
        </motion.div>

        {/* =========================================================
            RESULTS HEADER
        ========================================================= */}
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box>
            <Typography
              level="h3"
              sx={{
                fontWeight: 900,
                color: '#10251b',
              }}
            >
              All Products
            </Typography>

            <Typography
              level="body-sm"
              textColor="text.secondary"
              sx={{ mt: 0.3 }}
            >
              {totalResults.toLocaleString()} product
              {totalResults === 1 ? '' : 's'} available
            </Typography>
          </Box>

          {hasActiveFilters && (
            <Button
              size="sm"
              variant="plain"
              color="danger"
              startDecorator={<Close />}
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* =========================================================
            PRODUCT GRID
        ========================================================= */}
        {initialCatalogueLoading ? (
          <Sheet
            variant="outlined"
            sx={{
              minHeight: 360,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              borderRadius: 'xl',
              bgcolor: '#fff',
            }}
          >
            <CircularProgress color="success" size="lg" />
            <Typography level="title-md" sx={{ fontWeight: 800 }}>
              Loading products…
            </Typography>
            <Typography level="body-sm" textColor="text.secondary">
              Preparing the catalogue for you.
            </Typography>
          </Sheet>
        ) : displayedResults.length > 0 ? (
          <>
            <Grid
              container
              spacing={{ xs: 1, sm: 1.75, md: 2.25 }}
              sx={{
                mb: 5,
              }}
            >
              {displayedResults.map((item) => (
                <Grid
                  key={item.id}
                  xs={6}
                  sm={4}
                  md={3}
                  lg={2.4}
                  xl={2.4}
                  sx={{
                    display: 'flex',
                  }}
                >
                  <ProductCard
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    image={item.source_image_url || item.image_url}
                    discount={item.discount}
                    rating={item.rating}
                    reviews_count={item.reviews_count}
                    views_count={item.views_count}
                    description={item.description}
                    status={item.status || item.condition}
                  />
                </Grid>
              ))}
            </Grid>

            {/* =====================================================
                PAGINATION
            ===================================================== */}
            {totalPages > 1 && (
              <Sheet
                variant="outlined"
                sx={{
                  borderRadius: 'xl',
                  p: 2,
                  mb: 5,
                  bgcolor: '#fff',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography
                    level="body-sm"
                    textColor="text.secondary"
                  >
                    Showing{' '}
                    {((currentPage - 1) * itemsPerPage) + 1}
                    {' – '}
                    {Math.min(
                      currentPage * itemsPerPage,
                      totalResults
                    )}{' '}
                    of {totalResults}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="sm"
                      variant="outlined"
                      color="success"
                      onClick={() =>
                        handlePageChange(currentPage - 1)
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft />
                    </IconButton>

                    <Sheet
                      variant="soft"
                      color="success"
                      sx={{
                        px: 2,
                        py: 0.8,
                        borderRadius: 'md',
                      }}
                    >
                      <Typography
                        level="body-sm"
                        sx={{ fontWeight: 800 }}
                      >
                        {currentPage} / {totalPages}
                      </Typography>
                    </Sheet>

                    <IconButton
                      size="sm"
                      variant="outlined"
                      color="success"
                      onClick={() =>
                        handlePageChange(currentPage + 1)
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight />
                    </IconButton>
                  </Box>
                </Box>
              </Sheet>
            )}
          </>
        ) : (
          /* =======================================================
             EMPTY STATE
          ======================================================= */
          <Sheet
            variant="outlined"
            sx={{
              py: { xs: 7, md: 10 },
              px: 3,
              textAlign: 'center',
              borderRadius: 'xl',
              bgcolor: '#fff',
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: 'auto',
                mb: 2,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#e9f6ef',
                color: '#006b3c',
              }}
            >
              <Search sx={{ fontSize: 34 }} />
            </Box>

            <Typography
              level="h3"
              sx={{ fontWeight: 900, mb: 1 }}
            >
              No products found
            </Typography>

            <Typography
              level="body-md"
              textColor="text.secondary"
              sx={{
                maxWidth: 500,
                mx: 'auto',
                mb: 3,
              }}
            >
              {products?.length === 0
                ? 'Our product catalogue is currently empty. Please check back soon.'
                : 'We could not find anything matching your search or filters.'}
            </Typography>

            {hasActiveFilters && (
              <Button
                color="success"
                variant="solid"
                onClick={handleClearFilters}
                sx={{
                  borderRadius: 'lg',
                  fontWeight: 800,
                }}
              >
                View all products
              </Button>
            )}
          </Sheet>
        )}
      </Box>

      {compareItems.length > 0 && (
        <Sheet
          variant="solid"
          color="success"
          sx={{
            position: 'fixed',
            left: { xs: 8, sm: 20 },
            right: { xs: 8, sm: 20 },
            bottom: { xs: 8, sm: 18 },
            zIndex: 1200,
            maxWidth: 900,
            mx: 'auto',
            p: { xs: 1, sm: 1.25 },
            borderRadius: 'xl',
            boxShadow: '0 16px 45px rgba(0,0,0,.22)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flex: 1, minWidth: 180 }}>
            <CompareArrows />
            <Typography sx={{ color: '#fff', fontWeight: 900 }}>{compareItems.length}/3 selected</Typography>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.6, flexWrap: 'wrap' }}>
              {compareItems.map((item) => (
                <Chip key={item.id} size="sm" variant="soft" sx={{ bgcolor: 'rgba(255,255,255,.12)', color: '#fff' }} endDecorator={<CloseIcon sx={{ fontSize: 14 }} onClick={() => dispatch(removeFromCompare(item.id))} />}>
                  {item.name || 'Product'}
                </Chip>
              ))}
            </Box>
          </Box>
          <Button size="sm" variant="solid" sx={{ bgcolor: '#fff', color: '#006b3c', fontWeight: 900, '&:hover': { bgcolor: '#f1f5f2' } }} onClick={() => navigate('/compare')}>Compare now</Button>
          <Button size="sm" variant="plain" sx={{ color: '#fff' }} onClick={() => dispatch(clearCompare())}>Clear</Button>
        </Sheet>
      )}
    </Box>
  );
};

export default Shop;
