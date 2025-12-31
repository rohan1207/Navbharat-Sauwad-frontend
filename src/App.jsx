import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HeaderProvider } from './context/HeaderContext';
import Header from './components/Header';
import BreakingNewsTicker from './components/BreakingNewsTicker';
import Navigation from './components/Navigation';
import ContactRibbon from './components/ContactRibbon';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopOnRouteChange from './components/ScrollToTopOnRouteChange';

import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import NewsDetail from './pages/NewsDetail';
import EPaper from './pages/EPaper';
import EPaper2 from './pages/EPaper2';
import EPaperViewer from './pages/EPaperViewer';
import EPaperSection from './pages/EPaperSection';
import Gallery from './pages/Gallery';
import Blogs from './pages/Blogs';
import Articles from './pages/Articles';
import Shorts from './pages/Shorts';
import Events from './pages/Events';

function AppContent() {
  const location = useLocation();
  const isEpaperRoute = location.pathname.startsWith('/epaper/') && location.pathname !== '/epaper' && location.pathname !== '/epaper2';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hide header, breaking news, navigation on mobile e-paper routes */}
      {!(isEpaperRoute && isMobile) && (
        <>
          <Header />
          <BreakingNewsTicker />
          <Navigation />
        </>
      )}
      <MainContent>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/epaper" element={<EPaper />} />
          <Route path="/epaper2" element={<EPaper2 />} />
          <Route path="/epaper/:id/page/:pageNo/section/:sectionId" element={<EPaperSection />} />
          <Route path="/epaper/:id" element={<EPaperViewer />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<Blogs />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/article/:id" element={<Articles />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </MainContent>
      {/* Hide contact ribbon and footer on mobile e-paper routes */}
      {!(isEpaperRoute && isMobile) && (
        <>
          <ContactRibbon />
          <Footer />
        </>
      )}
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTopOnRouteChange />
      <HeaderProvider>
        <AppContent />
      </HeaderProvider>
    </Router>
  );
}

export default App;


