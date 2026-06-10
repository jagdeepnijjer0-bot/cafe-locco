import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface LoginScreenProps {
  onBack: () => void;
  onLoginComplete: (email: string) => void;
}

export function LoginScreen({ onBack, onLoginComplete }: LoginScreenProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and proceed
    setErrors({});
    onLoginComplete(formData.email);
  };

  return (
    <div className="w-full h-full bg-black relative overflow-y-auto">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="flex items-center justify-between p-6">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white/40 transition-colors rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
          <h2 className="text-white text-sm tracking-[0.1em]">MEMBER LOGIN</h2>
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 pb-24">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="text-center space-y-3 py-8">
            <h1 className="text-white text-lg tracking-[0.05em]">
              WELCOME BACK
            </h1>
            <p className="text-white/40 text-xs tracking-[0.15em]">
              LOG IN TO ACCESS YOUR MEMBERSHIP
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-white/60 text-xs tracking-[0.1em] block px-1">
                EMAIL
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent border border-white/20 rounded-2xl px-6 py-4 text-white text-sm tracking-[0.05em] focus:border-white/40 focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-400/80 text-xs tracking-[0.05em] px-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-white/60 text-xs tracking-[0.1em] block px-1">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-transparent border border-white/20 rounded-2xl px-6 py-4 text-white text-sm tracking-[0.05em] focus:border-white/40 focus:outline-none transition-colors pr-14"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400/80 text-xs tracking-[0.05em] px-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-white/40 hover:text-white/60 transition-colors text-xs tracking-[0.05em]"
              >
                FORGOT PASSWORD?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-5 rounded-full bg-white text-black hover:bg-white/90 transition-all"
              >
                <span className="text-xs tracking-[0.1em] font-medium">
                  LOG IN
                </span>
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-6">
            <p className="text-white/40 text-xs tracking-[0.1em]">
              NOT A MEMBER YET?
            </p>
            <button
              onClick={onBack}
              className="text-white/60 hover:text-white transition-colors text-xs tracking-[0.05em] mt-2 underline"
            >
              CREATE AN ACCOUNT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
