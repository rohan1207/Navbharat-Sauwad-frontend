import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LuxuryHomepage Page from "./pages/Page";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ContactUs from "./pages/ContactUS";
import ScrollToTop from "./components/ScrollToTop";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* Add this here */}
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/" element={<LuxuryHomepage Page />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
      <ChatBox />
      <Footer />
    </Router>
  );
}

export default App;
