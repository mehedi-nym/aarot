import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import CheckoutPage from './pages/CheckoutPage';
import ContentPage from './pages/ContentPage';
import HomePage from './pages/HomePage';
import OffersPage from './pages/OffersPage';
import TrackOrderPage from './pages/TrackOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ScrollToTop from './ScrollToTop';

function App() {
  return (
    <AppShell>
      <ScrollToTop />
      <Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/offers" element={<OffersPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/about" element={<ContentPage />} />
  <Route path="/policy" element={<ContentPage />} />
  
  {/* Specific dynamic route first */}
  <Route path="/track/:orderCode" element={<OrderDetailsPage />} />
  
  {/* General track page second */}
  <Route path="/track" element={<TrackOrderPage />} />
</Routes>
    </AppShell>
  );
}

export default App;
