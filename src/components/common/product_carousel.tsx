// components/common/product_carousel.tsx
import React from 'react';
import { Box, Typography } from '@mui/joy';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from '../ui/product_card';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { HorizontalProductSwiperProps } from '../../interfaces/card.interfaces';



const HorizontalProductSwiper: React.FC<HorizontalProductSwiperProps> = ({
  title,
  products,
  slidesPerView = 5,
  spaceBetween = 16
}) => {


  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Box sx={{ px: 2 }}>
      <Typography level="h4" variant='solid' color='success' sx={{ mb: 2, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Swiper
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 10 },
          640: { slidesPerView: 3, spaceBetween: 15 },
          1024: { slidesPerView: 5, spaceBetween: 16 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image_url || product.source_image_url}
              rating={product.rating}
              reviews_count={product.reviews_count}
              views_count={product.views_count}
              discount={product.discount}
              description={product.description}
              status='Brand new'
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default HorizontalProductSwiper;