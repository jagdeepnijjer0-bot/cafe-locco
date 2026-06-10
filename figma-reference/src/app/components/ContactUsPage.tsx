import { Send, CheckCircle, Mail, Home, Menu } from 'lucide-react';
import { useState } from 'react';
import { NavigationMenu } from './NavigationMenu';

interface ContactUsPageProps {
  onBack: () => void;
  onNavigate: (page: 'home' | 'subscription' | 'subscriber-dashboard' | 'reservations' | 'menu' | 'about-us' | 'social-media' | 'gallery' | 'contact-us') => void;
}

export function ContactUsPage({ onBack, onNavigate }: ContactUsPageProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'FIRST NAME IS REQUIRED';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'LAST NAME IS REQUIRED';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'CONTACT NUMBER IS REQUIRED';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'EMAIL IS REQUIRED';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'PLEASE ENTER A VALID EMAIL';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'MESSAGE IS REQUIRED';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Temporary simulation - replace with actual email service
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message
      setIsSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        contactNumber: '',
        email: '',
        message: '',
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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
          <h2 className="text-white text-sm tracking-[0.1em]">CONTACT US</h2>
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
        {/* Success Message */}
        {isSuccess && (
          <div className="border-2 border-white rounded-[2rem] p-5 flex items-center justify-center gap-3">
            <CheckCircle className="w-6 h-6 text-white" />
            <span className="text-white text-xs tracking-[0.1em]">MESSAGE SENT SUCCESSFULLY</span>
          </div>
        )}

        {/* Contact Form Card */}
        <div className="border-2 border-white rounded-[2rem] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="FIRST NAME"
                className="w-full px-5 py-4 rounded-full bg-black text-white placeholder-white/40 border-2 border-white/30 focus:border-white outline-none transition-colors text-xs tracking-[0.05em]"
              />
              {errors.firstName && (
                <p className="text-white/60 text-[10px] mt-2 ml-4 tracking-[0.05em]">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="LAST NAME"
                className="w-full px-5 py-4 rounded-full bg-black text-white placeholder-white/40 border-2 border-white/30 focus:border-white outline-none transition-colors text-xs tracking-[0.05em]"
              />
              {errors.lastName && (
                <p className="text-white/60 text-[10px] mt-2 ml-4 tracking-[0.05em]">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="CONTACT NUMBER"
                className="w-full px-5 py-4 rounded-full bg-black text-white placeholder-white/40 border-2 border-white/30 focus:border-white outline-none transition-colors text-xs tracking-[0.05em]"
              />
              {errors.contactNumber && (
                <p className="text-white/60 text-[10px] mt-2 ml-4 tracking-[0.05em]">
                  {errors.contactNumber}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="EMAIL ADDRESS"
                className="w-full px-5 py-4 rounded-full bg-black text-white placeholder-white/40 border-2 border-white/30 focus:border-white outline-none transition-colors text-xs tracking-[0.05em]"
              />
              {errors.email && (
                <p className="text-white/60 text-[10px] mt-2 ml-4 tracking-[0.05em]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="MESSAGE"
                rows={6}
                className="w-full px-5 py-4 rounded-3xl bg-black text-white placeholder-white/40 border-2 border-white/30 focus:border-white outline-none transition-colors resize-none text-xs tracking-[0.05em]"
              />
              {errors.message && (
                <p className="text-white/60 text-[10px] mt-2 ml-4 tracking-[0.05em]">
                  {errors.message}
                </p>
              )}
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xs tracking-[0.1em] font-medium">
                {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </span>
            </button>
          </form>
        </div>

        {/* Contact Email Display Card */}
        <div className="border-2 border-white rounded-[2rem] p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white/40 text-[10px] mb-2 tracking-[0.1em]">EMAIL US AT</p>
              <p className="text-white text-xs tracking-[0.05em]">INFO@CAFELOCCO.CO.UK</p>
            </div>
          </div>
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