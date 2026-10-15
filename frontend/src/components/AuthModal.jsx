import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Sparkles, User, Shield, Building2, Eye, Award } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, quickSwitchRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          phone,
          role: "citizen",
        });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (roleKey) => {
    try {
      await quickSwitchRole(roleKey);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0C4137] border border-[#06D6A0]/40 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A2C5BD] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-[#082C25] border border-[#06D6A0] flex items-center justify-center mx-auto text-[#06D6A0] mb-2 shadow-md">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
              <circle cx="12" cy="12" r="3" fill="#06D6A0" />
            </svg>
          </div>
          <h3 className="font-serif-brand font-bold text-2xl text-[#E6FBF6]">
            {isRegister ? "Citizen Registration" : "Welcome to Envi Connect"}
          </h3>
          <p className="text-xs text-[#A2C5BD]">
            {isRegister ? "Join citizen environmental surveillance" : "Sign in to track complaints and respond"}
          </p>
        </div>

        {/* 1-Click Demo Logins */}
        {!isRegister && (
          <div className="p-3.5 rounded-2xl bg-[#08231E] border border-[#06D6A0]/20 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#06D6A0]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Demo Login:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("citizen")}
                className="p-2 rounded-xl bg-[#0C4137] hover:bg-[#125246] border border-[#06D6A0]/30 text-left text-[11px] text-[#E6FBF6] flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#06D6A0]" />
                <span className="truncate">Citizen (Rajesh)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("mct")}
                className="p-2 rounded-xl bg-[#0C4137] hover:bg-[#125246] border border-[#06D6A0]/30 text-left text-[11px] text-[#E6FBF6] flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-[#06D6A0]" />
                <span className="truncate">MCT Officer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("appcb")}
                className="p-2 rounded-xl bg-[#0C4137] hover:bg-[#125246] border border-[#06D6A0]/30 text-left text-[11px] text-[#E6FBF6] flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#06D6A0]" />
                <span className="truncate">APPCB Officer</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("ngo")}
                className="p-2 rounded-xl bg-[#0C4137] hover:bg-[#125246] border border-[#06D6A0]/30 text-left text-[11px] text-[#E6FBF6] flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#06D6A0]" />
                <span className="truncate">NGO Analyst</span>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="block text-[#A2C5BD] font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Suresh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6] focus:outline-none focus:border-[#06D6A0]"
              />
            </div>
          )}

          <div>
            <label className="block text-[#A2C5BD] font-medium mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6] focus:outline-none focus:border-[#06D6A0]"
            />
          </div>

          <div>
            <label className="block text-[#A2C5BD] font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6] focus:outline-none focus:border-[#06D6A0]"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-[#A2C5BD] font-medium mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98480 00000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6] focus:outline-none focus:border-[#06D6A0]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full envi-btn-primary py-3 font-bold text-xs shadow-md shadow-[#06D6A0]/30"
          >
            {submitting ? "Processing..." : isRegister ? "Create Citizen Account" : "Sign In to Account"}
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="text-center text-xs text-[#A2C5BD]">
          {isRegister ? (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="text-[#06D6A0] font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="text-[#06D6A0] font-bold hover:underline"
              >
                Register Citizen
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
