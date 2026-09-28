import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Sheet,
  Typography,
  ButtonGroup,
} from '@mui/joy';
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  FavoriteBorder,
  HomeOutlined,
  LocalShippingOutlined,
  SecurityOutlined,
  ShoppingCartOutlined,
  VerifiedOutlined,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../types/hooks.types';
import { useToast } from '../utils/toast-context';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
} from '../Slices/CartSlice';
import type { Product } from '../types/product.types';
import type { CartItem } from '../interfaces/cart.interfaces';
import ProductCard from '../components/ui/product_card';
import { RecordProductView } from '../api/products';

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <rect width="800" height="800" fill="#f3f6f4"/>
      <rect x="120" y="120" width="560" height="560" rx="28" fill="#ffffff" stroke="#d8e4dd" stroke-width="6"/>
      <text x="400" y="390" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="#006b3c">MINIFY GADGETS</text>
      <text x="400" y="445" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#66736c">Product image unavailable</text>
    </svg>
  `);

const IPHONE_18_PRICING: Record<string, Record<string, number>> = {
  'iPhone 18 Pro': {
    'Burgundy|256GB': 7400000,
    'Glacier|256GB': 7330000,
    'Black|256GB': 7300000,
    'Silver|256GB': 7300000,
    'Burgundy|512GB': 8300000,
    'Glacier|512GB': 8300000,
    'Black|512GB': 8250000,
    'Silver|512GB': 8200000,
  },
  'iPhone 18 Pro Max': {
    'Burgundy|256GB': 9600000,
    'Glacier|256GB': 9500000,
    'Black|256GB': 9500000,
    'Silver|256GB': 9500000,
    'Burgundy|512GB': 10200000,
    'Glacier|512GB': 10100000,
    'Black|512GB': 10100000,
    'Silver|512GB': 10100000,
    'Burgundy|1TB': 13300000,
    'Glacier|1TB': 13200000,
    'Black|1TB': 13200000,
    'Silver|1TB': 13200000,
    'Burgundy|2TB': 14900000,
    'Glacier|2TB': 14800000,
    'Black|2TB': 14800000,
    'Silver|2TB': 14800000,
  },
};

const cleanDescription = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/gi, '')
    .replace(/\n\s*\n\s*/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const products = useAppSelector((state) => state.products.products);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [selectedColor, setSelectedColor] = useState('Black');
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    if (!products || !id) {
      return;
    }

    const found = products.find(
      (item) => item.id.toString() === id.toString()
    );

    if (found) {
      setProduct(found);

      const related = products
        .filter(
          (item) =>
            item.id.toString() !== id.toString() &&
            (
              item.category === found.category ||
              item.categories?.some((category) =>
                found.categories?.includes(category)
              )
            )
        )
        .slice(0, 4);

      setRelatedProducts(related);
    } else {
      setProduct(null);
      setRelatedProducts([]);
    }

    setLoading(false);
  }, [products, id]);

  const cartItem = useMemo(
    () =>
      cartItems.find(
        (item: CartItem) => item.id.toString() === id?.toString()
      ),
    [cartItems, id]
  );

  const isInCart = Boolean(cartItem);

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    }
  }, [cartItem]);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath || imagePath === 'products/default.jpg') {
      return FALLBACK_IMAGE;
    }

    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://')
    ) {
      return encodeURI(imagePath);
    }

    const baseUrl =
      import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const cleanPath = imagePath.replace(
      /^\.\.\/|^\.\/|^\//,
      ''
    );

    return `${baseUrl}/media/${cleanPath}`;
  };

  const images = useMemo(() => {
    if (!product) {
      return [];
    }

    return [
      product.source_image_url || product.image_url || (/iphone 17 pro max/i.test(product.name || '') ? '/iphone-17-pro-max-official.png' : /iphone air/i.test(product.name || '') ? '/iphone-air-official.png' : '/placeholder-image.svg'),
      ...(product.additional_images || []),
    ].filter(Boolean) as string[];
  }, [product]);

  useEffect(() => {
    setSelectedImage(0);

    if (product?.id) {
      try {
        const key = 'minify_recent_products';
        const current: string[] = JSON.parse(localStorage.getItem(key) || '[]');
        const next = [String(product.id), ...current.filter((item) => String(item) !== String(product.id))].slice(0, 12);
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Browsing history is optional.
      }
      RecordProductView(product.id).then((viewCount) => {
        if (viewCount !== null) {
          setProduct((current) =>
            current
              ? { ...current, views_count: viewCount }
              : current
          );
        }
      });
    }
  }, [product?.id]);

  const productFamilyKey = (name: string) => {
    return String(name || '')
      .toLowerCase()
      .replace(/\b(?:128|256|512|1024|1)\s*(?:gb|g|tb)\b/g, ' ')
      .replace(/\b(?:black|white|cream|violet|lavender|green|blue|silver|gold|pink|red|purple|graphite|beige|desert|natural|titanium)\b/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractStorage = (name: string) => {
    const match = String(name || '').match(/\b(1TB|1024GB|512GB|256GB|128GB|64GB)\b/i);
    if (!match) return '';
    return match[1].toUpperCase().replace('1024GB', '1TB');
  };

  const variantProducts = useMemo(() => {
    if (!product || !products?.length) return [];
    const key = productFamilyKey(product.name || '');
    if (!key) return [];
    return products
      .filter((item) => item.id.toString() !== product.id.toString() && productFamilyKey(item.name || '') === key)
      .filter((item, index, arr) => arr.findIndex((candidate) => candidate.id.toString() === item.id.toString()) === index)
      .sort((a, b) => {
        const sa = extractStorage(a.name || '');
        const sb = extractStorage(b.name || '');
        return sa.localeCompare(sb, undefined, { numeric: true });
      });
  }, [product, products]);

  const galleryImages = useMemo(() => {
    const own = images;
    const familyImages = variantProducts
      .flatMap((item: any) => [item.source_image_url, item.image_url])
      .filter(Boolean) as string[];
    return [...new Set([...own, ...familyImages])];
  }, [images, variantProducts]);

  const handleGalleryTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const handleGalleryTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = (event.touches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
  };

  const handleGalleryTouchEnd = () => {
    if (touchStartX.current === null || galleryImages.length <= 1) return;
    const threshold = 45;
    if (Math.abs(touchDeltaX.current) >= threshold) {
      if (touchDeltaX.current < 0) {
        setSelectedImage((current) => current === galleryImages.length - 1 ? 0 : current + 1);
      } else {
        setSelectedImage((current) => current === 0 ? galleryImages.length - 1 : current - 1);
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const iphone18Model = product?.name && IPHONE_18_PRICING[product.name]
    ? product.name
    : '';
  const iphone18Prices = iphone18Model ? IPHONE_18_PRICING[iphone18Model] : {};
  const iphone18Storages = iphone18Model === 'iPhone 18 Pro Max'
    ? ['256GB', '512GB', '1TB', '2TB']
    : iphone18Model === 'iPhone 18 Pro'
      ? ['256GB', '512GB']
      : [];
  const iphone18Colors = ['Burgundy', 'Glacier', 'Black', 'Silver'];
  const selectedIphone18Price = iphone18Prices[selectedColor + '|' + selectedStorage];
  const price = Number(selectedIphone18Price || product?.price || 0);
  const discount = Number(product?.discount || 0);

  const discountedPrice =
    discount > 0
      ? Math.round(price - price * (discount / 100))
      : price;

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const item: CartItem = {
      id: product.id.toString(),
      name: product.name || '',
      price: product.price || 0,
      quantity,
      discount: product.discount || 0,
      image: getImageUrl(product.source_image_url || product.image_url),
    };

    if (iphone18Model) {
      item.name = product.name + ' ' + selectedStorage + ' — ' + selectedColor;
      item.price = price;
    }

    dispatch(addToCart(item));

    addToast({
      color: 'success',
      message: 'Product added to cart',
      action: { label: 'View Cart', onClick: () => navigate('/cart') },
    });
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (!product) {
      return;
    }

    const maxStock = Number(product.stock || 0);

    if (newQuantity <= 0) {
      dispatch(
        removeFromCart(product.id.toString())
      );

      setQuantity(1);

      addToast({
        color: 'neutral',
        message: 'Product removed from cart',
      });

      return;
    }

    if (maxStock > 0 && newQuantity > maxStock) {
      addToast({
        color: 'warning',
        message: `Only ${maxStock} available`,
      });
      return;
    }

    dispatch(
      updateQuantity({
        id: product.id.toString(),
        quantity: newQuantity,
      })
    );

    setQuantity(newQuantity);
  };

  const handleBuyNow = () => {
    if (!product) {
      return;
    }

    if (!isInCart) {
      handleAddToCart();
    }

    navigate('/cart');
  };

  const handlePreviousImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1
    );
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress
          size="lg"
          color="success"
        />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography level="h2">
          Product not found
        </Typography>

        <Typography
          level="body-md"
          sx={{ mt: 1, color: 'text.secondary' }}
        >
          The product may have been removed or is no longer available.
        </Typography>

        <Button
          color="success"
          sx={{ mt: 3 }}
          startDecorator={<ArrowBack />}
          onClick={() => navigate('/shop')}
        >
          Back to Shop
        </Button>
      </Box>
    );
  }

  const categoryLabel =
    product.category ||
    product.categories?.[0] ||
    'Gadgets';

  return (
    <Box
      sx={{
        maxWidth: 1280,
        mx: 'auto',
        px: { xs: 1.5, sm: 3, md: 4 },
        py: { xs: 2, md: 4 },
      }}
    >
      {/* Breadcrumb */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 0.75,
          mb: { xs: 2, md: 3 },
        }}
      >
        <Button
          variant="plain"
          color="neutral"
          size="sm"
          startDecorator={<HomeOutlined />}
          onClick={() => navigate('/')}
          sx={{
            px: 0.5,
            minHeight: 30,
          }}
        >
          Home
        </Button>

        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
          /
        </Typography>

        <Button
          variant="plain"
          color="neutral"
          size="sm"
          onClick={() => navigate('/shop')}
          sx={{
            px: 0.5,
            minHeight: 30,
          }}
        >
          Shop
        </Button>

        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
          /
        </Typography>

        <Typography
          level="body-sm"
          sx={{
            color: 'text.secondary',
            maxWidth: { xs: 180, sm: 350 },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </Typography>
      </Box>

      {/* Main product section */}
      <Grid
        container
        spacing={{ xs: 2, md: 4 }}
        sx={{ alignItems: 'flex-start' }}
      >
        {/* Gallery */}
        <Grid xs={12} md={6}>
          <Card
            variant="outlined"
            sx={{
              overflow: 'hidden',
              borderRadius: 'lg',
              boxShadow: 'sm',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                bgcolor: '#f7f8f8',
                borderRadius: 'md',
                overflow: 'hidden',
              }}
            >
              <Box
                onTouchStart={handleGalleryTouchStart}
                onTouchMove={handleGalleryTouchMove}
                onTouchEnd={handleGalleryTouchEnd}
                sx={{
                  height: {
                    xs: 320,
                    sm: 430,
                    md: 500,
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 2, md: 4 },
                  touchAction: 'pan-y',
                  userSelect: 'none',
                }}
              >
                <img
                  src={
                    galleryImages[selectedImage]
                      ? getImageUrl(galleryImages[selectedImage])
                      : FALLBACK_IMAGE
                  }
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </Box>

              {discount > 0 && (
                <Chip
                  color="danger"
                  variant="solid"
                  size="lg"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    fontWeight: 800,
                    borderRadius: 'md',
                  }}
                >
                  -{discount}%
                </Chip>
              )}

              <IconButton
                variant="soft"
                color="neutral"
                size="sm"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  borderRadius: '50%',
                }}
                aria-label="Add to favourites"
              >
                <FavoriteBorder />
              </IconButton>

              {galleryImages.length > 1 && (
                <>
                  <IconButton
                    variant="solid"
                    color="neutral"
                    size="sm"
                    onClick={handlePreviousImage}
                    sx={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderRadius: '50%',
                      boxShadow: 'md',
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>

                  <IconButton
                    variant="solid"
                    color="neutral"
                    size="sm"
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderRadius: '50%',
                      boxShadow: 'md',
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </>
              )}
            </Box>

            {galleryImages.length > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  p: 1.5,
                  overflowX: 'auto',
                  justifyContent: {
                    xs: 'flex-start',
                    sm: 'center',
                  },
                }}
              >
                {galleryImages.map((image, index) => (
                  <Box
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      flex: '0 0 auto',
                      width: { xs: 62, sm: 76 },
                      height: { xs: 62, sm: 76 },
                      borderRadius: 'md',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor:
                        selectedImage === index
                          ? 'success.500'
                          : 'neutral.200',
                      bgcolor: 'neutral.50',
                      opacity:
                        selectedImage === index ? 1 : 0.65,
                      transition: 'all .2s ease',
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(event) => {
                        event.currentTarget.src =
                          '/placeholder-image.jpg';
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {/* iPhone 18 storage and colour selectors are shown in the purchase panel. */}
          </Card>
        </Grid>

        {/* Product information */}
        <Grid xs={12} md={6}>
          <Box
            sx={{
              position: 'sticky',
              top: 24,
            }}
          >
            <Chip
              color="success"
              variant="soft"
              size="sm"
              sx={{
                mb: 1.5,
                textTransform: 'capitalize',
                fontWeight: 700,
              }}
            >
              {categoryLabel}
            </Chip>

            <Typography
              level="h1"
              sx={{
                fontSize: {
                  xs: '1.65rem',
                  sm: '2rem',
                  md: '2.35rem',
                },
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              {product.name}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                mt: 1.5,
              }}
            >
              <Chip
                color={product.stock ? 'success' : 'danger'}
                variant="soft"
                size="sm"
              >
                {product.stock
                  ? 'In Stock'
                  : 'Out of Stock'}
              </Chip>

              {product.status && (
                <Chip
                  color="neutral"
                  variant="soft"
                  size="sm"
                  sx={{ textTransform: 'capitalize' }}
                >
                  {product.status}
                </Chip>
              )}

              <Typography
                level="body-sm"
                sx={{ color: 'text.secondary' }}
              >
                {product.reviews_count || 0} reviews
              </Typography>

              {Number(product.views_count) > 0 && (
                <Typography
                  level="body-sm"
                  sx={{ color: 'text.secondary' }}
                >
                  {Number(product.views_count).toLocaleString()} views
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: 3 }}>
              {discount > 0 ? (
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 1.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      level="h2"
                      sx={{
                        color: '#004526',
                        fontWeight: 900,
                        fontSize: {
                          xs: '1.9rem',
                          sm: '2.25rem',
                        },
                      }}
                    >
                      UGX {discountedPrice.toLocaleString()}
                    </Typography>

                    <Typography
                      level="body-lg"
                      sx={{
                        color: 'text.tertiary',
                        textDecoration: 'line-through',
                      }}
                    >
                      UGX {price.toLocaleString()}
                    </Typography>
                  </Box>

                  <Typography
                    level="body-sm"
                    sx={{
                      mt: 0.5,
                      color: 'success.700',
                      fontWeight: 700,
                    }}
                  >
                    You save UGX{' '}
                    {(price - discountedPrice).toLocaleString()}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  level="h2"
                  sx={{
                    color: '#004526',
                    fontWeight: 900,
                    fontSize: {
                      xs: '1.9rem',
                      sm: '2.25rem',
                    },
                  }}
                >
                  UGX {price.toLocaleString()}
                </Typography>
              )}
            </Box>

            {iphone18Model && (
              <Sheet
                variant="outlined"
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 'lg',
                  borderColor: 'success.200',
                  bgcolor: 'success.50',
                }}
              >
                <Typography level="title-md" sx={{ fontWeight: 900, mb: 1.25 }}>
                  Choose your storage
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.75 }}>
                  {iphone18Storages.map((storage) => (
                    <Button
                      key={storage}
                      size="sm"
                      variant={selectedStorage === storage ? 'solid' : 'outlined'}
                      color="success"
                      onClick={() => setSelectedStorage(storage)}
                      sx={{ borderRadius: 'md', fontWeight: 900, minWidth: 78 }}
                    >
                      {storage}
                    </Button>
                  ))}
                </Box>

                <Typography level="title-sm" sx={{ fontWeight: 900, mb: 0.9 }}>
                  Choose your colour
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {iphone18Colors.map((color) => (
                    <Button
                      key={color}
                      size="sm"
                      variant={selectedColor === color ? 'solid' : 'outlined'}
                      color="success"
                      onClick={() => setSelectedColor(color)}
                      sx={{ borderRadius: 'md', fontWeight: 800 }}
                    >
                      {color}
                    </Button>
                  ))}
                </Box>

                <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 1.25 }}>
                  {selectedStorage} • {selectedColor} • HK Active — 1 Nano SIM + 1 eSIM
                </Typography>
                <Typography level="title-lg" sx={{ color: '#004526', fontWeight: 950, mt: 0.5 }}>
                  UGX {price.toLocaleString()}
                </Typography>
              </Sheet>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Benefits */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
              <Grid xs={12} sm={4}>
                <Sheet
                  variant="soft"
                  color="success"
                  sx={{
                    p: 1.5,
                    borderRadius: 'md',
                    height: '100%',
                  }}
                >
                  <LocalShippingOutlined />
                  <Typography
                    level="title-sm"
                    sx={{ mt: 0.5 }}
                  >
                    Delivery
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: 'text.secondary' }}
                  >
                    Fast & reliable
                  </Typography>
                </Sheet>
              </Grid>

              <Grid xs={12} sm={4}>
                <Sheet
                  variant="soft"
                  color="success"
                  sx={{
                    p: 1.5,
                    borderRadius: 'md',
                    height: '100%',
                  }}
                >
                  <VerifiedOutlined />
                  <Typography
                    level="title-sm"
                    sx={{ mt: 0.5 }}
                  >
                    Genuine
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: 'text.secondary' }}
                  >
                    Quality guaranteed
                  </Typography>
                </Sheet>
              </Grid>

              <Grid xs={12} sm={4}>
                <Sheet
                  variant="soft"
                  color="success"
                  sx={{
                    p: 1.5,
                    borderRadius: 'md',
                    height: '100%',
                  }}
                >
                  <SecurityOutlined />
                  <Typography
                    level="title-sm"
                    sx={{ mt: 0.5 }}
                  >
                    Secure
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{ color: 'text.secondary' }}
                  >
                    Safe shopping
                  </Typography>
                </Sheet>
              </Grid>
            </Grid>

            {/* Description */}
            {product.description && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  level="title-lg"
                  sx={{ fontWeight: 800, mb: 1 }}
                >
                  About this product
                </Typography>

                <Typography
                  level="body-md"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {cleanDescription(product.description)}
                </Typography>
              </Box>
            )}

            {/* Specifications */}
            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    level="title-lg"
                    sx={{ fontWeight: 800, mb: 1.5 }}
                  >
                    Specifications
                  </Typography>

                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 'md',
                      overflow: 'hidden',
                    }}
                  >
                    {Object.entries(
                      product.specifications
                    ).map(([key, value], index) => (
                      <Box
                        key={key}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          px: 2,
                          py: 1.25,
                          bgcolor:
                            index % 2 === 0
                              ? 'background.level1'
                              : 'transparent',
                        }}
                      >
                        <Typography
                          level="body-sm"
                          sx={{
                            width: {
                              xs: 105,
                              sm: 140,
                            },
                            flexShrink: 0,
                            fontWeight: 800,
                            textTransform: 'capitalize',
                          }}
                        >
                          {key.replace(/_/g, ' ')}
                        </Typography>

                        <Typography
                          level="body-sm"
                          sx={{
                            color: 'text.secondary',
                            wordBreak: 'break-word',
                          }}
                        >
                          {String(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Card>
                </Box>
              )}

            {/* Purchase area */}
            <Card
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 'lg',
                bgcolor: 'background.surface',
              }}
            >
              <Typography
                level="title-sm"
                sx={{ mb: 1 }}
              >
                Quantity
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                  mb: 2,
                }}
              >
                <ButtonGroup
                  size="lg"
                  variant="outlined"
                >
                  <Button
                    color="danger"
                    onClick={() =>
                      handleUpdateQuantity(quantity - 1)
                    }
                    disabled={quantity <= 1}
                    sx={{ minWidth: 48 }}
                  >
                    −
                  </Button>

                  <Button
                    disabled
                    sx={{
                      minWidth: 60,
                      fontWeight: 900,
                    }}
                  >
                    {quantity}
                  </Button>

                  <Button
                    color="success"
                    onClick={() =>
                      handleUpdateQuantity(quantity + 1)
                    }
                    disabled={
                      !product.stock ||
                      quantity >= Number(product.stock)
                    }
                    sx={{ minWidth: 48 }}
                  >
                    +
                  </Button>
                </ButtonGroup>

                {product.stock > 0 && (
                  <Typography
                    level="body-sm"
                    sx={{ color: 'text.secondary' }}
                  >
                    {product.stock} available
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  flexDirection: {
                    xs: 'column',
                    sm: 'row',
                  },
                }}
              >
                <Button
                  size="lg"
                  color="success"
                  variant="solid"
                  fullWidth
                  startDecorator={
                    <ShoppingCartOutlined />
                  }
                  onClick={
                    isInCart
                      ? () => navigate('/cart')
                      : handleAddToCart
                  }
                  disabled={!product.stock}
                  sx={{
                    minHeight: 50,
                    fontWeight: 800,
                    borderRadius: 'md',
                  }}
                >
                  {isInCart
                    ? 'View in Cart'
                    : 'Add to Cart'}
                </Button>

                <Button
                  size="lg"
                  variant="outlined"
                  color="success"
                  fullWidth
                  onClick={handleBuyNow}
                  disabled={!product.stock}
                  sx={{
                    minHeight: 50,
                    fontWeight: 800,
                    borderRadius: 'md',
                  }}
                >
                  Buy Now
                </Button>
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: { xs: 5, md: 8 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                level="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: {
                    xs: '1.45rem',
                    sm: '1.8rem',
                  },
                }}
              >
                You may also like
              </Typography>

              <Typography
                level="body-sm"
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                More products you might be interested in
              </Typography>
            </Box>

            <Button
              variant="plain"
              color="success"
              size="sm"
              onClick={() => navigate('/shop')}
            >
              View all
            </Button>
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {relatedProducts.map((related) => (
              <Grid
                xs={6}
                sm={6}
                md={3}
                key={related.id}
              >
                <ProductCard
                  id={related.id}
                  name={related.name}
                  price={related.price}
                  image={related.image_url || related.source_image_url}
                  rating={related.rating}
                  reviews_count={related.reviews_count}
                  views_count={related.views_count}
                  discount={related.discount}
                  description={related.description}
                  status={related.status || related.condition}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ProductDetails;
