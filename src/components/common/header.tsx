import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Input,
  Sheet,
  Typography,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Chip,
} from '@mui/joy';
import {
  Search,
  ShoppingCartOutlined,
  PersonOutline,
  KeyboardArrowDown,
  LocalShippingOutlined,
  PhoneIphoneOutlined,
  LaptopMacOutlined,
  TvOutlined,
  HeadphonesOutlined,
  WatchOutlined,
  CableOutlined,
  Close,
  Menu as MenuIcon,
  FavoriteBorder,
  LocalOfferOutlined,
  CompareArrows,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../types/hooks.types';
import { LogoutThunk } from '../../Slices/userSlice';
import { SearchProduct } from '../../api/products';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [currency, setCurrency] = useState('UGX');

  const [topSearchSuggestions, setTopSearchSuggestions] = useState<any[]>([]);
  const [topSearchOpen, setTopSearchOpen] = useState(false);

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const compareItems = useAppSelector((state) => state.compare.items);
  const { is_authenticated, role, first_name, email } = useAppSelector((state) => state.user);

  // ---------------------------------------------------------
  // TOP SEARCH LIVE PRODUCT SUGGESTIONS
  // Completely independent from the Shop page search.
  //
  // IMPORTANT:
  // We query the API directly instead of relying only on the
  // products already loaded into Redux.
  // ---------------------------------------------------------
  useEffect(() => {
    const term = searchValue.trim();

    if (!term) {
      setTopSearchSuggestions([]);
      setTopSearchOpen(false);
      setSearching(false);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      try {
        setSearching(true);

        const results = await SearchProduct(term, 50);

        if (cancelled) {
          return;
        }

        const productResults = Array.isArray(results)
          ? results
          : Array.isArray(results?.Products)
            ? results.Products
            : Array.isArray(results?.results)
              ? results.results
              : [];

        const uniqueProducts = productResults
          .filter((product: any) => product?.id !== undefined)
          .filter((product: any, index: number, array: any[]) => {
            return (
              array.findIndex(
                (item: any) =>
                  String(item?.id) === String(product?.id)
              ) === index
            );
          })
          .slice(0, 8);

        setTopSearchSuggestions(uniqueProducts);
        setTopSearchOpen(uniqueProducts.length > 0);
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Top search live search error:',
            error
          );
          setTopSearchSuggestions([]);
          setTopSearchOpen(false);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchValue]);


  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total: number, item: any) => total + Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const categories = [
    {
      label: 'Phones & Tablets',
      icon: <PhoneIphoneOutlined sx={{ fontSize: 18 }} />,
      value: 'phones&tablets',
    },
    {
      label: 'Laptops',
      icon: <LaptopMacOutlined sx={{ fontSize: 18 }} />,
      value: 'laptops',
    },
    {
      label: 'TVs',
      icon: <TvOutlined sx={{ fontSize: 18 }} />,
      value: 'tvs',
    },
    {
      label: 'Audio',
      icon: <HeadphonesOutlined sx={{ fontSize: 18 }} />,
      value: 'audio',
    },
    {
      label: 'Smart Watches',
      icon: <WatchOutlined sx={{ fontSize: 18 }} />,
      value: 'smart-watches',
    },
    {
      label: 'Accessories',
      icon: <CableOutlined sx={{ fontSize: 18 }} />,
      value: 'accessories',
    },
  ];

  const submitSearch = () => {
    const term = searchValue.trim();

    if (!term) {
      setTopSearchOpen(false);
      return;
    }

    /*
     * The header search remains independent while typing.
     *
     * When the customer explicitly submits the search,
     * take them to the Shop page with that search term.
     * The Shop page already knows how to initialise its
     * product results from location.state.searchTerm.
     */
    setTopSearchOpen(false);

    navigate('/shop', {
      state: {
        searchTerm: term,
        fromHeaderSearch: true,
      },
    });
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      submitSearch();
    }
  };

  const goToCategory = (category: string) => {
    navigate('/shop', {
      state: {
        searchTerm: category,
      },
    });

    setMobileMenuOpen(false);
  };


  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* =========================================================
          TOP INFORMATION BAR
      ========================================================= */}
      <Sheet
        sx={{
          bgcolor: '#003d22',
          color: '#fff',
          px: { xs: 1.5, md: 4 },
          py: 0.75,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1450,
            mx: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
            }}
          >
            <LocalShippingOutlined sx={{ fontSize: 16 }} />

            <Typography
              level="body-xs"
              sx={{
                color: '#fff',
                fontWeight: 700,
              }}
            >
              Fast delivery across Uganda
            </Typography>
          </Box>

          <Typography
            level="body-xs"
            sx={{
              color: 'rgba(255,255,255,0.82)',
              display: { xs: 'none', md: 'block' },
            }}
          >
            Genuine gadgets • Great prices • Trusted service
          </Typography>

          {/* Currency */}
          <Dropdown>
            <MenuButton
              slots={{ root: Button }}
              size="sm"
              variant="plain"
              endDecorator={
                <KeyboardArrowDown sx={{ fontSize: 15 }} />
              }
              sx={{
                color: '#fff',
                minHeight: 28,
                px: 0.8,
                fontWeight: 850,
                borderRadius: 'md',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {currency}
            </MenuButton>

            <Menu placement="bottom-end">
              {['UGX', 'USD', 'KES', 'TZS'].map((item) => (
                <MenuItem
                  key={item}
                  selected={currency === item}
                  onClick={() => setCurrency(item)}
                >
                  {item}
                </MenuItem>
              ))}
            </Menu>
          </Dropdown>
        </Box>
      </Sheet>

      {/* =========================================================
          MAIN HEADER
      ========================================================= */}
      <Sheet
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          bgcolor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid #e3ebe6',
          boxShadow: '0 3px 16px rgba(0,0,0,0.06)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1450,
            mx: 'auto',
            px: { xs: 1.5, sm: 2.5, md: 4 },
            py: { xs: 1.1, md: 1.4 },
          }}
        >
          {/* MAIN ROW */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'auto 1fr auto',
                md: '230px minmax(320px, 1fr) auto',
              },
              alignItems: 'center',
              gap: { xs: 1, md: 3 },
            }}
          >
            {/* ===================================================
                REAL MINIFY LOGO
            =================================================== */}
            <Box
              onClick={() => navigate('/')}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                height: { xs: 45, md: 58 },
              }}
            >
              <Box
                component="img"
                src="/images/mini_logo.png"
                alt="MINIFY GADGETS"
                sx={{
                  width: { xs: 125, sm: 150, md: 195 },
                  height: { xs: 43, sm: 50, md: 58 },
                  objectFit: 'contain',
                  objectPosition: 'left center',
                  display: 'block',
                }}
              />
            </Box>

            {/* ===================================================
                SEARCH
            =================================================== */}
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'relative',
              }}
            >
              <Input
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setTopSearchOpen(true);
                }}
                onFocus={() => {
                  if (topSearchSuggestions.length > 0) {
                    setTopSearchOpen(true);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search phones, laptops, TVs, accessories..."
                startDecorator={
                  <Search
                    sx={{
                      color: '#006b3c',
                      fontSize: 23,
                    }}
                  />
                }
                endDecorator={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      pr: 0.35,
                    }}
                  >
                    {searchValue && !searching && (
                      <IconButton
                        size="sm"
                        variant="plain"
                        onClick={() => setSearchValue('')}
                        sx={{
                          borderRadius: '50%',
                        }}
                      >
                        <Close sx={{ fontSize: 17 }} />
                      </IconButton>
                    )}

                    <Button
                      size="md"
                      color="success"
                      loading={searching}
                      onClick={submitSearch}
                      sx={{
                        minHeight: 40,
                        borderRadius: '999px',
                        fontWeight: 800,
                        px: 2.2,
                        flexShrink: 0,
                        boxShadow: '0 2px 7px rgba(0,107,60,0.18)',
                      }}
                    >
                      {searching ? 'Searching' : 'Search'}
                    </Button>
                  </Box>
                }
                sx={{
                  width: '100%',
                  minHeight: 48,
                  borderRadius: '999px',
                  bgcolor: '#f4f7f5',
                  border: '1px solid #d6e2da',
                  boxShadow: 'none',
                  '&:focus-within': {
                    borderColor: '#008f55',
                    bgcolor: '#fff',
                    boxShadow:
                      '0 0 0 3px rgba(0,143,85,0.08)',
                  },
                }}
              />

              {topSearchOpen && topSearchSuggestions.length > 0 && (
                <Sheet
                  variant="outlined"
                  sx={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    zIndex: 3000,
                    bgcolor: '#fff',
                    borderRadius: 'md',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    maxHeight: 420,
                    overflowY: 'auto',
                  }}
                >
                  {topSearchSuggestions.map((product: any) => (
                    <Box
                      key={product.id}
                      onMouseDown={(event) => {
                        event.preventDefault();

                        setSearchValue(product.name || '');
                        setTopSearchOpen(false);

                        if (
                          product.id !== undefined &&
                          product.id !== null
                        ) {
                          navigate(`/product-details/${product.id}`);
                        }
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1.2,
                        cursor: 'pointer',
                        borderBottom: '1px solid #edf2ef',
                        '&:hover': {
                          bgcolor: '#f3faf6',
                        },
                      }}
                    >
                      {product.image && (
                        <Box
                          component="img"
                          src={product.image}
                          alt={product.name || 'Product'}
                          sx={{
                            width: 48,
                            height: 48,
                            objectFit: 'contain',
                            borderRadius: 'sm',
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          level="body-sm"
                          sx={{
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {product.name}
                        </Typography>

                        {product.price !== undefined &&
                          Number(product.price) > 0 && (
                            <Typography
                              level="body-xs"
                              sx={{
                                fontWeight: 700,
                                color: '#006b3c',
                                mt: 0.25,
                              }}
                            >
                              UGX {Number(product.price).toLocaleString()}
                            </Typography>
                          )}
                      </Box>
                    </Box>
                  ))}
                </Sheet>
              )}
            </Box>

            {/* ===================================================
                ACTIONS
            =================================================== */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: { xs: 0.3, sm: 0.8 },
              }}
            >
              <IconButton
                variant="plain"
                color="neutral"
                onClick={() => navigate('/shop')}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  borderRadius: 'lg',
                }}
              >
                <FavoriteBorder />
              </IconButton>

              <IconButton
                variant="plain"
                color="neutral"
                onClick={() => navigate('/compare')}
                sx={{ position: 'relative', borderRadius: 'lg', display: { xs: 'none', sm: 'inline-flex' } }}
                aria-label="Compare products"
              >
                <CompareArrows />
                {compareItems.length > 0 && (
                  <Chip size="sm" color="success" variant="solid" sx={{ position: 'absolute', top: -3, right: -5, minWidth: 19, height: 19, borderRadius: '999px', p: 0, fontSize: '0.63rem' }}>{compareItems.length}</Chip>
                )}
              </IconButton>

              <IconButton
                variant="plain"
                color="neutral"
                onClick={() => navigate('/cart')}
                sx={{
                  position: 'relative',
                  borderRadius: 'lg',
                }}
              >
                <ShoppingCartOutlined />

                {cartCount > 0 && (
                  <Chip
                    size="sm"
                    color="danger"
                    variant="solid"
                    sx={{
                      position: 'absolute',
                      top: -3,
                      right: -5,
                      minWidth: 19,
                      height: 19,
                      borderRadius: '999px',
                      p: 0,
                      fontSize: '0.63rem',
                    }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </Chip>
                )}
              </IconButton>

              <Button variant="soft" color="success" startDecorator={<CompareArrows />} onClick={() => { navigate('/compare'); setMobileMenuOpen(false); }} sx={{ justifyContent: 'flex-start', borderRadius: 'lg', minHeight: 45 }}>
              Compare {compareItems.length > 0 ? `(${compareItems.length})` : ''}
            </Button>

            {is_authenticated ? (
                <Dropdown>
                  <MenuButton
                    variant="outlined"
                    color="success"
                    startDecorator={<PersonOutline />}
                    sx={{
                      display: { xs: 'none', md: 'inline-flex' },
                      borderRadius: 'lg',
                      fontWeight: 800,
                      borderColor: '#006b3c',
                      color: '#006b3c',
                    }}
                  >
                    {first_name ? `Hi, ${first_name}` : 'My Account'}
                  </MenuButton>
                  <Menu placement="bottom-end" sx={{ minWidth: 230, p: 0.7 }}>
                    <Box sx={{ px: 1.2, py: 1, borderBottom: '1px solid #e5ece8' }}>
                      <Typography level="title-sm" sx={{ fontWeight: 800 }}>
                        {first_name || 'Account'}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                        {email}
                      </Typography>
                    </Box>
                    {role === 'manager' ? (
                      <MenuItem onClick={() => navigate('/admin')}>
                        <PersonOutline /> Admin Dashboard
                      </MenuItem>
                    ) : (
                      <MenuItem onClick={() => navigate('/my-profile')}>
                        <PersonOutline /> My Profile
                      </MenuItem>
                    )}
                    <MenuItem
                      color="danger"
                      onClick={async () => {
                        await dispatch(LogoutThunk()).unwrap();
                        setMobileMenuOpen(false);
                        navigate('/accounts/login', { replace: true });
                      }}
                    >
                      <Typography color="danger" sx={{ fontWeight: 800 }}>
                        Log Out
                      </Typography>
                    </MenuItem>
                  </Menu>
                </Dropdown>
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  startDecorator={<PersonOutline />}
                  onClick={() => navigate('/accounts/login')}
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    borderRadius: 'lg',
                    fontWeight: 800,
                    borderColor: '#006b3c',
                    color: '#006b3c',
                  }}
                >
                  Account
                </Button>
              )}

              <IconButton
                variant="soft"
                color="success"
                onClick={() =>
                  setMobileMenuOpen((value) => !value)
                }
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  borderRadius: 'lg',
                }}
              >
                {mobileMenuOpen ? <Close /> : <MenuIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* ===================================================
              MOBILE SEARCH
          =================================================== */}
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              mt: 1.2,
            }}
          >
            <Input
              value={searchValue}
              onChange={(event) =>
                setSearchValue(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              placeholder="Search gadgets..."
              startDecorator={
                <Search sx={{ color: '#006b3c' }} />
              }
              sx={{
                minHeight: 43,
                borderRadius: '999px',
                bgcolor: '#f4f7f5',
                border: '1px solid #d6e2da',
              }}
            />
          </Box>
        </Box>

        {/* =======================================================
            PREMIUM CATEGORY NAVIGATION
        ======================================================= */}
        <Box
          sx={{
            background:
              'linear-gradient(90deg, #003d22 0%, #005c35 50%, #007a47 100%)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Box
            sx={{
              maxWidth: 1450,
              mx: 'auto',
              px: { xs: 1.5, md: 4 },
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
            }}
          >
            <Box
              sx={{
                minWidth: 'max-content',
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.4, md: 0.7 },
                minHeight: { xs: 48, md: 52 },
              }}
            >
              {/* Shop All */}
              <Button
                variant="soft"
                onClick={() => navigate('/shop')}
                sx={{
                  borderRadius: 'md',
                  fontWeight: 850,
                  color: '#004526',
                  bgcolor: '#fff',
                  px: { xs: 1.3, md: 1.7 },
                  '&:hover': {
                    bgcolor: '#f0faf4',
                  },
                }}
              >
                Shop All
              </Button>

              {/* Categories */}
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant="plain"
                  startDecorator={category.icon}
                  onClick={() => goToCategory(category.value)}
                  sx={{
                    borderRadius: 'md',
                    fontWeight: 700,
                    color: '#fff',
                    px: { xs: 1, md: 1.3 },
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.12)',
                      color: '#fff',
                    },
                  }}
                >
                  {category.label}
                </Button>
              ))}

              <Divider
                orientation="vertical"
                sx={{
                  height: 27,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  mx: 0.5,
                }}
              />

              {/* Deals */}
              <Button
                variant="solid"
                color="danger"
                startDecorator={<LocalOfferOutlined />}
                onClick={() => navigate('/shop')}
                sx={{
                  borderRadius: 'md',
                  fontWeight: 900,
                  px: { xs: 1.2, md: 1.5 },
                  whiteSpace: 'nowrap',
                }}
              >
                Deals
              </Button>
            </Box>
          </Box>
        </Box>
      </Sheet>

      {/* =========================================================
          MOBILE CATEGORY MENU
      ========================================================= */}
      {mobileMenuOpen && (
        <Sheet
          sx={{
            position: 'fixed',
            zIndex: 1099,
            top: { xs: 125, sm: 132 },
            left: 0,
            right: 0,
            bgcolor: '#fff',
            borderBottom: '1px solid #dce6df',
            boxShadow: '0 12px 30px rgba(0,0,0,0.14)',
            p: 2,
          }}
        >
          <Typography
            level="title-sm"
            sx={{
              fontWeight: 900,
              mb: 1.2,
              color: '#004526',
            }}
          >
            Browse Categories
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
            }}
          >
            {categories.map((category) => (
              <Button
                key={category.value}
                variant="soft"
                color="neutral"
                startDecorator={category.icon}
                onClick={() => goToCategory(category.value)}
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: 'lg',
                  minHeight: 45,
                }}
              >
                {category.label}
              </Button>
            ))}

            <Button
              variant="soft"
              color="danger"
              startDecorator={<LocalOfferOutlined />}
              onClick={() => {
                navigate('/shop');
                setMobileMenuOpen(false);
              }}
              sx={{
                justifyContent: 'flex-start',
                borderRadius: 'lg',
                minHeight: 45,
              }}
            >
              Deals
            </Button>

            {is_authenticated ? (
              <>
                <Button
                  variant="outlined"
                  color="success"
                  startDecorator={<PersonOutline />}
                  onClick={() => {
                    navigate(role === 'manager' ? '/admin' : '/my-profile');
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 'lg',
                    minHeight: 45,
                  }}
                >
                  {role === 'manager' ? 'Admin Dashboard' : 'My Profile'}
                </Button>
                <Button
                  variant="soft"
                  color="danger"
                  onClick={async () => {
                    await dispatch(LogoutThunk()).unwrap();
                    setMobileMenuOpen(false);
                    navigate('/accounts/login', { replace: true });
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    borderRadius: 'lg',
                    minHeight: 45,
                  }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                color="success"
                startDecorator={<PersonOutline />}
                onClick={() => {
                  navigate('/accounts/login');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  justifyContent: 'flex-start',
                  borderRadius: 'lg',
                  minHeight: 45,
                }}
              >
                My Account
              </Button>
            )}
          </Box>
        </Sheet>
      )}
    </>
  );
};

export default Header;
