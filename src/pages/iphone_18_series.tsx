import React, { useMemo } from 'react';
import { Box, Button, Chip, Sheet, Typography } from '@mui/joy';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../types/hooks.types';
import ProductCard from '../components/ui/product_card';

const Iphone18Series: React.FC = () => {
  const navigate = useNavigate();
  const products = useAppSelector((state) => state.products.products) || [];
  const items = useMemo(() => products.filter((p) => /iphone 18/i.test(p.name || '')), [products]);
  const reserve = () => window.open('https://wa.me/256787808501?text=Hello%20Minify%20Gadgets!%20I%20want%20to%20pre-order%20the%20iPhone%2018%20series.', '_blank', 'noopener,noreferrer');

  return (
    <Box sx={{ minHeight: '75vh', bgcolor: '#f5f8f6', py: { xs: 2, md: 5 }, px: { xs: 1.5, md: 4 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Sheet sx={{ position: 'relative', overflow: 'hidden', borderRadius: { xs: '22px', md: '32px' }, bgcolor: '#0a0d0c', color: '#fff', px: { xs: 2.5, sm: 5, md: 7 }, py: { xs: 4, md: 6 }, boxShadow: '0 18px 50px rgba(0,0,0,.15)' }}>
          <Chip color="danger" variant="solid" sx={{ fontWeight: 900 }}>PRE-ORDER NOW</Chip>
          <Typography level="h1" sx={{ color: '#fff', fontWeight: 950, mt: 1.5, fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, lineHeight: 1 }}>iPhone 18 Series</Typography>
          <Typography level="body-lg" sx={{ color: 'rgba(255,255,255,.78)', maxWidth: 760, mt: 1.5 }}>iPhone 18 Pro and iPhone 18 Pro Max. Choose your storage and finish, then reserve yours directly with Minify Gadgets.</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {['256GB', '512GB', '1TB', '2TB', 'Black', 'Silver', 'Glacier', 'Burgundy'].map((x) => <Chip key={x} variant="soft" sx={{ bgcolor: 'rgba(255,255,255,.1)', color: '#fff' }}>{x}</Chip>)}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mt: 3 }}>
            <Button size="lg" color="success" onClick={reserve} sx={{ borderRadius: '999px', fontWeight: 900 }}>Reserve on WhatsApp</Button>
            <Typography level="body-sm" sx={{ color: 'rgba(255,255,255,.65)' }}>Pre-orders: Sep 12 • Availability: Sep 18</Typography>
          </Box>
        </Sheet>

        <Box sx={{ mt: 5, mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', flexWrap: 'wrap' }}>
          <Box>
            <Typography level="h2" sx={{ fontWeight: 900 }}>18 Pro lineup</Typography>
            <Typography level="body-md" sx={{ color: 'text.secondary', mt: .5 }}>Latest catalogue entries and preorder options.</Typography>
          </Box>
          <Button variant="outlined" color="success" endDecorator={<ArrowForward />} onClick={() => navigate('/shop')}>Browse all gadgets</Button>
        </Box>

        {items.length ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', sm: 'repeat(2,minmax(0,1fr))', md: 'repeat(4,minmax(0,1fr))' }, gap: { xs: 1, sm: 2 } }}>
            {items.map((p) => <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} image={p.image_url || p.source_image_url || ''} discount={p.discount} rating={p.rating} reviews_count={p.reviews_count} views_count={p.views_count} status={p.status || p.condition || 'Pre-order'} />)}
          </Box>
        ) : (
          <Sheet variant="outlined" sx={{ p: 5, borderRadius: 'xl', textAlign: 'center' }}>
            <Typography level="h3" sx={{ fontWeight: 900 }}>iPhone 18 Pro lineup</Typography>
            <Typography sx={{ color: 'text.secondary', mt: 1 }}>Pre-orders are open. Reserve your preferred model while catalogue stock is being confirmed.</Typography>
            <Button color="success" sx={{ mt: 2 }} onClick={reserve}>Reserve on WhatsApp</Button>
          </Sheet>
        )}
      </Box>
    </Box>
  );
};

export default Iphone18Series;
