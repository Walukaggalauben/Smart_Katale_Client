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



const WHATSAPP_NUMBER = '256787808501';

const Home = () => {
  const dispatch = useAppDispatch();

  const { products, loading: productsLoading } = useAppSelector(
    (state) => state.products
  );
  const { loading: userLoading } = useAppSelector(
    (state) => state.user
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
        products: shuffle(section.items).slice(0, 15),
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

  // Only block the entire application while the initial
  // master catalogue is being loaded.
  //
  // Once products exist, filtering/searching must never
  // unmount the Outlet. Source filtering has its own
  // loading state in Redux.
  if ((!products && productsLoading) || userLoading) {
    return (
      <>
        <Header />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
            gap: 2,
          }}
        >
          <CircularProgress
            size="sm"
            variant="solid"
            color="success"
          />

          <Typography level="body-sm" component="h4">
            Loading.....
          </Typography>
        </Box>

        <Footer />
      </>
    );
  }

  if (!products || products.length === 0) {
    return (
      <>
        <Header />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
            gap: 2,
          }}
        >
          <Typography level="h3">
            No Products Available
          </Typography>

          <Typography level="body-lg">
            Please check back later or try refreshing the page.
          </Typography>
        </Box>

        <Footer />
      </>
    );
  }

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
            OFFICIAL PRODUCT VIDEOS
        ===================================================== */}
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 1.5, md: 4 }, mb: 6 }}>
          <Typography level="h2" sx={{ fontWeight: 900, mb: 0.5 }}>Watch the latest</Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 2 }}>Official product videos from the brands you shop.</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ overflow: 'hidden', borderRadius: 'xl', bgcolor: '#101312', aspectRatio: '16/9', boxShadow: '0 10px 30px rgba(0,0,0,.12)' }}>
              <iframe width="100%" height="100%" src="https://www.youtube.com/embed/_-AS5DtDeqs" title="Apple iPhone product video" loading="lazy" style={{ border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </Box>
            <Box sx={{ overflow: 'hidden', borderRadius: 'xl', bgcolor: '#101312', aspectRatio: '16/9', boxShadow: '0 10px 30px rgba(0,0,0,.12)' }}>
              <iframe width="100%" height="100%" src="https://www.youtube.com/embed/SA93zbnoR4U" title="Samsung Galaxy product video" loading="lazy" style={{ border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </Box>
          </Box>
        </Box>

        <SmartSuggestions />

        {/* =====================================================
            PRODUCT ROWS
        ===================================================== */}
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
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
            }}
          >
            <CircularProgress
              size="sm"
              sx={{ mt: 2 }}
            />
          </Box>
        )}
      </Box>

      <Footer />
    </>
  );
};

export default Home;
