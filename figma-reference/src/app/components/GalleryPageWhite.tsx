import { ArrowLeft, X, Home, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { NavigationMenu } from './NavigationMenu';

// Import actual Cafe Locco images
import img1 from 'figma:asset/94db773d89d517f27fad44c93395a9345262e4a9.png';
import img2 from 'figma:asset/8d592132b4723d0a30fe832ed1d0e7888f350b37.png';
import img3 from 'figma:asset/f741e1529a4fe2cedc7d5a26aeff4af92d803148.png';
// TODO: Add remaining 49 images (img4 through img52) with their figma:asset hashes

interface GalleryPageWhiteProps {
  onBack: () => void;
  onNavigate: (page: 'home' | 'subscription' | 'subscriber-dashboard' | 'reservations' | 'menu' | 'about-us' | 'social-media' | 'gallery' | 'contact-us' | 'manage-subscription') => void;
}

export function GalleryPageWhite({ onBack, onNavigate }: GalleryPageWhiteProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cafe Locco gallery images in strict numerical order
  const galleryImages = [
    img1,
    img2,
    img3,
    // Add remaining 49 image imports here
  ];

  // Lazy loading with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setLoadedImages((prev) => new Set(prev).add(index));
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );

    const images = document.querySelectorAll('.gallery-image-container');
    images.forEach((img) => observer.observe(img));

    return () => observer.disconnect();
  }, []);

  const openModal = (index: number) => {
    setSelectedImage(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    if (direction === 'prev') {
      setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1);
    } else {
      setSelectedImage(selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      
      if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  return (
    <div className="w-full h-full bg-white relative overflow-y-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Home Button - Left */}
          <button 
            onClick={() => onNavigate('home')}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Home"
          >
            <Home className="w-5 h-5 text-gray-900" strokeWidth={2} />
          </button>
          
          {/* Page Title - Center */}
          <h1 
            className="text-gray-900"
            style={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: '20px',
              fontWeight: '600',
              letterSpacing: '0.03em',
            }}
          >
            GALLERY
          </h1>

          {/* Menu Button - Right */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-gray-900" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Gallery Grid - 2 Column Layout */}
      <div 
        className="grid grid-cols-2 px-6 py-6 pb-[34px]"
        style={{
          gap: '16px',
          columnGap: '12px',
        }}
      >
        {galleryImages.map((imageUrl, index) => (
          <motion.div
            key={index}
            data-index={index}
            className="gallery-image-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
          >
            <button
              onClick={() => openModal(index)}
              className="w-full rounded-lg overflow-hidden relative group cursor-pointer"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Subtle Hover Effect */}
              <div 
                className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300 z-10 pointer-events-none"
              />
              
              {loadedImages.has(index) ? (
                <img
                  src={imageUrl}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-auto object-cover"
                  style={{
                    display: 'block',
                  }}
                  loading="lazy"
                />
              ) : (
                <div 
                  className="w-full bg-gray-100 animate-pulse"
                  style={{ aspectRatio: '1/1' }}
                />
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-gray-900/95 flex items-center justify-center"
            onClick={closeModal}
            style={{
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Close Button - Top Right */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" strokeWidth={2} />
            </button>

            {/* Image Counter - Top Left */}
            <div className="absolute top-6 left-6 z-50">
              <div 
                className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm"
                style={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: '14px',
                  letterSpacing: '0.03em',
                }}
              >
                <span className="text-white">
                  {selectedImage + 1} / {galleryImages.length}
                </span>
              </div>
            </div>

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-full max-h-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages[selectedImage]}
                alt={`Gallery image ${selectedImage + 1}`}
                className="max-w-full max-h-[calc(100vh-100px)] object-contain rounded-lg"
                style={{
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                }}
              />

              {/* Previous Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <span className="text-white text-2xl font-light">‹</span>
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <span className="text-white text-2xl font-light">›</span>
              </button>
            </motion.div>

            {/* Swipe Instructions (Mobile) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
              <div 
                className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm"
                style={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: '12px',
                  letterSpacing: '0.03em',
                }}
              >
                <span className="text-white/60">
                  SWIPE LEFT / RIGHT TO NAVIGATE
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Menu */}
      <NavigationMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(page) => {
          setIsMenuOpen(false);
          onNavigate(page);
        }}
      />
    </div>
  );
}