import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import NewsDetail from './pages/NewsDetail';
import EPaper from './pages/EPaper';
import Gallery from './pages/Gallery';
import Blogs from './pages/Blogs';
import Articles from './pages/Articles';
import Shorts from './pages/Shorts';
import Events from './pages/Events';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/epaper" element={<EPaper />} />
            <Route path="/epaper/:id" element={<EPaper />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<Blogs />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/article/:id" element={<Articles />} />
            <Route path="/shorts" element={<Shorts />} />
            <Route path="/events" element={<Events />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;


