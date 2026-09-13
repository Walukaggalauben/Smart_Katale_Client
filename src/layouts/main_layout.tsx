import Footer from '../components/common/footer';
import Header from '../components/common/header';
import { Outlet } from 'react-router-dom';
import HorizontalProductSwiper from '../components/common/product_carousel';
import { Box, Button, CircularProgress, Typography, Chip } from '@mui/joy';
import { useEffect, useState } from 'react';
import { FetchAllProductsThunk } from '../Slices/productSlice';
import { useAppDispatch, useAppSelector } from '../types/hooks.types';
import DynamicBreadcrumb from '../components/ui/bread_crumb';
import { FaWhatsapp } from 'react-icons/fa';
import SmartSuggestions from '../components/common/smart_suggestions';
import ProductCard from '../components/ui/product_card';



const WHATSAPP_NUMBER = '256787808501';

const Home = () => {
  const dispatch = useAppDispatch();

  const { products, loading: productsLoading, error: productsError } = useAppSelector(
    (state) => state.products
  );

  const [productRows, setProductRows] = useState<any[]>([]);

  useEffect(() => {
    dispatch(FetchAllProductsThunk(5000));
  }, [dispatch]);

  useEffect(() => {
    if (products && products.length > 0) {
      generateRandomRows();
    }
  }, [products]);

  const generateRandomRows = () => {
    if (!products || products.length === 0) return;

    const byName = (patterns: string[]) =>
      products.filter((p: any) => {
        const n = String(p.name || '').toLowerCase();
        return patterns.some((x) => n.includes(x));
      });

    // Shuffle independently on every catalogue load so the homepage
    // does not become a permanently fixed product list.
    const shuffle = <T,>(items: T[]) => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const uniqueProducts = (items: any[]) => {
      const seen = new Set<string>();
      return [...items]
        .sort((a: any, b: any) => Number(Boolean(b?.source_image_url || b?.image_url)) - Number(Boolean(a?.source_image_url || a?.image_url)))
        .filter((item: any) => {
          const key = String(item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    };

    const sections = [
      { title: '🔥 Latest & Trending', items: byName(['galaxy s26', 'z fold 8', 'pixel 11', 'iphone 17']) },
      { title: '📱 Samsung Galaxy', items: byName(['samsung galaxy']) },
      { title: '✨ Google Pixel', items: byName(['google pixel']) },
      { title: '💎 Premium Phones', items: products.filter((p: any) => Number(p.price) >= 2500000) },
      { title: '💰 Best Value Deals', items: products.filter((p: any) => Number(p.price) > 0 && Number(p.price) <= 1500000) },
      { title: '📲 Tablets & Large Screens', items: products.filter((p: any) => /tablet|ipad|tab |kindle|fire /i.test(String(p.name || ''))) },
      { title: '🆕 New Arrivals', items: products.filter((p: any) => String(p.status || '').toLowerCase() === 'brand new') },
    ];

    const rows = sections
      .filter((section) => section.items.length > 0)
      .map((section, i) => ({
        id: `row-${i}-${section.title}`,
        title: section.title,
        products: shuffle(uniqueProducts(section.items)).slice(0, 15),
      }));

    setProductRows(rows);
  };

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(
      'Hello Minify Gadgets! I would like to make an order.'
    );

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <>
      <Header />

      <Box
        sx={{
          mt: 4,
          mb: 4,
          position: 'relative',
        }}
      >
        <DynamicBreadcrumb />

        {/* =====================================================
            HOMEPAGE CONTENT
        ===================================================== */}
        <Outlet />

        {/* =====================================================
            WHATSAPP ORDER CTA
        ===================================================== */}
        <Box
          sx={{
            maxWidth: 1400,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            mb: 5,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: { xs: '20px', md: '28px' },
              background:
                'linear-gradient(135deg, #003d2b 0%, #006b3c 55%, #008f55 100%)',
              px: { xs: 2.5, sm: 4, md: 6 },
              py: { xs: 3, md: 4 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              boxShadow:
                '0 14px 35px rgba(0, 105, 92, 0.18)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: 180,
                height: 180,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.06)',
                right: -60,
                top: -80,
              }}
            />

            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Typography
                level="title-lg"
                sx={{
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: {
                    xs: '1.25rem',
                    md: '1.5rem',
                  },
                }}
              >
                Found something you like?
              </Typography>

              <Typography
                level="body-md"
                sx={{
                  color: 'rgba(255,255,255,0.82)',
                  mt: 0.5,
                }}
              >
                Order directly from Minify Gadgets on WhatsApp.
              </Typography>
            </Box>

            <Button
              size="lg"
              onClick={handleWhatsAppOrder}
              startDecorator={<FaWhatsapp size={23} />}
              sx={{
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
                borderRadius: '999px',
                px: { xs: 2.5, md: 3.5 },
                fontWeight: 900,
                bgcolor: '#25D366',
                color: '#fff',
                boxShadow:
                  '0 8px 20px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: '#20bd5a',
                },
              }}
            >
              Order on WhatsApp
            </Button>
          </Box>
        </Box>

        {/* =====================================================
            IPHONE 18 PRO PRE-ORDER
        ===================================================== */}
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 1.5, md: 4 }, mb: 6 }}>
          <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: { xs: '22px', md: '30px' }, bgcolor: '#0b0d0c', color: '#fff', px: { xs: 2.5, sm: 4, md: 6 }, py: { xs: 3.5, md: 5 }, boxShadow: '0 16px 45px rgba(0,0,0,.16)' }}>
            <Box sx={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.06)', right: -80, top: -100 }} />
            <Chip color="danger" variant="solid" sx={{ fontWeight: 900 }}>PRE-ORDER</Chip>
            <Typography level="h2" sx={{ color: '#fff', fontWeight: 950, mt: 1.5, fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.2rem' } }}>iPhone 18 Pro Series</Typography>
            <Typography level="body-lg" sx={{ color: 'rgba(255,255,255,.78)', maxWidth: 760, mt: 1 }}>iPhone 18 Pro and iPhone 18 Pro Max. A20 Pro, variable-aperture 48MP Fusion Main camera, and the next generation of Apple Intelligence.</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.2 }}>
              {['256GB', '512GB', '1TB', '2TB'].map((storage) => <Chip key={storage} variant="soft" sx={{ bgcolor: 'rgba(255,255,255,.1)', color: '#fff' }}>{storage}</Chip>)}
              {['Black', 'Silver', 'Glacier', 'Burgundy'].map((color) => <Chip key={color} variant="soft" sx={{ bgcolor: 'rgba(255,255,255,.1)', color: '#fff' }}>{color}</Chip>)}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mt: 3 }}>
              <Button size="lg" color="success" onClick={handleWhatsAppOrder} sx={{ borderRadius: '999px', fontWeight: 900 }}>Reserve on WhatsApp</Button>
              <Typography level="body-sm" sx={{ color: 'rgba(255,255,255,.68)' }}>Pre-orders open September 12 • Availability starts September 18</Typography>
            </Box>
          </Box>
        </Box>

        {/* =====================================================
            IPHONE 18 PRE-ORDER PRODUCTS
        ===================================================== */}
        {(() => {
          const preorderProducts = (products || [])
            .filter((p: any) => /iphone 18|iphone duo/i.test(String(p.name || '')))
            .sort((a: any, b: any) => {
              const rank = (name: string) => /iphone 18 pro max/i.test(name) ? 1 : /iphone 18 pro/i.test(name) ? 0 : 2;
              return rank(String(a.name || '')) - rank(String(b.name || ''));
            });

          if (!preorderProducts.length) return null;

          return (
            <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 1.5, md: 4 }, mb: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography level="h2" sx={{ fontWeight: 900 }}>iPhone 18 Pre-order</Typography>
                <Typography level="body-md" sx={{ color: 'text.secondary', mt: .5 }}>Reserve the latest Pro models and iPhone Duo using the actual catalogue images.</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', sm: 'repeat(2,minmax(0,1fr))', md: 'repeat(3,minmax(0,1fr))' }, gap: { xs: 1.25, sm: 2.5 } }}>
                {preorderProducts.slice(0, 3).map((p: any) => (
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
            </Box>
          );
        })()}

        {/* =====================================================
            OFFICIAL PRODUCT VIDEOS
        ===================================================== */}
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 1.5, md: 4 }, mb: 6 }}>
          <Typography level="h2" sx={{ fontWeight: 900, mb: 0.5 }}>Watch the latest</Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>Official product videos from the brands you shop.</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {[
              { id: 'apple-iphone-air', brand: 'Apple', title: 'Introducing iPhone Air — Official Apple Video', href: 'https://www.youtube.com/watch?v=M0au92yebLQ', image: 'https://www.minifygadgets.com/catalogue/iphone-17-air-256gb.jpg' },
              { id: 'samsung-unpacked-2026', brand: 'Samsung', title: 'Galaxy Unpacked July 2026 — Official Highlights', href: 'https://www.youtube.com/watch?v=9PTRQjP6yAQ', image: 'https://i.ytimg.com/vi/9PTRQjP6yAQ/hqdefault.jpg' },
            ].map((video) => (
              <Box
                key={video.id}
                component="a"
                href={video.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  position: 'relative',
                  display: 'block',
                  overflow: 'hidden',
                  borderRadius: 'xl',
                  bgcolor: '#101312',
                  aspectRatio: '16/9',
                  boxShadow: '0 10px 30px rgba(0,0,0,.12)',
                  textDecoration: 'none',
                  '&:hover img': { transform: 'scale(1.025)' },
                }}
              >
                <Box
                  component="img"
                  src={video.image}
                  alt={video.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .2s ease' }}
                />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,.18)' }}>
                  <Box sx={{ px: 2, py: 1, borderRadius: '999px', bgcolor: 'rgba(0,0,0,.76)', color: '#fff', fontWeight: 900, fontSize: { xs: '0.78rem', sm: '0.9rem' } }}>▶ Watch {video.brand} official video</Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <SmartSuggestions />

        {/* =====================================================
            PRODUCT ROWS
        ===================================================== */}
        {productsError && !products?.length && (
          <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 1.5, md: 4 }, mb: 3 }}>
            <Box sx={{ p: 2, borderRadius: 'lg', bgcolor: '#fff4e5', border: '1px solid #f0c36d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography level="title-sm" sx={{ fontWeight: 900 }}>Catalogue temporarily unavailable</Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Please retry the catalogue connection.</Typography>
              </Box>
              <Button size="sm" color="success" variant="solid" onClick={() => dispatch(FetchAllProductsThunk(5000))}>Retry catalogue</Button>
            </Box>
          </Box>
        )}
        {productsLoading && !products?.length && !productsError && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size="sm" color="success" />
            <Typography level="body-sm" sx={{ ml: 1 }}>Loading catalogue…</Typography>
          </Box>
        )}
        {productRows.length > 0 ? (
          productRows.map((row) => (
            <Box key={row.id} sx={{ mb: 6 }}>
              <HorizontalProductSwiper
                title={row.title}
                products={row.products}
                slidesPerView={5}
                spaceBetween={16}
              />
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Catalogue products will appear here once they are loaded.
            </Typography>
          </Box>
        )}
      </Box>

      <Footer />
    </>
  );
};

export default Home;
