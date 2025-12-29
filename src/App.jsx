import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import NewsDetail from './pages/NewsDetail';
import EPaper from './pages/EPaper';
import EPaper2 from './pages/EPaper2';
import Gallery from './pages/Gallery';
import Blogs from './pages/Blogs';
import Articles from './pages/Articles';
import Shorts from './pages/Shorts';
import Events from './pages/Events';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navigation />
        {/* Padding so content starts below fixed header + nav (mobile header ~134px + nav ~56px) */}
        <main className="flex-grow pt-[198px] md:pt-[180px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/epaper" element={<EPaper />} />
            <Route path="/epaper/:id" element={<EPaper />} />
            <Route path="/epaper2" element={<EPaper2 />} />
            <Route path="/epaper2/:id" element={<EPaper2 />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<Blogs />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/article/:id" element={<Articles />} />
            <Route path="/shorts" element={<Shorts />} />
            <Route path="/events" element={<Events />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;


