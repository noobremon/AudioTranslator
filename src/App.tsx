import React from 'react';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cart from './components/Cart';

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen">
        <Header />
        <Hero />
        <Products />
        <About />
        <Contact />
        <Footer />
        <Cart />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#374151',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </CartProvider>
  );
}

export default App;