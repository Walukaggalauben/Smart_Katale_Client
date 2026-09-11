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
} from '../Slices/productSlice';

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
  } = useAppSelector((state) => state.products);

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

  const results = filteredProducts || [];

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

  if (loading && !filteredProducts) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress
          size="lg"
          variant="soft"
          color="success"
        />
      </Box>
    );
  }

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
        {displayedResults.length > 0 ? (
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
                    image={item.image_url || item.source_image_url}
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
    </Box>
  );
};

export default Shop;
