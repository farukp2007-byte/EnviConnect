import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Star,
  Users,
  MapPin,
  ExternalLink
} from "lucide-react";

export default function MyReportsPage({ onSelectReport, setTab }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback action modal
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [wasFixed, setWasFixed] = useState(true);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadMyReports();
  }, [user]);

  const loadMyReports = async () => {
    setLoading(true);
    try {
      // If user is citizen, load reports associated with them or sample citizen reports
      const data = await api.getReports({
        reporter_id: user?.id,
      });
      // Fallback: if no direct reports tied to ID, load first 8 reports for demo preview
      if (data.length === 0) {
        const allData = await api.getReports();
        setReports(allData.slice(0, 8));
      } else {
        setReports(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFeedback = (report, fixedStatus) => {
    setFeedbackReport(report);
    setWasFixed(fixedStatus);
    setRating(fixedStatus ? 5 : 1);
    setComments(fixedStatus ? "Verified. The site is clean and problem resolved." : "Problem not fixed! The issue is still recurring.");
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackReport) return;

    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(feedbackReport.id, {
        was_fixed: wasFixed,
        rating: rating,
        comments: comments,
      });
      alert(
        wasFixed
          ? "Thank you! Your verification officially closed this case with citizen proof."
          : "Case has been reopened and escalated to CRITICAL priority! Authority heads notified."
      );
      setFeedbackReport(null);
      loadMyReports();
    } catch (err) {
      alert(`Feedback submission failed: ${err.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case "submitted":
        return 0;
      case "assigned":
        return 1;
      case "in_progress":
        return 2;
      case "resolved":
        return 3;
      case "closed":
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#06D6A0] uppercase tracking-wider">
              Citizen Accountability Dashboard
            </span>
          </div>
          <h1 className="font-serif-brand font-bold text-3xl sm:text-4xl text-[#E6FBF6]">
            My Tracked Environmental Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#A2C5BD] mt-1">
            Track multi-agency remediation, view resolution proofs, and verify whether violations were actually fixed.
          </p>
        </div>

        <button
          onClick={() => setTab("report")}
          className="envi-btn-primary py-2.5 px-5 text-xs font-bold self-start sm:self-auto"
        >
          <span>+ File New Incident</span>
        </button>
      </div>

      {/* Green Civic Score & Rewards Quick Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0C4137] via-[#082C25] to-[#08231E] border border-[#06D6A0]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#08231E] border border-[#06D6A0] flex items-center justify-center text-xl shadow">
            ⭐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-[#06D6A0]">Green Civic Score: 785 / 900</span>
              <span className="text-[10px] bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold">
                Prakrithi Mitra
              </span>
            </div>
            <div className="text-xs text-[#E6FBF6] font-medium mt-0.5">
              Civic Wallet: <strong className="text-[#06D6A0] font-mono">🪙 380 EcoCoins</strong> • 45 pts to next tier
            </div>
          </div>
        </div>

        <button
          onClick={() => setTab("rewards")}
          className="px-4 py-2 rounded-xl bg-[#06D6A0] hover:bg-[#05B789] text-[#04120F] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm self-start sm:self-auto"
        >
          <span>View Certificate & Perks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-20 text-[#A2C5BD]">Loading your reports...</div>
      ) : reports.length === 0 ? (
        <div className="envi-card p-12 text-center rounded-3xl space-y-4">
          <FileText className="w-12 h-12 text-[#06D6A0]/40 mx-auto" />
          <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
            No reports filed yet
          </h3>
          <p className="text-xs text-[#A2C5BD] max-w-sm mx-auto">
            Report environmental violations in your neighborhood with photo evidence to track live remediation.
          </p>
          <button
            onClick={() => setTab("report")}
            className="envi-btn-primary text-xs py-2.5 px-5 font-bold"
          >
            File First Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => {
            const stepIdx = getStatusStepIndex(rep.status);
            const isResolvedPendingFeedback = rep.status === "resolved";

            return (
              <div
                key={rep.id}
                className={`envi-card p-6 rounded-3xl space-y-5 transition-all ${
                  isResolvedPendingFeedback ? "border-[#06D6A0] shadow-lg shadow-[#06D6A0]/15" : ""
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-[#06D6A0] bg-[#082C25] px-2.5 py-1 rounded-xl border border-[#06D6A0]/30">
                      {rep.incident_number}
                    </span>
                    <span className="text-xs font-semibold capitalize text-[#E6FBF6]">
                      {rep.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-[#659389]">•</span>
                    <span className="text-xs text-[#A2C5BD]">
                      {new Date(rep.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {rep.reporters_count > 1 && (
                      <span className="text-[11px] font-bold text-[#06D6A0] bg-[#06D6A0]/15 border border-[#06D6A0]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{rep.reporters_count} Citizens Merged</span>
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                        rep.status === "closed"
                          ? "bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]"
                          : rep.status === "resolved"
                          ? "bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]"
                          : rep.status === "in_progress"
                          ? "bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]"
                          : "bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]"
                      }`}
                    >
                      {rep.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Photo thumbnail */}
                  <div className="h-28 rounded-2xl overflow-hidden bg-black relative border border-[#06D6A0]/20">
                    <img
                      src={api.assetUrl(rep.primary_image_url)}
                      alt={rep.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/seed_assets/default_dumping.jpg";
                      }}
                      className="w-full h-full object-cover"
                    />
                    {rep.after_image_url && (
                      <span className="absolute bottom-1 right-1 bg-[#06D6A0] text-[#04120F] text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Proof Attached
                      </span>
                    )}
                  </div>

                  {/* Title & Details */}
                  <div className="md:col-span-2 space-y-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-[#E6FBF6] line-clamp-1">
                      {rep.title}
                    </h3>
                    <p className="text-xs text-[#A2C5BD] line-clamp-2">
                      {rep.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-[#659389]">
                      <MapPin className="w-3.5 h-3.5 text-[#06D6A0] flex-shrink-0" />
                      <span className="truncate">{rep.address}</span>
                      <span>• Assigned: {rep.authority_name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center">
                    <button
                      onClick={() => onSelectReport(rep.id)}
                      className="envi-btn-secondary text-xs py-2 px-4 font-semibold w-full"
                    >
                      <span>View Full Case</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Stepper Progression */}
                <div className="pt-2 border-t border-[#06D6A0]/10">
                  <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-semibold">
                    {["Submitted", "Assigned", "In Progress", "Resolved", "Closed"].map((st, i) => (
                      <div key={st} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            i <= stepIdx ? "bg-[#06D6A0]" : "bg-[#08231E]"
                          }`}
                        ></div>
                        <span
                          className={
                            i <= stepIdx ? "text-[#06D6A0] font-bold" : "text-[#659389]"
                          }
                        >
                          {st}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FEATURE 6: Citizen Verification & Re-open Prompt (USP) */}
                {isResolvedPendingFeedback && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0C4137] to-[#082C25] border-2 border-[#06D6A0] space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#06D6A0]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Citizen Verification Required (USP): Was this violation actually fixed?</span>
                    </div>
                    <p className="text-xs text-[#E6FBF6] leading-relaxed">
                      The authority uploaded resolution proof. Please verify the actual ground situation. Your confirmation will officially close this case, while a negative response will immediately reopen & escalate it!
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => handleOpenFeedback(rep, true)}
                        className="px-4 py-2 rounded-xl bg-[#06D6A0] text-[#04120F] text-xs font-bold hover:bg-[#05B789] transition-all flex items-center gap-1.5 shadow-md shadow-[#06D6A0]/30"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Yes, Actually Fixed (Close with Proof)</span>
                      </button>

                      <button
                        onClick={() => handleOpenFeedback(rep, false)}
                        className="px-4 py-2 rounded-xl bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/40 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>No, NOT Fixed (Reopen & Escalate)</span>
                      </button>

                      <button
                        onClick={() => onSelectReport(rep.id)}
                        className="text-xs text-[#A2C5BD] hover:text-[#06D6A0] underline ml-auto"
                      >
                        Inspect Before & After Photos First →
                      </button>
                    </div>
                  </div>
                )}

                {/* Escalation Alert Badge if Reopened */}
                {rep.is_escalated && (
                  <div className="p-3 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-xs text-[#EF4444] flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Reopened & Escalated (Level #{rep.escalation_count}) — Citizen verification failed. Senior authorities alerted!
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- FEEDBACK DIALOG MODAL --- */}
      {feedbackReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0C4137] border border-[#06D6A0]/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
              {wasFixed ? "Confirm Official Resolution" : "Report Inadequate Fix & Escalate"}
            </h3>

            <p className="text-xs text-[#A2C5BD]">
              {wasFixed
                ? `You are confirming that Incident ${feedbackReport.incident_number} has been remediated satisfactorily.`
                : `Reporting that Incident ${feedbackReport.incident_number} was NOT resolved will immediately escalate it to CRITICAL status.`}
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {wasFixed && (
                <div>
                  <label className="block text-xs font-semibold text-[#A2C5BD] mb-1">
                    Rate Authority's Remediation:
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                          rating >= s
                            ? "bg-[#06D6A0] text-[#04120F] border-[#06D6A0]"
                            : "bg-[#08231E] text-[#659389] border-[#06D6A0]/20"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{s}★</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#A2C5BD] mb-1">
                  Citizen Comments & Notes:
                </label>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share details on current ground status..."
                  className="w-full px-3 py-2 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-xs text-[#E6FBF6] focus:outline-none focus:border-[#06D6A0]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${
                    wasFixed
                      ? "envi-btn-primary"
                      : "bg-[#EF4444] text-white hover:bg-[#DC2626]"
                  }`}
                >
                  {submittingFeedback
                    ? "Submitting..."
                    : wasFixed
                    ? "Submit Verification & Close Case"
                    : "Reopen & Escalate to Critical"}
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackReport(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#082C25] text-xs text-[#E6FBF6]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
