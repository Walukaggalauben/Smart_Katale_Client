import React, { useEffect, useMemo, useState } from 'react';
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
      return '/placeholder-image.svg';
    }

    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://')
    ) {
      return imagePath;
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

  const price = Number(product?.price || 0);
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
      image: getImageUrl(product.image_url),
    };

    dispatch(addToCart(item));

    addToast({
      color: 'success',
      message: 'Product added to cart',
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
    if (images.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const handleNextImage = () => {
    if (images.length <= 1) {
      return;
    }

    setSelectedImage((current) =>
      current === images.length - 1 ? 0 : current + 1
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
                }}
              >
                <img
                  src={
                    images[selectedImage]
                      ? getImageUrl(images[selectedImage])
                      : '/placeholder-image.jpg'
                  }
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  onError={(event) => {
                    event.currentTarget.src =
                      '/placeholder-image.jpg';
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

              {images.length > 1 && (
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

            {images.length > 1 && (
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
                {images.map((image, index) => (
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
                  }}
                >
                  {product.description}
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
