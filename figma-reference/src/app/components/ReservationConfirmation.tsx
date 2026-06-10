import { CheckCircle, Calendar, Clock, Users, Mail, Phone, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface ReservationConfirmationProps {
  onBackToHome: () => void;
  reservationDetails: {
    date: string;
    time: string;
    guests: number;
    name: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
}

export function ReservationConfirmation({ onBackToHome, reservationDetails }: ReservationConfirmationProps) {
  const confirmationNumber = Math.random().toString(36).substring(2, 10).toUpperCase();

  return (
    <div className="w-full h-full bg-[#252525] relative overflow-y-auto">
      {/* Scrollable Content */}
      <div className="px-6 py-12 pb-32 space-y-6 flex flex-col items-center">
        
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
          className="relative"
        >
          <div 
            className="absolute inset-0 blur-3xl opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.6) 0%, transparent 70%)'
            }}
          />
          <CheckCircle 
            className="w-24 h-24 text-[#D4AF37] relative" 
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h1 className="text-white text-2xl">Reservation Confirmed!</h1>
          <p className="text-[#b8b8b8]">
            We've sent a confirmation email to<br />
            <span className="text-[#D4AF37]">{reservationDetails.email}</span>
          </p>
        </motion.div>

        {/* Confirmation Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-3xl p-6 w-full"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 16px 48px rgba(212, 175, 55, 0.2)'
          }}
        >
          <p className="text-[#b8b8b8] text-center text-sm mb-2">Confirmation Number</p>
          <p className="text-white text-center text-2xl tracking-wider">{confirmationNumber}</p>
        </motion.div>

        {/* Reservation Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-3xl p-6 w-full space-y-5"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
        >
          <h3 className="text-white text-center mb-4">Reservation Details</h3>

          {/* Date */}
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            >
              <Calendar className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[#b8b8b8] text-sm">Date</p>
              <p className="text-white">{reservationDetails.date}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            >
              <Clock className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[#b8b8b8] text-sm">Time</p>
              <p className="text-white">{reservationDetails.time}</p>
            </div>
          </div>

          {/* Party Size */}
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            >
              <Users className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[#b8b8b8] text-sm">Party Size</p>
              <p className="text-white">{reservationDetails.guests} {reservationDetails.guests === 1 ? 'Guest' : 'Guests'}</p>
            </div>
          </div>

          <div 
            className="w-full h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)'
            }}
          />

          {/* Guest Name */}
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}
            >
              <Users className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[#b8b8b8] text-sm">Name</p>
              <p className="text-white">{reservationDetails.name}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}
            >
              <Mail className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[#b8b8b8] text-sm">Email</p>
              <p className="text-white truncate">{reservationDetails.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}
            >
              <Phone className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[#b8b8b8] text-sm">Phone</p>
              <p className="text-white">{reservationDetails.phone}</p>
            </div>
          </div>

          {/* Special Requests (if any) */}
          {reservationDetails.specialRequests && (
            <>
              <div 
                className="w-full h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)'
                }}
              />
              <div>
                <p className="text-[#b8b8b8] text-sm mb-2">Special Requests</p>
                <p className="text-white text-sm">{reservationDetails.specialRequests}</p>
              </div>
            </>
          )}
        </motion.div>

        {/* Important Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-3xl p-5 w-full"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          <p className="text-[#b8b8b8] text-sm text-center leading-relaxed">
            Please arrive 10 minutes before your reservation time.
            If you need to cancel or modify your booking, please contact us at least 24 hours in advance.
          </p>
        </motion.div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="sticky bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#252525] via-[#252525]/95 to-transparent">
        <button
          onClick={onBackToHome}
          className="w-full py-5 rounded-2xl relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.3) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(212, 175, 55, 0.6)',
            boxShadow: '0 16px 48px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
            }}
          />
          <span className="relative text-white tracking-wide text-lg flex items-center justify-center gap-2">
            <Home className="w-5 h-5" strokeWidth={1.5} />
            Back to Home
          </span>
        </button>
      </div>
    </div>
  );
}
