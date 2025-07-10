import React from 'react';
import { Heart, Award, Users, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Crafted with Love",
      description: "Every piece is made with passion and care, ensuring quality that lasts."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Artisan Quality",
      description: "Traditional techniques meet modern design in every handcrafted item."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Personal Touch",
      description: "Each piece tells a story and connects you to the artisan who made it."
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Eco-Friendly",
      description: "Sustainable materials and practices in every step of our process."
    }
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Floating geometric shapes */}
        <motion.div
          animate={{
            x: [-20, 20, -20],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-12 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-45 blur-lg rounded-full"
        />
        <motion.div
          animate={{
            x: [-25, 25, -25],
            y: [-15, 15, -15],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-16 left-16 w-28 h-28 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-40 blur-xl transform rotate-12"
        />
        <motion.div
          animate={{
            y: [-30, 30, -30],
            rotate: [0, 120, 240],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-24 right-1/3 w-22 h-22 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-40 blur-xl transform rotate-30"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 right-12 w-36 h-36 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-35 blur-2xl"
        />
        <motion.div
          animate={{
            x: [-40, 40, -40],
            y: [-15, 15, -15],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-purple-400 to-blue-400 opacity-35 blur-lg rounded-full"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-24 left-1/4 w-24 h-24 bg-gradient-to-r from-purple-400 to-blue-400 opacity-45 blur-lg rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            x: [-25, 25, -25],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 right-1/2 w-26 h-26 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-40 blur-xl rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-16 right-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-50 blur-xl transform rotate-45"
        />
        {/* Floating dots */}
        <motion.div
          animate={{
            y: [-80, 80],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-1/8 w-2 h-2 bg-blue-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-80, 80],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-1/5 w-2 h-2 bg-indigo-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-80, 80],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5
          }}
          className="absolute top-0 left-2/5 w-1.5 h-1.5 bg-indigo-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-80, 80],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
          className="absolute top-0 right-1/4 w-1.5 h-1.5 bg-purple-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-80, 80],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
          className="absolute top-0 right-1/2 w-1 h-1 bg-blue-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-80, 80],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
            delay: 3
          }}
          className="absolute top-0 left-3/4 w-1 h-1 bg-blue-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-80, 80],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 4
          }}
          className="absolute top-0 right-1/8 w-2 h-2 bg-purple-500 rounded-full"
        />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
            >
              Our Story
            </motion.h2>
            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Welcome to CraftedWithLove, where every piece tells a story of passion, 
                dedication, and timeless craftsmanship. Founded in 2020, our journey began 
                with a simple belief: that handmade goods carry a special energy that 
                mass-produced items simply cannot match.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                Our skilled artisans use time-honored techniques passed down through 
                generations, combined with contemporary design sensibilities. Each item 
                is carefully crafted in small batches, ensuring that every piece is 
                unique and made with the utmost attention to detail.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
              >
                We believe in sustainable practices, using eco-friendly materials and 
                supporting local communities. When you choose our handmade gifts, you're 
                not just buying a product – you're becoming part of a story that values 
                craftsmanship, sustainability, and human connection.
              </motion.p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-rose-500 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;