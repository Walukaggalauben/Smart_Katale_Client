import React, { useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/joy';
import { AutoAwesome } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../types/hooks.types';
import ProductCard from '../ui/product_card';
import type { Product } from '../../types/product.types';

const SmartSuggestions: React.FC = () => {
  const navigate = useNavigate();
  const products = useAppSelector((state) => state.products.products) || [];

  const suggestions = useMemo(() => {
    let history: string[] = [];
    try { history = JSON.parse(localStorage.getItem('minify_recent_products') || '[]'); } catch { history = []; }
    const recent = history.map((id) => products.find((p) => String(p.id) === String(id))).filter(Boolean) as Product[];
    const seed = recent[0];
    const scored = products.filter((p) => !recent.some((r) => String(r.id) === String(p.id))).map((p) => {
      let score = Number(p.rating || 0) * 3 + Math.min(Number(p.views_count || 0), 100) / 100;
      if (seed && p.brand && seed.brand && String(p.brand).toLowerCase() === String(seed.brand).toLowerCase()) score += 4;
      if (seed && p.category && seed.category && String(p.category).toLowerCase() === String(seed.category).toLowerCase()) score += 5;
      if (seed && Number(seed.price) > 0 && Number(p.price) > 0) score += Math.max(0, 3 - Math.abs(Number(p.price) - Number(seed.price)) / Number(seed.price) * 3);
      return { p, score };
    }).sort((a, b) => b.score - a.score).slice(0, 5).map(({ p }) => p);
    return scored;
  }, [products]);

  if (!suggestions.length) return null;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 1.5, md: 4 }, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
        <Box>
          <Chip color="success" variant="soft" startDecorator={<AutoAwesome />}>MINIFY AI Suggestions Beta</Chip>
          <Typography level="h2" sx={{ mt: 1, fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.8rem' } }}>Picked for you</Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 0.4 }}>Smart recommendations based on what you browse and what customers engage with.</Typography>
        </Box>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', display: { xs: 'none', sm: 'block' } }}>Beta</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', sm: 'repeat(3,minmax(0,1fr))', md: 'repeat(5,minmax(0,1fr))' }, gap: { xs: 1, sm: 1.5, md: 2 } }}>
        {suggestions.map((product) => <ProductCard key={product.id} id={product.id} name={product.name} price={product.price} image={product.image_url || product.source_image_url || ''} discount={product.discount} rating={product.rating} reviews_count={product.reviews_count} views_count={product.views_count} status={product.status || product.condition} />)}
      </Box>
      <Box sx={{ textAlign: 'center', mt: 2 }}><Typography component="button" onClick={() => navigate('/shop')} sx={{ border: 0, bgcolor: 'transparent', color: '#006b3c', fontWeight: 800, cursor: 'pointer' }}>Explore the full catalogue →</Typography></Box>
    </Box>
  );
};

export default SmartSuggestions;
