import { motion, AnimatePresence } from 'motion/react';
import { X, Coffee, CreditCard, Calendar, Info, Share2, User, Crown, Image, Mail } from 'lucide-react';
import logo from 'figma:asset/70bb49b4e4a6e158ddb9f6318c5fd98b10237bca.png';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: 'home' | 'subscription' | 'subscriber-dashboard' | 'reservations' | 'menu' | 'about-us' | 'social-media' | 'gallery' | 'contact-us') => void;
  isLoggedIn?: boolean;
}

export function NavigationMenu({ isOpen, onClose, onNavigate, isLoggedIn = false }: NavigationMenuProps) {
  // Dynamically build menu sections based on login state
  const menuSections = {
    myCafeLoco: isLoggedIn
      ? [{ icon: Crown, label: 'MY MEMBERSHIP', page: 'subscriber-dashboard' as const }]
      : [],
    other: [
      { icon: Info, label: 'OUR STORY', page: 'about-us' as const },
      { icon: Coffee, label: 'MENU', page: 'menu' as const },
      { icon: Calendar, label: 'RESERVATIONS', page: 'reservations' as const },
      { icon: Image, label: 'GALLERY', page: 'gallery' as const },
      ...(isLoggedIn
        ? [] // If logged in, don't show subscription page in "Other" section
        : [{ icon: CreditCard, label: 'MEMBERSHIP', page: 'subscription' as const }]
      ),
      { icon: Mail, label: 'CONTACT US', page: 'contact-us' as const },
      { icon: Share2, label: 'SOCIALS', page: 'social-media' as const },
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-40 bg-black/80"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'tween', 
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className="absolute top-0 right-0 bottom-0 z-50 w-[85%] bg-black"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white/40 transition-colors rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-white" strokeWidth={1.5} />
            </button>

            {/* Menu Items */}
            <div className="flex flex-col h-full px-6 pt-20 pb-12 overflow-y-auto">
              <div className="space-y-8 flex-1">

                {/* My Cafe LOCCO Section - Only show when logged in */}
                {isLoggedIn && menuSections.myCafeLoco.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white text-xs tracking-[0.15em] mb-4 px-2">MY CAFÉ LOCCO</h3>
                    {menuSections.myCafeLoco.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => onNavigate(item.page)}
                        className="w-full flex items-center gap-4 py-3 px-4 border-2 border-white/20 rounded-full hover:bg-white hover:text-black hover:border-white transition-all group"
                      >
                        <img src={logo} alt="Cafe Logo" className="w-8 h-8" />
                        <span className="text-white text-sm tracking-[0.05em] group-hover:text-black transition-colors flex-1 text-right pr-2">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Other Section */}
                <div className="space-y-3">
                  <h3 className="text-white text-xs tracking-[0.15em] mb-4 px-2">OTHER</h3>
                  {menuSections.other.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => onNavigate(item.page)}
                      className="w-full flex items-center gap-4 py-3 px-4 border-2 border-white/20 rounded-full hover:bg-white hover:text-black hover:border-white transition-all group"
                    >
                      <img src={logo} alt="Cafe Logo" className="w-8 h-8" />
                      <span className="text-white text-sm tracking-[0.05em] group-hover:text-black transition-colors flex-1 text-right pr-2">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}