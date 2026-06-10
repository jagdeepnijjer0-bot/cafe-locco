import { Home, CalendarDays, Clock, Users, ArrowLeft, Menu, ChevronLeft, ChevronRight, ChevronDown, Minus, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ReservationConfirmation } from './ReservationConfirmation';
import { NavigationMenu } from './NavigationMenu';

interface ReservationsPageProps {
  onBack: () => void;
  onNavigate: (page: 'home' | 'subscription' | 'subscriber-dashboard' | 'reservations' | 'menu' | 'about-us' | 'social-media' | 'gallery' | 'contact-us' | 'manage-subscription') => void;
}

export function ReservationsPage({ onBack, onNavigate }: ReservationsPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [guestCount, setGuestCount] = useState(2);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    if (isTimeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimeDropdownOpen]);

  // Generate calendar days for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthName = currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase();

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'
  ];

  const isPastDate = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatSummaryDate = () => {
    if (!selectedDate) return '—';
    return selectedDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
  };

  const canConfirm = selectedDate && selectedTime && fullName && email && phone;

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsTimeDropdownOpen(false);
  };

  const handleConfirm = () => {
    if (canConfirm) {
      setIsConfirmed(true);
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
          <h2 className="text-white text-sm tracking-[0.1em]">RESERVATIONS</h2>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white transition-colors"
          >
            <Menu className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="px-6 py-8 pb-32 space-y-6">
        
        {/* SECTION 1 - Date Selection */}
        <div className="border-2 border-white rounded-[2rem] p-6">
          <h3 className="text-white text-xs tracking-[0.1em] mb-6 text-center">
            SELECT DATE
          </h3>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-full border border-white/30 hover:border-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
            </button>
            <span className="text-white text-xs tracking-[0.1em]">{monthName}</span>
            <button
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-full border border-white/30 hover:border-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={1.5} />
            </button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-white text-xs py-2 tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }

              const isSelected = isSameDay(day, selectedDate);
              const isPast = isPastDate(day);
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={index}
                  onClick={() => !isPast && setSelectedDate(day)}
                  disabled={isPast}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${
                    isPast ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:bg-white/10'
                  } ${isSelected ? 'bg-white text-black border-2 border-white' : 'border border-white/20 text-white'}`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2 - Time Selection */}
        <div className="border-2 border-white rounded-[2rem] p-6 relative z-30" ref={dropdownRef}>
          <h3 className="text-white text-xs tracking-[0.1em] mb-6 text-center">
            SELECT TIME
          </h3>

          {/* Time Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className="w-full py-4 px-5 rounded-full text-white border-2 border-white hover:bg-white hover:text-black transition-all flex items-center justify-between"
            >
              <span className="text-xs tracking-[0.05em]">{selectedTime ? selectedTime.toUpperCase() : 'SELECT A TIME'}</span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            
            {/* Dropdown List */}
            {isTimeDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden bg-black border-2 border-white z-50 max-h-64 overflow-y-auto">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`w-full py-3 px-5 text-left text-white text-xs tracking-[0.05em] transition-colors ${
                      selectedTime === time ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    {time.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3 - Party Size */}
        <div className="border-2 border-white rounded-[2rem] p-6">
          <h3 className="text-white text-xs tracking-[0.1em] mb-6 text-center">
            NUMBER OF GUESTS
          </h3>

          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              disabled={guestCount <= 1}
              className="w-12 h-12 rounded-full border-2 border-white hover:bg-white hover:text-black flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="text-center min-w-[80px]">
              <div className="text-white text-3xl mb-1">{guestCount}</div>
              <div className="text-white/40 text-xs tracking-[0.05em]">
                {guestCount === 1 ? 'GUEST' : 'GUESTS'}
              </div>
            </div>

            <button
              onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
              disabled={guestCount >= 10}
              className="w-12 h-12 rounded-full border-2 border-white hover:bg-white hover:text-black flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* SECTION 4 - Guest Details */}
        <div className="border-2 border-white rounded-[2rem] p-6 space-y-4">
          <h3 className="text-white text-xs tracking-[0.1em] mb-6 text-center">YOUR DETAILS</h3>

          {/* Full Name Input */}
          <input
            type="text"
            placeholder="FULL NAME"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full py-4 px-5 rounded-full bg-black text-white placeholder-white/40 border-2 border-white/30 focus:border-white outline-none transition-colors text-xs tracking-[0.05em]"
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-4 px-5 rounded-full bg-black text-white placeholder-white/40 border-2 border-white/30 focus:border-white outline-none transition-colors text-xs tracking-[0.05em]"
          />

          {/* Phone Input */}
          <input
            type="tel"
            placeholder="PHONE NUMBER"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full py-4 px-5 rounded-full bg-black text-white placeholder-white/40 border-2 border-white/30 focus:border-white outline-none transition-colors text-xs tracking-[0.05em]"
          />
        </div>

        {/* SECTION 5 - Special Requests */}
        <div className="border-2 border-white rounded-[2rem] p-6">
          <h3 className="text-white text-xs tracking-[0.1em] mb-6 text-center">
            SPECIAL REQUESTS <span className="text-white/40">(OPTIONAL)</span>
          </h3>

          <textarea
            placeholder="ANY DIETARY REQUIREMENTS OR SPECIAL OCCASIONS"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={4}
            className="w-full py-4 px-5 rounded-3xl bg-black text-white placeholder-white/40 border-2 border-white/30 focus:border-white outline-none resize-none transition-colors text-xs tracking-[0.05em]"
          />
        </div>

        {/* Confirmation Summary */}
        {(selectedDate || selectedTime || guestCount) && (
          <div className="text-center py-4">
            <p className="text-white text-xs tracking-[0.15em]">
              {formatSummaryDate()} {selectedTime && `• ${selectedTime.toUpperCase()}`} {guestCount && `• ${guestCount} ${guestCount === 1 ? 'GUEST' : 'GUESTS'}`}
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA Button */}
      <div className="sticky bottom-0 left-0 right-0 p-6 bg-black border-t border-white/10 z-10">
        <button
          disabled={!canConfirm}
          className={`w-full py-5 rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all ${
            !canConfirm ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          onClick={handleConfirm}
        >
          <span className="text-xs tracking-[0.1em]">
            CONFIRM RESERVATION
          </span>
        </button>
      </div>

      {/* Reservation Confirmation Modal */}
      {isConfirmed && (
        <div className="absolute inset-0 z-50 bg-black">
          <ReservationConfirmation
            onBackToHome={onBack}
            reservationDetails={{
              date: formatSummaryDate(),
              time: selectedTime,
              guests: guestCount,
              name: fullName,
              email: email,
              phone: phone,
              specialRequests: specialRequests
            }}
          />
        </div>
      )}

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