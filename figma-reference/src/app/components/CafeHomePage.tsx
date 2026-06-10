import { Menu, MapPin, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavigationMenu } from './NavigationMenu';
import { SubscriptionPage } from './SubscriptionPage';
import { SubscriberDashboard } from './SubscriberDashboard';
import { ReservationsPage } from './ReservationsPage';
import { MenuPage } from './MenuPage';
import { AboutUsPage } from './AboutUsPage';
import { SocialMediaPage } from './SocialMediaPage';
import { GalleryPageWhite } from './GalleryPageWhite';
import { ContactUsPage } from './ContactUsPage';
import { ManageSubscriptionPage } from './ManageSubscriptionPage';
import { SignUpScreen } from './SignUpScreen';
import { LoginScreen } from './LoginScreen';
import logo from 'figma:asset/70bb49b4e4a6e158ddb9f6318c5fd98b10237bca.png';

type PageType = 'home' | 'subscription' | 'subscriber-dashboard' | 'reservations' | 'menu' | 'about-us' | 'social-media' | 'gallery' | 'contact-us' | 'manage-subscription' | 'signup' | 'login';

export function CafeHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  // Check auth status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isLoggedIn');
    const savedEmail = localStorage.getItem('userEmail');
    const savedName = localStorage.getItem('userName');

    if (authStatus === 'true' && savedEmail) {
      setIsLoggedIn(true);
      setUserEmail(savedEmail);
      setUserName(savedName || '');
    }
  }, []);

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const handleSignUpComplete = (email: string, name: string) => {
    // Save user data and log them in
    setIsLoggedIn(true);
    setUserEmail(email);
    setUserName(name);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);

    // Navigate to member dashboard
    setCurrentPage('subscriber-dashboard');
  };

  const handleLoginComplete = (email: string) => {
    // Retrieve saved name or use email
    const savedName = localStorage.getItem('userName') || '';

    setIsLoggedIn(true);
    setUserEmail(email);
    setUserName(savedName);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);

    // Navigate to member dashboard
    setCurrentPage('subscriber-dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setUserName('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setCurrentPage('home');
  };

  // Show signup screen
  if (currentPage === 'signup') {
    return <SignUpScreen onBack={() => setCurrentPage('subscription')} onSignUpComplete={handleSignUpComplete} />;
  }

  // Show login screen
  if (currentPage === 'login') {
    return <LoginScreen onBack={() => setCurrentPage('subscription')} onLoginComplete={handleLoginComplete} />;
  }

  // Show menu page
  if (currentPage === 'menu') {
    return <MenuPage onBack={() => setCurrentPage('home')} onNavigate={handleNavigation} />;
  }

  // Show reservations page
  if (currentPage === 'reservations') {
    return <ReservationsPage onBack={() => setCurrentPage('home')} onNavigate={handleNavigation} />;
  }

  // Show about us page
  if (currentPage === 'about-us') {
    return <AboutUsPage onBack={() => setCurrentPage('home')} onNavigate={handleNavigation} />;
  }

  // Show social media page
  if (currentPage === 'social-media') {
    return <SocialMediaPage onBack={() => setCurrentPage('home')} onNavigate={handleNavigation} />;
  }

  // Show gallery page
  if (currentPage === 'gallery') {
    return <GalleryPageWhite onBack={() => setCurrentPage('home')} onNavigate={handleNavigation} />;
  }

  // Show contact us page
  if (currentPage === 'contact-us') {
    return <ContactUsPage onBack={() => setCurrentPage('home')} onNavigate={handleNavigation} />;
  }

  // Show subscriber dashboard
  if (currentPage === 'subscriber-dashboard') {
    return <SubscriberDashboard onBack={() => setCurrentPage('home')} onNavigate={handleNavigation} />;
  }

  // Show subscription page
  if (currentPage === 'subscription') {
    return (
      <SubscriptionPage
        onBack={() => setCurrentPage('home')}
        onSignUp={() => setCurrentPage('signup')}
        onLogin={() => setCurrentPage('login')}
      />
    );
  }

  // Show manage subscription page
  if (currentPage === 'manage-subscription') {
    return <ManageSubscriptionPage onBack={() => setCurrentPage('home')} onNavigate={handleNavigation} />;
  }

  // Show home page
  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
      {/* Home Screen Content */}
      <div className={`w-full h-full transition-all duration-500 ${isMenuOpen ? 'blur-sm scale-95 opacity-30' : ''}`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6">
          <div className="w-10 h-10" />
          <button 
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>
        </div>

        {/* Main Content - Logo Section */}
        <div className="flex flex-col items-center justify-center min-h-full px-8 py-20">
          {/* Logo */}
          <div>
            <img src={logo} alt="Cafe Locco Logo" className="w-64 h-64 object-contain" />
          </div>
        </div>
      </div>

      {/* Navigation Menu Overlay */}
      <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={handleNavigation} isLoggedIn={isLoggedIn} />
    </div>
  );
}