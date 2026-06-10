import { Menu, Crown, Coffee, Calendar, CreditCard, Check, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavigationMenu } from './NavigationMenu';
import coffeeImage from 'figma:asset/5cc577b4b42214f7fca253a537a44df3dc6d970a.png';

interface SubscriberDashboardProps {
  onBack: () => void;
  onNavigate: (page: 'home' | 'subscription' | 'subscriber-dashboard' | 'reservations' | 'menu' | 'about-us' | 'social-media' | 'gallery' | 'contact-us' | 'manage-subscription') => void;
}

export function SubscriberDashboard({ onBack, onNavigate }: SubscriberDashboardProps) {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [claimTime, setClaimTime] = useState('');

  // Check if coffee was already claimed today
  useEffect(() => {
    const lastClaimDate = localStorage.getItem('lastCoffeeClaim');
    const lastClaimTime = localStorage.getItem('lastClaimTime');
    const today = new Date().toDateString();

    if (lastClaimDate === today) {
      setIsClaimed(true);
      setClaimTime(lastClaimTime || '');
    } else {
      setIsClaimed(false);
      setClaimTime('');
    }
  }, []);

  const handleClaim = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeString = `${displayHours}:${displayMinutes} ${ampm}`;
    
    setClaimTime(timeString);
    setIsClaimed(true);
    
    localStorage.setItem('lastCoffeeClaim', now.toDateString());
    localStorage.setItem('lastClaimTime', timeString);
  };

  const today = new Date();
  const dayName = today.toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase();
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <div className="w-full h-full bg-black relative overflow-y-auto">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="flex items-center justify-between p-6">
          <button 
            onClick={() => onNavigate('home')}
            className="w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white transition-colors"
          >
            <Home className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
          <h2 className="text-white text-sm tracking-[0.1em]">MY MEMBERSHIP</h2>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white transition-colors"
          >
            <Menu className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-6">
        
        {/* Coffee Image Section - Date and Image only */}
        <div className="py-8">
          <div className="text-center space-y-6">
            <p className="text-white/40 text-xs tracking-[0.15em]">
              {dayName}, {dateStr}
            </p>

            {/* Coffee Image */}
            <div className="flex justify-center">
              <div className="relative w-full h-64 rounded-3xl overflow-hidden">
                <img 
                  src={coffeeImage}
                  alt="Premium Coffee"
                  className="w-full h-full object-cover"
                />
                {isClaimed && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Check className="w-12 h-12 text-white" strokeWidth={2} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Claim Button - Separate, outside the bordered section */}
        {!isClaimed && (
          <button
            onClick={handleClaim}
            className="w-full py-4 rounded-full bg-black text-white border border-white/20 hover:bg-white hover:text-black transition-all -mt-3"
          >
            <span className="text-xs tracking-[0.1em] font-medium">
              CLAIM YOUR FREE COFFEE
            </span>
          </button>
        )}

        {/* Claimed Status */}
        {isClaimed && (
          <div className="text-center space-y-2 py-4">
            <h3 className="text-white text-sm tracking-[0.05em]">
              TODAY'S COFFEE CLAIMED
            </h3>
            <p className="text-white/40 text-xs tracking-[0.05em]">
              SEE YOU TOMORROW
            </p>
            <p className="text-white/30 text-[10px] tracking-[0.05em]">
              CLAIMED AT {claimTime}
            </p>
          </div>
        )}

        {/* Membership Details */}
        <div className="border border-white/20 rounded-[2rem] p-8">
          <div className="text-center space-y-4">
            <h3 className="text-white text-sm tracking-[0.05em]">
              PREMIUM MEMBERS
            </h3>
            <p className="text-white/60 text-xs tracking-[0.05em]">
              MEMBER SINCE NOVEMBER 2025
            </p>
            
            <button className="w-full py-3 rounded-full bg-white text-black mt-6">
              <span className="text-xs tracking-[0.1em] font-medium">
                VIP ACCESS GRANTED
              </span>
            </button>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="border border-white/20 rounded-[2rem] p-8">
          <div className="space-y-6">
            <h3 className="text-white text-sm tracking-[0.05em] text-center">
              SUBSCRIPTION DETAILS
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white text-xs tracking-[0.05em]">MONTHLY PLAN</span>
                <span className="text-white text-sm tracking-[0.05em]">19.99</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white text-xs tracking-[0.05em]">NEXT BILL</span>
                <span className="text-white text-sm tracking-[0.05em]">•••</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
          <button
            onClick={() => onNavigate('manage-subscription')}
            className="w-full py-4 border border-white/20 text-white rounded-full hover:bg-white hover:text-black transition-all"
          >
            <span className="text-xs tracking-[0.1em]">
              MANAGE SUBSCRIPTION
            </span>
          </button>

          <button className="text-white/40 hover:text-white/60 transition-colors text-xs tracking-[0.05em] w-full py-2">
            CANCEL SUBSCRIPTION
          </button>
        </div>
      </div>

      {/* Navigation Menu Overlay */}
      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(page) => {
          setIsMenuOpen(false);
          onNavigate(page);
        }}
        isLoggedIn={true}
      />
    </div>
  );
}