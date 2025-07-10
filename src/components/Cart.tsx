import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { state, dispatch } = useCart();

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    toast.success('Item removed from cart');
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    toast.success('Checkout functionality would be implemented here!');
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2 text-rose-500" />
                Cart ({getTotalItems()})
              </h2>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add some beautiful handmade items!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                        <p className="text-rose-500 font-bold">{item.price}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Minus className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="font-semibold text-gray-800 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Plus className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {state.items.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-rose-500">${getTotalPrice()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;