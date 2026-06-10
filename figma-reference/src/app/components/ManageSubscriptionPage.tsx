import { ArrowLeft, Menu, Home, Calendar, CreditCard, XCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { NavigationMenu } from './NavigationMenu';

interface ManageSubscriptionPageProps {
  onBack: () => void;
  onNavigate: (page: 'home' | 'subscription' | 'subscriber-dashboard' | 'reservations' | 'menu' | 'about-us' | 'social-media' | 'gallery' | 'contact-us') => void;
}

export function ManageSubscriptionPage({ onBack, onNavigate }: ManageSubscriptionPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Calculate next renewal date (1 month from today)
  const getNextRenewalDate = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return nextMonth.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

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
          <h2 className="text-white text-sm tracking-[0.1em]">MANAGE SUBSCRIPTION</h2>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white transition-colors"
          >
            <Menu className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-6 pb-24">
        
        {/* Current Plan */}
        <div className="border border-white/20 rounded-[2rem] p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-white text-sm tracking-[0.05em]">
                ACTIVE SUBSCRIPTION
              </h3>
              <p className="text-white/60 text-xs tracking-[0.05em]">
                PREMIUM MONTHLY
              </p>
            </div>
            
            <div className="py-4">
              <p className="text-white text-4xl tracking-wider">
                £19.99
              </p>
              <p className="text-white/60 text-xs tracking-[0.1em] mt-2">
                PER MONTH
              </p>
            </div>
          </div>
        </div>

        {/* Renewal Information */}
        <div className="border border-white/20 rounded-[2rem] p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-white text-sm tracking-[0.05em]">
              NEXT RENEWAL DATE
            </h3>
            <p className="text-white/60 text-xs tracking-[0.05em]">
              {getNextRenewalDate().toUpperCase()}
            </p>
            <p className="text-white/40 text-[10px] tracking-[0.05em] leading-relaxed uppercase pt-2">
              YOUR SUBSCRIPTION WILL AUTOMATICALLY RENEW ON THIS DATE
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border border-white/20 rounded-[2rem] p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-white text-sm tracking-[0.05em]">
              PAYMENT METHOD
            </h3>
            <p className="text-white/60 text-xs tracking-[0.05em]">
              VISA ENDING IN 4242
            </p>
            <button className="text-white/40 hover:text-white/60 transition-colors text-xs tracking-[0.05em] pt-2">
              UPDATE PAYMENT METHOD
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="border border-white/20 rounded-[2rem] p-8">
          <div className="space-y-6">
            <h3 className="text-white text-sm tracking-[0.05em] text-center">
              YOUR BENEFITS
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-white/60 text-xs tracking-[0.05em]">
                  ONE COMPLIMENTARY COFFEE EVERY DAY
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-white/60 text-xs tracking-[0.05em]">
                  PRIORITY SEATING AND RESERVATIONS
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-white/60 text-xs tracking-[0.05em]">
                  15% OFF ALL MENU ITEMS
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="text-white/60 text-xs tracking-[0.05em]">
                  EXCLUSIVE MEMBER-ONLY EVENTS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          {/* View Plans Button */}
          <button
            onClick={() => onNavigate('subscription')}
            className="w-full py-4 rounded-full bg-white text-black hover:bg-white/90 transition-all"
          >
            <span className="text-xs tracking-[0.1em] font-medium">
              VIEW SUBSCRIPTION PLANS
            </span>
          </button>

          {/* Cancel Subscription Button */}
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="text-white/40 hover:text-white/60 transition-colors text-xs tracking-[0.05em] w-full py-2"
          >
            CANCEL SUBSCRIPTION
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/90">
          <div className="w-full max-w-sm border border-white/20 rounded-[2rem] p-8 bg-black">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white text-sm tracking-[0.05em]">
                  CANCEL SUBSCRIPTION?
                </h3>
                <p className="text-white/40 text-xs tracking-[0.05em] leading-relaxed uppercase">
                  YOU'LL LOSE ACCESS TO ALL PREMIUM BENEFITS AT THE END OF YOUR BILLING PERIOD
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="w-full py-4 rounded-full bg-white text-black hover:bg-white/90 transition-all"
                >
                  <span className="text-xs tracking-[0.1em] font-medium">
                    KEEP SUBSCRIPTION
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    // Handle cancellation logic here
                  }}
                  className="w-full py-4 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all"
                >
                  <span className="text-xs tracking-[0.1em]">
                    YES, CANCEL
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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