import React from 'react';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

const Products = () => {
  const products = [
    {
      id: 1,
      name: "Handwoven Ceramic Vase",
      price: "₹69",
      image: "https://images.pexels.com/photos/4992823/pexels-photo-4992823.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "Beautiful handwoven ceramic vase perfect for fresh flowers or as a decorative piece.",
      details: "",
      materials: "",
      size: ""
    },
    {
      id: 2,
      name: "Artisan Wood Photo Frame",
      price: "₹69",
      image: "https://images.pexels.com/photos/6769432/pexels-photo-6769432.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "Rustic wooden photo frame crafted from reclaimed wood, perfect for cherished memories.",
      details: "",
      materials: "",
      size: ""
    },
    {
      id: 3,
      name: "Hand-knitted Wool Scarf",
      price: "₹69",
      image: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "Soft, warm wool scarf hand-knitted with care using traditional techniques.",
      details: "",
      materials: "",
      size: ""
    },
    {
      id: 4,
      name: "Ceramic Coffee Mug Set",
      price: "₹69",
      image: "https://images.pexels.com/photos/5946080/pexels-photo-5946080.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "Set of two handcrafted ceramic mugs with unique glazing patterns.",
      details: "",
      materials: "",
      size: ""
    },
    {
      id: 5,
      name: "Macramé Wall Hanging",
      price: "₹69",
      image: "https://images.pexels.com/photos/6489135/pexels-photo-6489135.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "Intricate macramé wall hanging that adds bohemian charm to any space.",
      details: "",
      materials: "",
      size: ""
    },
    {
      id: 6,
      name: "Handmade Leather Journal",
      price: "₹69",
      image: "https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "Premium leather-bound journal with handmade paper, perfect for writing and sketching.",
      details: "",
      materials: "",
      size: ""
    }
  ];

  return (
    <section id="products" className="py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        {/* Floating geometric shapes */}
        <motion.div
          animate={{
            x: [-15, 15, -15],
            y: [-10, 10, -10],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-1/2 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 opacity-35 blur-lg rounded-full"
        />
        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-30 blur-lg"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, -180],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-32 left-3/4 w-18 h-18 bg-gradient-to-r from-rose-400 to-purple-400 opacity-40 blur-xl transform rotate-12"
        />
        <motion.div
          animate={{
            x: [-30, 30, -30],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-pink-400 to-rose-400 opacity-40 blur-xl transform rotate-45"
        />
        <motion.div
          animate={{
            y: [-25, 25, -25],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-16 w-22 h-22 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-30 blur-lg"
        />
        <motion.div
          animate={{
            y: [0, -40, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-1/3 w-20 h-20 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full opacity-35 blur-lg"
        />
        <motion.div
          animate={{
            x: [-35, 35, -35],
            scale: [1, 1.2, 1],
            rotate: [0, 270, 360],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-40 right-1/2 w-26 h-26 bg-gradient-to-r from-purple-400 to-pink-400 opacity-35 blur-xl transform rotate-45"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-1/4 w-28 h-28 bg-gradient-to-r from-purple-400 to-pink-400 opacity-45 blur-xl rounded-full"
        />
        {/* Floating particles */}
        <motion.div
          animate={{
            y: [-100, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-1/6 w-1.5 h-1.5 bg-purple-500 rounded-full opacity-70"
        />
        <motion.div
          animate={{
            y: [-100, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-1/4 w-2 h-2 bg-pink-500 rounded-full opacity-60"
        />
        <motion.div
          animate={{
            y: [-100, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
          className="absolute top-0 left-1/2 w-1 h-1 bg-rose-500 rounded-full opacity-80"
        />
        <motion.div
          animate={{
            y: [-100, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
          className="absolute top-0 right-1/3 w-1 h-1 bg-purple-500 rounded-full opacity-70"
        />
        <motion.div
          animate={{
            y: [-100, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
            delay: 3
          }}
          className="absolute top-0 right-1/6 w-2 h-2 bg-pink-500 rounded-full opacity-60"
        />
        <motion.div
          animate={{
            y: [-100, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 4
          }}
          className="absolute top-0 left-2/3 w-1.5 h-1.5 bg-rose-500 rounded-full opacity-80"
        />
        <motion.div
          animate={{
            y: [-100, 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className="absolute top-0 right-1/5 w-1.5 h-1.5 bg-purple-500 rounded-full opacity-75"
        />
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
          >
            Our Featured Collection
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Each piece in our collection is lovingly handcrafted with attention to detail.
            Click on any product to learn more about its story and craftsmanship.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: product.id * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Products;