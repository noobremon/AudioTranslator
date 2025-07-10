import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('success');
        }, 2000);
      }),
      {
        loading: 'Sending your message...',
        success: 'Message sent successfully! We\'ll get back to you soon.',
        error: 'Failed to send message. Please try again.',
      }
    ).then(() => {
      setFormData({ name: '', email: '', message: '' });
    });
  };

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Floating geometric shapes */}
        <motion.div
          animate={{
            x: [-25, 25, -25],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-16 left-1/4 w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-45 blur-lg rounded-full"
        />
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-12 w-32 h-32 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-40 blur-xl rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            y: [-20, 20, -20],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-28 right-1/4 w-24 h-24 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-40 blur-xl rounded-full"
        />
        <motion.div
          animate={{
            x: [0, 35, 0],
            rotate: [0, 270, 360],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-16 w-28 h-28 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-45 blur-lg transform rotate-45"
        />
        <motion.div
          animate={{
            y: [-35, 35, -35],
            x: [-15, 15, -15],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/6 w-22 h-22 bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-40 blur-lg transform rotate-60"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-1/3 w-24 h-24 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full opacity-35 blur-2xl"
        />
        <motion.div
          animate={{
            x: [-30, 30, -30],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-28 right-1/2 w-26 h-26 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-35 blur-xl rounded-full"
        />
        <motion.div
          animate={{
            x: [-30, 30, -30],
            y: [0, -15, 0],
            rotate: [0, -90, -180],
          }}
          transition={{
            duration: 23,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-1/4 w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-50 blur-xl transform rotate-12"
        />
        {/* Floating particles */}
        <motion.div
          animate={{
            y: [-90, 90],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-1/8 w-2 h-2 bg-emerald-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-90, 90],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-1/6 w-2.5 h-2.5 bg-teal-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-90, 90],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
          className="absolute top-0 left-2/5 w-1.5 h-1.5 bg-cyan-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-90, 90],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
            delay: 1.5
          }}
          className="absolute top-0 right-1/5 w-1.5 h-1.5 bg-emerald-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-90, 90],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
          className="absolute top-0 right-1/3 w-2 h-2 bg-teal-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-90, 90],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear",
            delay: 3
          }}
          className="absolute top-0 left-2/3 w-2 h-2 bg-cyan-500 rounded-full"
        />
        <motion.div
          animate={{
            y: [-90, 90],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "linear",
            delay: 4
          }}
          className="absolute top-0 right-1/8 w-1.5 h-1.5 bg-emerald-500 rounded-full"
        />
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have a question about our products or want to place a custom order? 
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-rose-500 p-3 rounded-full">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Email Us</h3>
                <p className="text-gray-600">hello@craftedwithlove.com</p>
                <p className="text-gray-600">orders@craftedwithlove.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-rose-500 p-3 rounded-full">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Call Us</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
                <p className="text-gray-600">Mon-Fri: 9AM-6PM EST</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-rose-500 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Visit Our Studio</h3>
                <p className="text-gray-600">123 Artisan Street</p>
                <p className="text-gray-600">Creative District, NY 10001</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tell us about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;