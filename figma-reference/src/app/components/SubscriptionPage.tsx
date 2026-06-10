import { ArrowLeft, Coffee, Calendar, Crown, Home } from 'lucide-react';

interface SubscriptionPageProps {
  onBack: () => void;
  onSignUp?: () => void;
  onLogin?: () => void;
}

export function SubscriptionPage({ onBack, onSignUp, onLogin }: SubscriptionPageProps) {
  return (
    <div className="w-full h-full bg-black relative overflow-y-auto">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="flex items-center justify-between p-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
          <h2 className="text-white text-sm tracking-[0.1em]">PREMIUM SUBSCRIPTION</h2>
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="px-6 py-8 pb-24 space-y-6">
        
        {/* Value Proposition Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-white text-2xl tracking-[0.05em]">
            YOUR DAILY COFFEE
          </h1>
          <h2 className="text-white text-2xl tracking-[0.05em]">
            PERFECTED
          </h2>
          <p className="text-white/40 text-xs tracking-[0.15em] pt-4 px-4">
            JOIN OUR EXCLUSIVE MEMBERSHIP AND ELEVATE YOUR COFFEE EXPERIENCE
          </p>
        </div>

        {/* Price Display */}
        <div className="border border-white/20 rounded-[2rem] p-8">
          <div className="text-center">
            <p className="text-white text-4xl tracking-wider mb-2">
              £19.99
            </p>
            <p className="text-white/60 text-xs tracking-[0.1em]">
              PER MONTH
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-6">
          <h3 className="text-white text-xs tracking-[0.15em] text-center">
            MEMBERSHIP BENEFITS
          </h3>

          {/* Benefit Item 1 */}
          <div className="border border-white/20 rounded-[2rem] p-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-white text-xs tracking-[0.05em]">1 FREE PREMIUM COFFEE DAILY</p>
            </div>
          </div>

          {/* Benefit Item 2 */}
          <div className="border border-white/20 rounded-[2rem] p-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-white text-xs tracking-[0.05em]">7 DAYS A WEEK, EVERY DAY</p>
            </div>
          </div>

          {/* Benefit Item 3 */}
          <div className="border border-white/20 rounded-[2rem] p-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <p className="text-white text-xs tracking-[0.05em]">EXCLUSIVE MEMBER PERKS</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons Section */}
        <div className="space-y-4 pt-8">
          {/* Primary Sign Up Button */}
          <button
            onClick={onSignUp}
            className="w-full py-5 rounded-full bg-white text-black hover:bg-white/90 transition-all"
          >
            <span className="text-xs tracking-[0.1em] font-medium">
              SIGN UP AND SUBSCRIBE
            </span>
          </button>

          {/* Secondary Login Button */}
          <button
            onClick={onLogin}
            className="w-full py-4 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all"
          >
            <span className="text-xs tracking-[0.1em]">
              ALREADY A MEMBER - LOG IN
            </span>
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="space-y-4 pt-8">
          <p className="text-center text-white/40 text-xs tracking-[0.05em]">
            CANCEL ANYTIME • SECURE PAYMENT
          </p>

          {/* Privacy & Terms */}
          <p className="text-center text-white/30 text-[10px] tracking-[0.05em]">
            BY SUBSCRIBING, YOU AGREE TO OUR{' '}
            <button className="text-white/50 hover:text-white/70 transition-colors underline">
              TERMS
            </button>
            {' '}AND{' '}
            <button className="text-white/50 hover:text-white/70 transition-colors underline">
              PRIVACY POLICY
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
