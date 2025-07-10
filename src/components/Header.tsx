import React, { useState } from 'react';
import { Menu, X, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state, dispatch } = useCart();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-rose-500" />
            <h1 className="text-2xl font-bold text-gray-800">CraftedWithLove</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-rose-500 transition-colors duration-200"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('products')}
              className="text-gray-700 hover:text-rose-500 transition-colors duration-200"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-rose-500 transition-colors duration-200"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-rose-500 transition-colors duration-200"
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative p-2 text-gray-700 hover:text-rose-500 transition-colors duration-200"
            >
              <ShoppingBag className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 mt-4">
              <button
                onClick={() => scrollToSection('home')}
                className="text-gray-700 hover:text-rose-500 transition-colors duration-200 text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('products')}
                className="text-gray-700 hover:text-rose-500 transition-colors duration-200 text-left"
              >
                Products
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-rose-500 transition-colors duration-200 text-left"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-gray-700 hover:text-rose-500 transition-colors duration-200 text-left"
              >
                Contact
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;