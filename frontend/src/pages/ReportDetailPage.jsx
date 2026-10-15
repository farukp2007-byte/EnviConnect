import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import LeafletMap from "../components/LeafletMap";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  Users,
  Clock,
  Sparkles,
  Camera,
  Bot
} from "lucide-react";

export default function ReportDetailPage({ reportId, onBack, setTab }) {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackFixed, setFeedbackFixed] = useState(true);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [reportId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await api.getReportById(reportId);
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(report.id, {
        was_fixed: feedbackFixed,
        rating: rating,
        comments: comments,
      });
      alert(
        feedbackFixed
          ? "Thank you! Citizen verification confirmed. Case is officially closed."
          : "Case reopened and escalated to CRITICAL priority! Alert sent to senior authority."
      );
      setShowFeedbackModal(false);
      loadDetail();
    } catch (err) {
      alert(`Feedback error: ${err.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-[#A2C5BD]">Loading incident investigation details...</div>;
  }

  if (!report) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-[#A2C5BD]">Incident not found.</p>
        <button onClick={onBack} className="envi-btn-primary py-2 px-4 text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Back button and breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A2C5BD] hover:text-[#06D6A0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2">
          {report.is_escalated && (
            <span className="bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Escalated to CRITICAL (Level #{report.escalation_count})</span>
            </span>
          )}
          <span className="font-mono text-xs font-bold text-[#06D6A0] bg-[#0C4137] px-3 py-1 rounded-full border border-[#06D6A0]/30">
            {report.incident_number}
          </span>
        </div>
      </div>

      {/* Incident Title Header */}
      <div className="envi-card p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="bg-[#082C25] text-[#06D6A0] text-xs font-bold px-3 py-1 rounded-full border border-[#06D6A0]/30 capitalize">
            {report.category.replace("_", " ")}
          </span>
          <span
            className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
              report.severity === "critical"
                ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]"
                : report.severity === "high"
                ? "bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]"
                : "bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]"
            }`}
          >
            {report.severity} Severity
          </span>
          <span className="bg-[#082C25] text-[#E6FBF6] text-xs font-medium px-3 py-1 rounded-full border border-[#06D6A0]/20">
            {report.zone_name}
          </span>
          {report.reporters_count > 1 && (
            <span className="bg-[#06D6A0] text-[#04120F] text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Users className="w-3.5 h-3.5" />
              <span>{report.reporters_count} Citizens Merged (Duplicate Detected)</span>
            </span>
          )}
        </div>

        <h1 className="font-serif-brand font-bold text-2xl sm:text-4xl text-[#E6FBF6] leading-tight">
          {report.title}
        </h1>

        <p className="text-sm text-[#A2C5BD] leading-relaxed max-w-3xl">
          {report.description}
        </p>

        <div className="pt-3 border-t border-[#06D6A0]/15 flex flex-wrap items-center justify-between gap-4 text-xs text-[#659389]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#06D6A0]" />
            <span className="text-[#E6FBF6] font-medium">{report.address}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Assigned: <strong className="text-[#06D6A0]">{report.authority_name}</strong></span>
            <span>Reported: {new Date(report.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* FEATURE 5: Before & After Proof Section */}
      <BeforeAfterSlider
        beforeUrl={report.primary_image_url}
        afterUrl={report.after_image_url}
        title={report.title}
        resolutionNotes={report.resolution_notes}
        resolvedAt={report.resolved_at}
        createdAt={report.created_at}
        category={report.category}
        status={report.status}
      />

      {/* FEATURE 6: Citizen Verification & Transparency Module (USP) */}
      {report.status === "resolved" && (
        <div className="envi-card p-6 rounded-3xl bg-gradient-to-r from-[#0C4137] to-[#082C25] border-2 border-[#06D6A0] space-y-4">
          <div className="flex items-center gap-2 text-base font-serif-brand font-bold text-[#06D6A0]">
            <ShieldCheck className="w-5 h-5" />
            <span>Citizen Verification & Transparency Prompt (USP)</span>
          </div>
          <p className="text-xs text-[#E6FBF6] leading-relaxed">
            The authority has submitted resolution proof above and marked this incident resolved. As a citizen stakeholder, was this issue actually fixed on the ground?
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setFeedbackFixed(true);
                setRating(5);
                setComments("Confirmed fixed. Street is clean and verified.");
                setShowFeedbackModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#06D6A0] text-[#04120F] text-xs font-bold hover:bg-[#05B789] transition-all flex items-center gap-2 shadow-md shadow-[#06D6A0]/30"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Yes, Actually Fixed (Close with Proof)</span>
            </button>

            <button
              onClick={() => {
                setFeedbackFixed(false);
                setRating(1);
                setComments("NOT fixed! The waste was only partially cleared and violation continues.");
                setShowFeedbackModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/40 text-xs font-bold transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>No, NOT Fixed (Reopen & Escalate)</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback History If Already Submitted */}
      {report.feedbacks && report.feedbacks.length > 0 && (
        <div className="envi-card p-6 rounded-3xl space-y-3">
          <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6] flex items-center gap-2">
            <Star className="w-4 h-4 text-[#FBBF24] fill-current" />
            <span>Citizen Verification Feedback Log</span>
          </h3>
          <div className="space-y-3 divide-y divide-[#06D6A0]/10 text-xs">
            {report.feedbacks.map((fb) => (
              <div key={fb.id} className="pt-2.5 first:pt-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#E6FBF6] flex items-center gap-1.5">
                    {fb.was_fixed ? (
                      <span className="text-[#06D6A0]">✓ Confirmed Fixed</span>
                    ) : (
                      <span className="text-[#EF4444]">✗ Marked NOT Fixed (Escalation Triggered)</span>
                    )}
                    <span className="text-[#659389] font-normal">• by {fb.citizen_name}</span>
                  </span>
                  <span className="text-[#FBBF24] font-bold">{fb.rating}★</span>
                </div>
                {fb.comments && <p className="text-[#A2C5BD] italic">"{fb.comments}"</p>}
                <div className="text-[10px] text-[#659389]">
                  {new Date(fb.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Citizen Evidences (USP: All evidences linked to one complaint) */}
      <div className="envi-card p-6 rounded-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#06D6A0]" />
              <span>Linked Citizen Evidences ({report.evidences?.length || 1})</span>
            </h3>
            <p className="text-xs text-[#A2C5BD]">
              {report.reporters_count > 1
                ? "Multiple citizens reported this violation in proximity (&lt;100m). All uploaded evidence is consolidated here."
                : "Primary photographic evidence recorded by the citizen."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {report.evidences?.map((ev, i) => (
            <div key={ev.id} className="bg-[#08231E] rounded-2xl overflow-hidden border border-[#06D6A0]/20 space-y-2 pb-3">
              <div className="h-40 bg-black overflow-hidden relative">
                <img
                  src={api.assetUrl(ev.image_url)}
                  alt="Evidence photo"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-[#04120F]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-[#A2C5BD]">
                  Evidence #{i + 1}
                </span>
                {ev.has_exif_gps && (
                  <span className="absolute top-2 right-2 bg-[#06D6A0] text-[#04120F] text-[9px] font-bold px-1.5 py-0.5 rounded">
                    EXIF GPS Verified
                  </span>
                )}
              </div>
              <div className="px-3 space-y-1 text-xs">
                <div className="font-semibold text-[#E6FBF6] truncate">{ev.reporter_name}</div>
                <p className="text-[11px] text-[#A2C5BD] line-clamp-2">{ev.notes}</p>
                <div className="text-[10px] text-[#659389] pt-1">
                  {new Date(ev.created_at).toLocaleString()} • Lat: {ev.latitude.toFixed(4)}, Lng: {ev.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Status Timeline & Incident Location Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="envi-card p-6 rounded-3xl space-y-4">
          <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#06D6A0]" />
            <span>Public Status & Remediation Timeline</span>
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#06D6A0]/30">
            {report.history?.map((hist, i) => (
              <div key={hist.id} className="relative space-y-1 text-xs">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#06D6A0] border-2 border-[#0C4137] shadow-sm"></div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#E6FBF6] uppercase tracking-wide">
                    {hist.new_status.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-[#659389]">
                    {new Date(hist.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="text-[11px] text-[#06D6A0] font-medium">
                  {hist.changed_by_name || "System"}
                </div>

                <p className="text-[#A2C5BD] text-xs leading-relaxed">
                  {hist.notes}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Location Map Preview */}
        <div className="envi-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6] flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-[#06D6A0]" />
              <span>GIS Coordinate Verification</span>
            </h3>
            <p className="text-xs text-[#A2C5BD]">
              {report.address} • Coordinates: {report.latitude.toFixed(5)}°N, {report.longitude.toFixed(5)}°E
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#06D6A0]/20 flex-1 min-h-[280px]">
            <LeafletMap
              incidents={[report]}
              height="280px"
              showHeatmapDefault={false}
            />
          </div>
        </div>
      </div>

      {/* --- FEEDBACK MODAL --- */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0C4137] border border-[#06D6A0]/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
              {feedbackFixed ? "Confirm Official Case Resolution" : "Reopen & Escalate Violation"}
            </h3>

            <p className="text-xs text-[#A2C5BD]">
              {feedbackFixed
                ? "Your confirmation officially validates that the authority cleared the violation with proof."
                : "Reporting NOT FIXED triggers an instant re-escalation to CRITICAL status."}
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              {feedbackFixed && (
                <div>
                  <label className="block text-xs font-semibold text-[#A2C5BD] mb-1">
                    Remediation Rating:
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
                  Citizen Notes:
                </label>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-xs text-[#E6FBF6] focus:outline-none focus:border-[#06D6A0]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs ${
                    feedbackFixed
                      ? "envi-btn-primary"
                      : "bg-[#EF4444] text-white hover:bg-[#DC2626]"
                  }`}
                >
                  {submittingFeedback ? "Saving..." : feedbackFixed ? "Submit & Close Case" : "Reopen & Escalate"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
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
