import React from 'react';
import { Heart, Instagram, Facebook, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-rose-500" />
              <h3 className="text-2xl font-bold">CraftedWithLove</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Creating beautiful, handmade gifts that tell a story. Each piece is crafted with love, 
              care, and attention to detail that makes it truly special.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">Home</a></li>
              <li><a href="#products" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">Products</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">About</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">Shipping Info</a></li>
              <li><a href="#" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">Returns</a></li>
              <li><a href="#" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">Care Instructions</a></li>
              <li><a href="#" className="text-gray-300 hover:text-rose-500 transition-colors duration-200">Custom Orders</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            &copy; 2024 CraftedWithLove. All rights reserved. Made with ❤️ by artisans.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;