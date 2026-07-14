import React from 'react';
import { motion } from 'motion/react';

const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative mb-8"
      >
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-[#D4A017]/20 rounded-full"></div>
        {/* Spinning indicator */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#D4A017] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-sm font-medium text-slate-500 uppercase tracking-[0.2em]">Preparing Zanzibar Experience</p>
        <div className="mt-2 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              className="w-1 h-1 bg-[#D4A017] rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PageLoader;
