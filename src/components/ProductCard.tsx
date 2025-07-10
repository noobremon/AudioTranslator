import React, { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
  details: string;
  materials: string;
  size: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { dispatch } = useCart();

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      }
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="group perspective-1000 w-full h-96">
      <div
        className={`relative w-full h-full duration-700 preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-lg overflow-hidden bg-white">
          <div className="relative h-64 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2">
              <Heart className="h-5 w-5 text-gray-600 hover:text-rose-500 transition-colors duration-200" />
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-rose-500">{product.price}</span>
              <span className="text-sm text-gray-500 italic">Click to flip</span>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-lg bg-gradient-to-br from-rose-50 to-orange-50 p-6">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{product.name}</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">About this piece:</h4>
                  <p className="text-gray-600 text-sm">{product.details || "Details coming soon..."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Materials:</h4>
                  <p className="text-gray-600 text-sm">{product.materials || "Materials info coming soon..."}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Size:</h4>
                  <p className="text-gray-600 text-sm">{product.size || "Size info coming soon..."}</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-rose-500">{product.price}</span>
                <button 
                  onClick={addToCart}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 italic text-center">Click to flip back</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;