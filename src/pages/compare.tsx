import React from 'react';
import { Box, Button, Card, Chip, Divider, Grid, Sheet, Typography } from '@mui/joy';
import { CompareArrows, DeleteOutline, ShoppingCartOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../types/hooks.types';
import { clearCompare, removeFromCompare } from '../Slices/compareSlice';
import { addToCart } from '../Slices/CartSlice';
import { useToast } from '../utils/toast-context';
import type { Product } from '../types/product.types';

const value = (product: Product, keys: string[]) => {
  for (const key of keys) {
    const item = product[key];
    if (item !== undefined && item !== null && String(item).trim() !== '') return String(item);
  }
  return '—';
};

const Compare: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const items = useAppSelector((state) => state.compare.items);

  const addProductToCart = (product: Product) => {
    if (!Number(product.price)) {
      const message = encodeURIComponent(`Hello Minify Gadgets! I would like the current price and availability of ${product.name}.`);
      window.open(`https://wa.me/256787808501?text=${message}`, '_blank', 'noopener,noreferrer');
      return;
    }
    dispatch(addToCart({
      id: String(product.id), name: product.name || 'Product', price: Number(product.price),
      quantity: 1, discount: Number(product.discount || 0),
      image: product.image_url || product.source_image_url || '/placeholder-image.jpg',
    }));
    addToast({ color: 'success', message: 'Added to cart' });
  };

  const rows = [
    ['Price', (p: Product) => Number(p.price) ? `UGX ${Number(p.price).toLocaleString()}` : 'Price on request'],
    ['Condition', (p: Product) => value(p, ['status', 'condition', 'normalized_condition'])],
    ['Brand', (p: Product) => value(p, ['brand', 'normalized_brand'])],
    ['Category', (p: Product) => value(p, ['category', 'source_category'])],
    ['Storage', (p: Product) => value(p, ['storage', 'normalized_storage'])],
    ['RAM', (p: Product) => value(p, ['ram', 'normalized_ram'])],
    ['Rating', (p: Product) => Number(p.rating) ? `★ ${Number(p.rating).toFixed(1)}` : 'Not rated'],
    ['Reviews', (p: Product) => Number(p.reviews_count || 0).toLocaleString()],
    ['Views', (p: Product) => Number(p.views_count || 0).toLocaleString()],
    ['Stock', (p: Product) => Number(p.stock) > 0 ? `${Number(p.stock).toLocaleString()} available` : 'Out of stock'],
  ] as const;

  return (
    <Box sx={{ minHeight: '70vh', bgcolor: '#f7f9f8', px: { xs: 1.5, md: 4 }, py: { xs: 3, md: 5 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Chip color="success" variant="soft" startDecorator={<CompareArrows />}>MINIFY GADGETS</Chip>
            <Typography level="h1" sx={{ mt: 1, fontWeight: 900 }}>Compare products</Typography>
            <Typography level="body-md" sx={{ color: 'text.secondary', mt: 0.5 }}>Compare up to three gadgets side by side before you buy.</Typography>
          </Box>
          {items.length > 0 && <Button variant="outlined" color="danger" startDecorator={<DeleteOutline />} onClick={() => dispatch(clearCompare())}>Clear all</Button>}
        </Box>

        {items.length === 0 ? (
          <Sheet variant="outlined" sx={{ bgcolor: '#fff', borderRadius: 'xl', py: 10, px: 3, textAlign: 'center' }}>
            <CompareArrows sx={{ fontSize: 58, color: '#006b3c' }} />
            <Typography level="h3" sx={{ mt: 2, fontWeight: 900 }}>Nothing to compare yet</Typography>
            <Typography level="body-md" sx={{ color: 'text.secondary', maxWidth: 520, mx: 'auto', mt: 1 }}>Use Compare on product cards to build a shortlist of up to three products.</Typography>
            <Button color="success" sx={{ mt: 3 }} onClick={() => navigate('/shop')}>Browse products</Button>
          </Sheet>
        ) : (
          <Card variant="outlined" sx={{ borderRadius: 'xl', overflow: 'hidden', bgcolor: '#fff' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 760 }}>
                <Grid container sx={{ px: 2, py: 2, bgcolor: '#f2f7f4' }}>
                  <Grid xs={3}><Typography level="title-sm" sx={{ fontWeight: 900 }}>Specification</Typography></Grid>
                  {items.map((product) => (
                    <Grid xs key={product.id} sx={{ px: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
                        <Box component="img" src={product.image_url || product.source_image_url || '/placeholder-image.jpg'} alt={product.name} sx={{ width: 68, height: 68, objectFit: 'contain', borderRadius: 'md', bgcolor: '#fff' }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography level="title-sm" sx={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</Typography>
                          <Button size="sm" variant="plain" color="danger" startDecorator={<DeleteOutline />} onClick={() => dispatch(removeFromCompare(product.id))}>Remove</Button>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                  {Array.from({ length: 3 - items.length }).map((_, index) => <Grid xs key={`empty-${index}`}><Button variant="outlined" color="success" sx={{ minHeight: 70 }} onClick={() => navigate('/shop')}>+ Add product</Button></Grid>)}
                </Grid>
                <Divider />
                {rows.map(([label, getter]) => (
                  <Grid container key={label} sx={{ px: 2, py: 1.5, '&:nth-of-type(even)': { bgcolor: '#fafcfb' } }}>
                    <Grid xs={3}><Typography level="body-sm" sx={{ fontWeight: 850 }}>{label}</Typography></Grid>
                    {items.map((product) => <Grid xs key={`${product.id}-${label}`} sx={{ px: 1 }}><Typography level="body-sm" sx={{ color: 'text.secondary' }}>{getter(product)}</Typography></Grid>)}
                    {Array.from({ length: 3 - items.length }).map((_, index) => <Grid xs key={`${label}-empty-${index}`} />)}
                  </Grid>
                ))}
                <Grid container sx={{ px: 2, py: 2, bgcolor: '#f2f7f4' }}>
                  <Grid xs={3}><Typography level="title-sm" sx={{ fontWeight: 900 }}>Action</Typography></Grid>
                  {items.map((product) => <Grid xs key={`action-${product.id}`} sx={{ px: 1 }}><Button fullWidth color="success" startDecorator={<ShoppingCartOutlined />} disabled={!Number(product.stock)} onClick={() => addProductToCart(product)}>{Number(product.price) ? 'Add to cart' : 'Check price'}</Button></Grid>)}
                  {Array.from({ length: 3 - items.length }).map((_, index) => <Grid xs key={`action-empty-${index}`} />)}
                </Grid>
              </Box>
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Compare;
