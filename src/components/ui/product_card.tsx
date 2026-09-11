import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  AspectRatio,
  Box,
  Chip,
  IconButton,
  ButtonGroup,
  Button,
  Divider,
} from '@mui/joy';
import {
  AddShoppingCart,
  DeleteOutline,
  ArrowForward,
  CompareArrows,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../utils/toast-context';
import { useAppDispatch, useAppSelector } from '../../types/hooks.types';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
} from '../../Slices/CartSlice';
import type { ProductCardProps } from '../../interfaces/products.interfaces';
import type { CartItem } from '../../interfaces/cart.interfaces';
import { addToCompare, removeFromCompare } from '../../Slices/compareSlice';

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  image,
  discount,
  description,
  status = '',
  rating = 0,
  reviews_count = 0,
  views_count = 0,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const cartItems = useAppSelector((state) => state.cart.items);
  const compareItems = useAppSelector((state) => state.compare.items);

  const cartItem = cartItems.find(
    (item: any) => item.id === id.toString()
  );

  const [inCart, setInCart] = useState(!!cartItem);
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);
  const [imageError, setImageError] = useState(false);
  const inCompare = compareItems.some((item) => String(item.id) === String(id));

  useEffect(() => {
    const currentCartItem = cartItems.find(
      (item: any) => item.id === id.toString()
    );

    setInCart(!!currentCartItem);

    if (currentCartItem) {
      setQuantity(currentCartItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [cartItems, id]);

  const numericPrice = Number(price) || 0;
  const numericDiscount = Number(discount) || 0;
  const priceOnRequest = numericPrice <= 0;

  const originalPrice =
    numericDiscount > 0
      ? Math.round(numericPrice / (1 - numericDiscount / 100))
      : numericPrice;

  const getImageUrl = () => {
    if (!image || image === 'products/default.jpg') {
      return '/placeholder-image.jpg';
    }

    if (
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {
      return image;
    }

    const baseUrl =
      import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const cleanPath = image.replace(
      /^\.\.\/|^\.\/|^\//,
      ''
    );

    return `${baseUrl}/media/${cleanPath}`;
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setImageError(true);
    e.currentTarget.src = '/placeholder-image.jpg';
  };

  const handleCardClick = () => {
    navigate(`/product-details/${id}`);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      dispatch(removeFromCompare(id));
      addToast({ color: 'neutral', message: 'Removed from compare' });
      return;
    }
    if (compareItems.length >= 3) {
      addToast({ color: 'warning', message: 'Compare up to 3 products at a time' });
      return;
    }
    dispatch(addToCompare({ id, name, price, image_url: image, discount, rating, reviews_count, views_count, status }));
    addToast({ color: 'success', message: 'Added to compare' });
  };

  const stopCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleContactForPrice = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const message = encodeURIComponent(`Hello Minify Gadgets! I would like the current price and availability of ${name}.`);
    window.open(`https://wa.me/256787808501?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (priceOnRequest) {
      handleContactForPrice(e);
      return;
    }

    if (!name || !numericPrice) {
      addToast({
        message: 'Product information is incomplete',
        color: 'danger',
      });
      return;
    }

    const item: CartItem = {
      id: id.toString(),
      name,
      price: numericPrice,
      quantity: 1,
      discount: numericDiscount,
      image: getImageUrl(),
    };

    dispatch(addToCart(item));

    addToast({
      message: 'Added to cart',
      color: 'success',
    });
  };

  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();

    const newQuantity = quantity + 1;

    setQuantity(newQuantity);

    dispatch(
      updateQuantity({
        id: id.toString(),
        quantity: newQuantity,
      })
    );
  };

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (quantity <= 1) {
      handleRemoveFromCart(e);
      return;
    }

    const newQuantity = quantity - 1;

    setQuantity(newQuantity);

    dispatch(
      updateQuantity({
        id: id.toString(),
        quantity: newQuantity,
      })
    );
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    dispatch(removeFromCart(id.toString()));
    setQuantity(1);

    addToast({
      message: 'Removed from cart',
      color: 'neutral',
    });
  };

  const isBrandNew =
    status.toLowerCase() === 'brand new';

  return (
    <Card
      onClick={handleCardClick}
      variant="outlined"
      sx={{
        width: '100%',
        maxWidth: 320,
        minWidth: 0,
        height: '100%',
        margin: 'auto',
        overflow: 'hidden',
        cursor: 'pointer',
        borderRadius: 'lg',
        bgcolor: '#fff',
        borderColor: '#e3e9e5',
        boxShadow: '0 2px 10px rgba(0,0,0,0.045)',
        transition:
          'transform .2s ease, box-shadow .2s ease, border-color .2s ease',

        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 28px rgba(0,70,38,0.12)',
          borderColor: '#9bcdb1',
        },
      }}
    >
      {/* IMAGE */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: '#f6f8f7',
        }}
      >
        <IconButton
          size="sm"
          variant={inCompare ? 'solid' : 'soft'}
          color="success"
          onClick={handleCompare}
          aria-label="Compare product"
          sx={{ position: 'absolute', top: 10, right: 10, zIndex: 4, borderRadius: '50%' }}
        >
          <CompareArrows sx={{ fontSize: 18 }} />
        </IconButton>

        <AspectRatio
          ratio="1"
          sx={{
            width: '100%',
            bgcolor: '#f6f8f7',
          }}
        >
          <img
            src={
              imageError
                ? '/placeholder-image.jpg'
                : getImageUrl()
            }
            alt={name || 'Product'}
            loading="lazy"
            onError={handleImageError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              padding: '10px',
              opacity: 1,
            }}
          />
        </AspectRatio>

        {/* BADGES */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            pointerEvents: 'none',
          }}
        >
          {status ? (
            <Chip
              size="sm"
              variant="solid"
              color={isBrandNew ? 'success' : 'neutral'}
              sx={{
                fontWeight: 800,
                textTransform: 'capitalize',
                boxShadow: 'sm',
              }}
            >
              {status}
            </Chip>
          ) : (
            <Box />
          )}

          {numericDiscount > 0 && !priceOnRequest && (
            <Chip
              size="sm"
              variant="solid"
              color="danger"
              sx={{
                fontWeight: 900,
                boxShadow: 'sm',
              }}
            >
              -{numericDiscount}%
            </Chip>
          )}
        </Box>


      </Box>

      {/* INFORMATION */}
      <CardContent
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          gap: 0.55,
          flex: 1,
        }}
      >
        <Typography
          level="title-md"
          sx={{
            fontWeight: 800,
            lineHeight: 1.3,
            minHeight: '2.6em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {name || 'Unnamed Product'}
        </Typography>

        {description && (
          <Typography
            level="body-xs"
            textColor="neutral.600"
            sx={{
              minHeight: '2.6em',
              lineHeight: 1.3,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </Typography>
        )}

        {(Number(rating) > 0 || Number(reviews_count) > 0 || Number(views_count) > 0) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              color: 'text.secondary',
              fontSize: '0.72rem',
            }}
          >
            {Number(rating) > 0 && (
              <Typography level="body-xs" sx={{ fontWeight: 800, color: '#b7791f' }}>
                ★ {Number(rating).toFixed(1)}
              </Typography>
            )}
            {Number(reviews_count) > 0 && (
              <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                {Number(reviews_count).toLocaleString()} reviews
              </Typography>
            )}
            {Number(views_count) > 0 && (
              <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                {Number(views_count).toLocaleString()} views
              </Typography>
            )}
          </Box>
        )}

        <Divider sx={{ my: 0.7 }} />

        {/* PRICE */}
        <Box>
          {numericDiscount > 0 && !priceOnRequest && (
            <Typography
              level="body-xs"
              sx={{
                color: '#8b9490',
                textDecoration: 'line-through',
                fontWeight: 600,
              }}
            >
              UGX {originalPrice.toLocaleString()}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 0.6,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              level="title-lg"
              sx={{
                color: '#006b3c',
                fontWeight: 900,
                lineHeight: 1.15,
              }}
            >
              {priceOnRequest ? 'Price on request' : `UGX ${numericPrice.toLocaleString()}`}
            </Typography>

            {numericDiscount > 0 && !priceOnRequest && (
              <Typography
                level="body-xs"
                sx={{
                  color: '#d32f2f',
                  fontWeight: 800,
                }}
              >
                Save {numericDiscount}%
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* CART AREA */}
      <Box
        onClick={stopCardClick}
        sx={{
          px: 1.25,
          pb: 1.25,
        }}
      >
        {inCart ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <ButtonGroup
              size="sm"
              variant="outlined"
              sx={{
                flex: 1,
                '& button': {
                  fontWeight: 800,
                },
              }}
            >
              <Button
                color="danger"
                variant="soft"
                onClick={handleDecreaseQuantity}
                sx={{ minWidth: 38 }}
              >
                −
              </Button>

              <Button
                disabled
                sx={{
                  flex: 1,
                  minWidth: 40,
                  color: '#173b2b !important',
                }}
              >
                {quantity}
              </Button>

              <Button
                color="success"
                variant="soft"
                onClick={handleIncreaseQuantity}
                sx={{ minWidth: 38 }}
              >
                +
              </Button>
            </ButtonGroup>

            <IconButton
              color="danger"
              variant="soft"
              size="sm"
              onClick={handleRemoveFromCart}
              sx={{
                borderRadius: 'md',
              }}
            >
              <DeleteOutline />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="solid"
            color="success"
            fullWidth
            startDecorator={priceOnRequest ? undefined : <AddShoppingCart />}
            endDecorator={
              <ArrowForward
                sx={{
                  fontSize: 17,
                  transition: 'transform .2s ease',
                }}
              />
            }
            onClick={priceOnRequest ? handleContactForPrice : handleAddToCart}
            sx={{
              minHeight: 42,
              borderRadius: 'md',
              fontWeight: 900,
              bgcolor: '#006b3c',
              '&:hover': {
                bgcolor: '#00582f',
              },
              '&:hover svg:last-child': {
                transform: 'translateX(3px)',
              },
            }}
          >
            {priceOnRequest ? 'Check Availability' : 'Add to Cart'}
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default ProductCard;
