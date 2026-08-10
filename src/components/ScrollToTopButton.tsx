import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 sm:right-6 z-40 bg-slate-900/90 hover:bg-[#EE4D2D] text-white border border-slate-700/80 hover:border-orange-500 shadow-xl px-3.5 py-2.5 rounded-2xl flex items-center gap-2 backdrop-blur-md transition-colors cursor-pointer group hover:scale-105 active:scale-95"
          title="Quay lại đầu trang"
          aria-label="Quay lại đầu trang"
        >
          <div className="bg-slate-800 group-hover:bg-orange-600 p-1.5 rounded-xl transition-colors">
            <ArrowUp className="w-4 h-4 text-orange-400 group-hover:text-white transition-colors animate-bounce" />
          </div>
          <span className="text-xs font-bold tracking-tight hidden sm:inline-block pr-0.5">
            Quay lại đầu trang
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
