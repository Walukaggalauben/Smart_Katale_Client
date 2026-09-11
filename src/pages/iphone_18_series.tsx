import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, CircularProgress, Sheet, Typography } from '@mui/joy';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../configs';
import { useAppSelector } from '../types/hooks.types';
import ProductCard from '../components/ui/product_card';

const Iphone18Series: React.FC = () => {
  const navigate = useNavigate();
  const catalogueProducts = useAppSelector((state) => state.products.products) || [];
  const [preorderProducts, setPreorderProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const catalogueMatches = catalogueProducts.filter((p: any) =>
      /iphone 18 pro max|iphone 18 pro|iphone duo/i.test(String(p.name || ''))
    );
    const hasAllThree = ['iphone 18 pro', 'iphone 18 pro max', 'iphone duo'].every((needle) =>
      catalogueMatches.some((p: any) => String(p.name || '').toLowerCase().includes(needle))
    );

    if (hasAllThree) {
      setPreorderProducts(catalogueMatches);
      return;
    }

    let cancelled = false;
    const loadPreorders = async () => {
      setLoading(true);
      try {
        const names = ['iPhone 18 Pro', 'iPhone 18 Pro Max', 'iPhone Duo'];
        const results = await Promise.all(names.map((name) =>
          axios.get(`${API_URL}/products/?name=${encodeURIComponent(name)}&limit=10`)
            .then((res) => {
              if (Array.isArray(res.data)) return res.data;
              if (Array.isArray(res.data?.Products)) return res.data.Products;
              return [];
            })
            .catch(() => [])
        ));

        if (!cancelled) {
          const merged = results.flat().filter((p: any, index: number, arr: any[]) =>
            arr.findIndex((x) => String(x.id) === String(p.id)) === index
          );
          setPreorderProducts(merged);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPreorders();
    return () => { cancelled = true; };
  }, [catalogueProducts]);

  const items = useMemo(() => {
    const source = preorderProducts.length ? preorderProducts : catalogueProducts;
    const matches = source.filter((p: any) => /iphone 18|iphone duo/i.test(p.name || ''));
    const order = (name: string) => /iphone 18 pro max/i.test(name) ? 1 : /iphone 18 pro/i.test(name) ? 0 : 2;
    return [...matches].sort((a, b) => order(a.name || '') - order(b.name || ''));
  }, [preorderProducts, catalogueProducts]);

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
            <Typography level="body-md" sx={{ color: 'text.secondary', mt: .5 }}>Pre-order the iPhone 18 Pro, Pro Max, or iPhone Duo with real catalogue images.</Typography>
          </Box>
          <Button variant="outlined" color="success" endDecorator={<ArrowForward />} onClick={() => navigate('/shop')}>Browse all gadgets</Button>
        </Box>

        {loading && !items.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress color="success" /></Box>
        ) : items.length ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', sm: 'repeat(2,minmax(0,1fr))', md: 'repeat(3,minmax(0,1fr))' }, gap: { xs: 1.25, sm: 2.5 } }}>
            {items.map((p: any) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image={p.source_image_url || p.image_url || ''}
                discount={p.discount}
                description={p.description}
                rating={p.rating}
                reviews_count={p.reviews_count}
                views_count={p.views_count}
                status="Pre-order"
              />
            ))}
          </Box>
        ) : (
          <Sheet variant="outlined" sx={{ p: 5, borderRadius: 'xl', textAlign: 'center' }}>
            <Typography level="h3" sx={{ fontWeight: 900 }}>iPhone 18 lineup</Typography>
            <Typography sx={{ color: 'text.secondary', mt: 1 }}>Pre-orders are open. Reserve your preferred model while catalogue stock is being confirmed.</Typography>
            <Button color="success" sx={{ mt: 2 }} onClick={reserve}>Reserve on WhatsApp</Button>
          </Sheet>
        )}
      </Box>
    </Box>
  );
};

export default Iphone18Series;
