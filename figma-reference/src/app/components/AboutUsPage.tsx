import { ArrowLeft, Coffee, Heart, Users, Sparkles, Home, Menu } from 'lucide-react';
import { useState } from 'react';
import { NavigationMenu } from './NavigationMenu';
import storyImage from 'figma:asset/ecd2c95a32e74c8e3a89f5568a017cdef27d6d4c.png';

interface AboutUsPageProps {
  onBack: () => void;
  onNavigate: (page: 'home' | 'subscription' | 'subscriber-dashboard' | 'reservations' | 'menu' | 'about-us' | 'social-media' | 'gallery' | 'contact-us') => void;
}

export function AboutUsPage({ onBack, onNavigate }: AboutUsPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <h2 className="text-white text-sm tracking-[0.1em]">OUR STORY</h2>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white transition-colors"
          >
            <Menu className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-6 pb-12">
        
        {/* Story Image */}
        <div className="py-8">
          <div className="relative w-full h-64 rounded-3xl overflow-hidden">
            <img 
              src={storyImage}
              alt="Café Locco Story"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Main Story Section */}
        <div className="border-2 border-white rounded-[2rem] p-8 -mt-3">
          <p className="text-white text-sm leading-relaxed tracking-[0.03em] text-center">
            AT CAFÉ LOCCO, OUR GREATEST PASSION LIES IN DELIVERING A REFINED DINING EXPERIENCE THAT STILL FEELS LIKE HOME. IT ALL STARTED WITH A SHARED LOVE OF GREAT FOOD AND A DREAM TO CREATE A SPACE WHERE PEOPLE COULD COME TOGETHER TO ENJOY IT.
          </p>
        </div>

        {/* Second Paragraph */}
        <div className="border-2 border-white rounded-[2rem] p-8">
          <p className="text-white text-sm leading-relaxed tracking-[0.03em] text-center">
            FROM OUR THOUGHTFULLY CURATED MENU TO OUR WARM, WELCOMING ATMOSPHERE, EVERY ASPECT OF CAFÉ LOCCO HAS BEEN SHAPED WITH CARE TO ENSURE THAT EACH VISIT IS UNFORGETTABLE.
          </p>
        </div>

        {/* Mission Card */}
        <div className="border-2 border-white rounded-[2rem] p-8 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-white text-xs tracking-[0.15em] text-center mb-4">OUR MISSION</h3>
          <p className="text-white text-sm leading-relaxed tracking-[0.03em] text-center">
            TO DELIGHT GUESTS WITH EXCEPTIONAL FOOD AND HEARTFELT HOSPITALITY, CREATING A SENSE OF COMMUNITY THAT BRINGS PEOPLE CLOSER TOGETHER.
          </p>
        </div>

        {/* Vision Card */}
        <div className="border-2 border-white rounded-[2rem] p-8 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-white text-xs tracking-[0.15em] text-center mb-4">OUR VISION</h3>
          <p className="text-white text-sm leading-relaxed tracking-[0.03em] text-center">
            WE ENVISION CAFÉ LOCCO LEADING THE WAY IN CULINARY INNOVATION, CONTINUALLY EVOLVING TO OFFER OUTSTANDING FLAVOURS WHILE SERVING AS A PLACE WHERE GENUINE CONNECTIONS AND MEMORIES ARE MADE.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: Coffee, label: 'PREMIUM QUALITY' },
            { icon: Users, label: 'COMMUNITY' },
            { icon: Heart, label: 'HOSPITALITY' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="border-2 border-white rounded-[2rem] p-4 flex flex-col items-center justify-center gap-3 text-center"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-white text-[10px] tracking-[0.05em]">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
}