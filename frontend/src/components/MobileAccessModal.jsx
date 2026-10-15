import React, { useState } from "react";
import { X, Smartphone, Copy, Check, QrCode, Wifi, Camera, Sparkles, ExternalLink } from "lucide-react";

export default function MobileAccessModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Auto-resolve current host or local network Wi-Fi IP
  const host = window.location.hostname;
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const mobileUrl = isLocalhost ? "http://10.98.189.107:5173" : `${window.location.protocol}//${host}:${window.location.port || "5173"}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=08231E&color=06D6A0&margin=10&data=${encodeURIComponent(mobileUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0C4137] border border-[#06D6A0]/40 rounded-3xl w-full max-w-md p-6 sm:p-7 space-y-5 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A2C5BD] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#082C25] border border-[#06D6A0] flex items-center justify-center mx-auto text-[#06D6A0] shadow-md shadow-[#06D6A0]/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="font-serif-brand font-bold text-2xl text-[#E6FBF6] pt-1">
            Access on Mobile Phone
          </h3>
          <p className="text-xs text-[#A2C5BD]">
            Scan with your phone's camera app to open ENVI CONNECT on mobile
          </p>
        </div>

        {/* QR Code */}
        <div className="p-4 rounded-3xl bg-[#08231E] border border-[#06D6A0]/30 inline-block mx-auto shadow-inner">
          <img
            src={qrCodeUrl}
            alt="Scan to open on mobile"
            className="w-48 h-48 mx-auto rounded-2xl border border-[#06D6A0]/20"
          />
        </div>

        {/* Mobile Network Link with Copy Button */}
        <div className="space-y-2">
          <div className="text-[11px] text-[#659389] flex items-center justify-center gap-1.5 font-medium">
            <Wifi className="w-3.5 h-3.5 text-[#06D6A0]" />
            <span>Connect to your phone on the same Wi-Fi network:</span>
          </div>
          <div className="flex items-center gap-2 bg-[#08231E] p-2 rounded-2xl border border-[#06D6A0]/20">
            <input
              type="text"
              readOnly
              value={mobileUrl}
              className="bg-transparent flex-1 text-xs text-[#06D6A0] font-mono px-2 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-[#06D6A0] text-[#04120F] text-xs font-bold hover:bg-[#05B789] transition-all flex items-center gap-1 flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Mobile-Optimized Features */}
        <div className="p-3.5 rounded-2xl bg-[#082C25] border border-[#06D6A0]/20 text-left space-y-2 text-xs">
          <div className="text-[11px] font-bold text-[#06D6A0] uppercase tracking-wide">
            📱 Mobile-Optimized Features:
          </div>
          <div className="space-y-1.5 text-[11px] text-[#A2C5BD]">
            <div className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-[#06D6A0]" />
              <span>Direct camera capture with automatic EXIF GPS tagging</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#06D6A0]" />
              <span>Thumb-accessible bottom navigation bar</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#06D6A0]" />
              <span>PWA support: Tap "Add to Home Screen" to install as app</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-[#08231E] hover:bg-[#0C4137] text-xs font-semibold text-[#E6FBF6] border border-[#06D6A0]/20"
        >
          Close
        </button>
      </div>
    </div>
  );
}
