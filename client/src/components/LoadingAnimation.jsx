import React from 'react';
import { motion } from 'framer-motion';
import { Loader, Code, TestTube, Sparkles } from 'lucide-react';

/**
 * Loading Animation Component
 * Displays animated loading overlay
 */
const LoadingAnimation = () => {
  const icons = [Code, TestTube, Sparkles];

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Animated Icons */}
        <div className="relative mb-8">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, delay: index * 0.5 },
              }}
              style={{
                transformOrigin: `${50 + index * 30}px 50px`,
              }}
            >
              <div className="p-4 bg-gradient-to-r from-workik-primary to-workik-secondary rounded-2xl">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading Text */}
        <motion.h3
          className="text-2xl font-bold text-white mb-4"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Processing...
        </motion.h3>
        
        <motion.p
          className="text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          AI is working its magic ✨
        </motion.p>

        {/* Loading Bar */}
        <motion.div
          className="w-64 h-2 bg-gray-700 rounded-full mt-6 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-workik-primary to-workik-secondary"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingAnimation;