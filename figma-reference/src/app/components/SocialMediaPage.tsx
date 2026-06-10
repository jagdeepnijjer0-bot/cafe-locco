import { ArrowLeft, Instagram, Facebook, Music2, ExternalLink, Home, Menu } from 'lucide-react';
import { useState } from 'react';
import { NavigationMenu } from './NavigationMenu';

interface SocialMediaPageProps {
  onBack: () => void;
  onNavigate: (page: 'home' | 'subscription' | 'subscriber-dashboard' | 'reservations' | 'menu' | 'about-us' | 'social-media' | 'gallery' | 'contact-us' | 'manage-subscription') => void;
}

const socialLinks = [
  {
    name: 'INSTAGRAM',
    url: 'https://www.instagram.com/cafelocco/',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBsYXR0ZSUyMGFydHxlbnwxfHx8fDE3NjgyMDc2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'FACEBOOK',
    url: 'https://www.facebook.com/p/LOCCO-100093893236137/?locale=en_GB',
    image: 'https://images.unsplash.com/photo-1582034986517-30d163aa1da9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZCUyMGZvb2R8ZW58MXx8fHwxNzY4MjU0MjczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    name: 'TIKTOK',
    url: 'https://www.tiktok.com/@cafelocco',
    image: 'https://images.unsplash.com/photo-1560073744-7643b964bdf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMHBlb3BsZSUyMHJ1bm5pbmd8ZW58MXx8fHwxNzY4MjU0MjczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  }
];

export function SocialMediaPage({ onBack, onNavigate }: SocialMediaPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
          <h2 className="text-white text-sm tracking-[0.1em]">SOCIAL MEDIA</h2>
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
        {/* Social Media Cards */}
        <div className="space-y-6">
          {socialLinks.map((social) => (
            <div key={social.name} className="space-y-4">
              {/* Image */}
              <div className="relative w-full h-48 rounded-[2rem] overflow-hidden">
                <img 
                  src={social.image}
                  alt={social.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Button */}
              <button
                onClick={() => handleSocialClick(social.url)}
                className="w-full py-4 border-2 border-white rounded-full text-white hover:bg-white hover:text-black transition-all"
              >
                <span className="text-sm tracking-[0.1em] font-medium">
                  {social.name}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Join Our Community Button */}
        <div className="pt-8">
          <button 
            onClick={() => window.open('https://www.instagram.com/locco.365/?hl=en', '_blank', 'noopener,noreferrer')}
            className="w-full py-4 border-2 border-white rounded-full text-white hover:bg-white hover:text-black transition-all"
          >
            <span className="text-sm tracking-[0.1em] font-medium">
              JOIN OUR COMMUNITY
            </span>
          </button>
        </div>
      </div>

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