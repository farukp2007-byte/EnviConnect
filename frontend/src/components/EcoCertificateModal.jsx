import React, { useRef, useState } from "react";
import { X, Award, CheckCircle2, QrCode, Printer, Copy, Check, ShieldCheck, Download, ExternalLink } from "lucide-react";

export default function EcoCertificateModal({ isOpen, onClose, certData }) {
  const [copied, setCopied] = useState(false);
  const certRef = useRef(null);

  if (!isOpen || !certData) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&bgcolor=08231E&color=06D6A0&margin=8&data=${encodeURIComponent(
    certData.qr_payload || certData.verification_url || "https://envi.tirupati.gov.in"
  )}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certData.verification_url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-auto bg-[#0C4137] border-2 border-[#06D6A0]/40 rounded-3xl shadow-2xl p-4 sm:p-8 space-y-6 text-[#E6FBF6]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A2C5BD] hover:text-white p-2 rounded-xl bg-[#08231E] border border-[#06D6A0]/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Printable Canvas */}
        <div
          ref={certRef}
          className="relative bg-gradient-to-b from-[#082822] via-[#093028] to-[#071F1A] border-4 border-double border-[#D4AF37]/70 rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden print:border-black print:text-black print:bg-white text-center space-y-5"
        >
          {/* Subtle Watermark Emblem in Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <Award className="w-96 h-96 text-[#06D6A0]" />
          </div>

          {/* Top Government Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0C4137] border border-[#06D6A0] flex items-center justify-center text-[#06D6A0] font-bold text-xl shadow">
                🏛️
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">
                  Government of Andhra Pradesh
                </div>
                <div className="font-serif-brand font-bold text-sm sm:text-base text-[#E6FBF6]">
                  Municipal Corporation of Tirupati & APPCB
                </div>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-[10px] text-[#A2C5BD] uppercase font-mono">Certificate Serial No.</div>
              <div className="text-xs sm:text-sm font-mono font-bold text-[#06D6A0]">
                {certData.certificate_id}
              </div>
            </div>
          </div>

          {/* Title Area */}
          <div className="space-y-1 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Official Civic Environmental Credential</span>
            </div>
            <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#E6FBF6] tracking-tight">
              Certificate of Green Stewardship
            </h2>
            <p className="text-xs italic text-[#A2C5BD]">
              Under Andhra Pradesh Civic Environmental Protection & Citizen Empowerment Mission
            </p>
          </div>

          {/* Awardee Body */}
          <div className="space-y-3 py-2">
            <p className="text-xs text-[#A2C5BD] uppercase tracking-wider">This is proudly conferred upon</p>
            <div className="font-serif-brand text-3xl sm:text-4xl font-extrabold text-[#06D6A0] tracking-wide border-b-2 border-dashed border-[#06D6A0]/40 pb-2 inline-block px-6">
              {certData.citizen_name}
            </div>
            <p className="text-xs sm:text-sm text-[#E6FBF6]/90 max-w-xl mx-auto leading-relaxed pt-1">
              in recognition of active vigilance, verified ground evidence reporting, and community participation in protecting the delicate ecosystem of the <span className="text-[#06D6A0] font-semibold">Tirupati Metropolitan Region & Seshachalam Biosphere Reserve</span>.
            </p>
          </div>

          {/* Score & Tier Badge Container */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#08231E]/80 border border-[#06D6A0]/30 max-w-xl mx-auto">
            <div>
              <div className="text-[10px] text-[#A2C5BD] uppercase font-semibold">Green Civic Score</div>
              <div className="text-xl font-bold font-mono text-[#06D6A0]">
                {certData.green_score} <span className="text-xs font-normal text-[#A2C5BD]">/ 900</span>
              </div>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-[#06D6A0]/20 py-1 sm:py-0">
              <div className="text-[10px] text-[#A2C5BD] uppercase font-semibold">Honorific Rank</div>
              <div className="text-sm font-bold text-[#D4AF37]">
                ⭐ {certData.tier}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#A2C5BD] uppercase font-semibold">Validity</div>
              <div className="text-xs font-semibold text-[#E6FBF6]">
                {certData.issue_date} – {certData.valid_until}
              </div>
            </div>
          </div>

          {/* Signatures & Verification Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-6 pt-4 border-t border-[#D4AF37]/30 text-left">
            {/* Municipal Commissioner Signature */}
            <div className="space-y-1">
              <div className="font-serif-brand italic font-bold text-sm text-[#D4AF37]">
                N. Murali Mohan
              </div>
              <div className="text-[11px] font-bold text-[#E6FBF6]">Sri N. Murali Mohan, IAS</div>
              <div className="text-[9px] text-[#A2C5BD]">Commissioner, MCT</div>
            </div>

            {/* Center Digital Cryptographic Seal & QR */}
            <div className="text-center space-y-1.5 flex flex-col items-center">
              <img
                src={qrUrl}
                alt="Verification QR"
                className="w-20 h-20 rounded-xl border border-[#06D6A0]/30 shadow"
              />
              <div className="text-[9px] font-mono text-[#659389]">
                {certData.digital_signature_hash}
              </div>
            </div>

            {/* APPCB Regional Secretary Signature */}
            <div className="sm:text-right space-y-1">
              <div className="font-serif-brand italic font-bold text-sm text-[#D4AF37]">
                Dr. P. S. Reddy
              </div>
              <div className="text-[11px] font-bold text-[#E6FBF6]">Dr. P. S. Reddy, Ph.D.</div>
              <div className="text-[9px] text-[#A2C5BD]">Member Secretary, APPCB Tirupati</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#A2C5BD]">
            <ShieldCheck className="w-4 h-4 text-[#06D6A0]" />
            <span>Government Verifiable Digital Credential (QR & Hash Protected)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-[#08231E] border border-[#06D6A0]/30 hover:border-[#06D6A0] text-xs font-semibold text-[#E6FBF6] flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#06D6A0]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Link Copied!" : "Copy Verification URL"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#06D6A0] hover:bg-[#05B789] text-[#04120F] text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#06D6A0]/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Certificate PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
