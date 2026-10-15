import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Bell, CheckCheck, X, AlertTriangle, ShieldCheck, Copy, Sparkles, ExternalLink } from "lucide-react";

export default function NotificationModal({ isOpen, onClose, onSelectReport }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch (e) {
        console.error(e);
      }
    }
    if (notif.link_id && onSelectReport) {
      onSelectReport(notif.link_id);
      onClose();
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case "escalation":
        return <AlertTriangle className="w-5 h-5 text-[#EF4444]" />;
      case "duplicate_merged":
        return <Copy className="w-5 h-5 text-[#06D6A0]" />;
      case "new_assignment":
        return <Sparkles className="w-5 h-5 text-[#FBBF24]" />;
      case "feedback":
        return <ShieldCheck className="w-5 h-5 text-[#06D6A0]" />;
      default:
        return <Bell className="w-5 h-5 text-[#A2C5BD]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0C4137] border border-[#06D6A0]/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#06D6A0]/15 flex items-center justify-between bg-[#082C25]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#06D6A0]/15 border border-[#06D6A0]/40 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#06D6A0]" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
                Notification Center
              </h3>
              <p className="text-xs text-[#A2C5BD]">
                Live updates on incident routing, duplicate merges & escalations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A2C5BD] hover:text-[#E6FBF6] hover:bg-[#0C4137] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-[#08231E]/60 border-b border-[#06D6A0]/10 flex items-center justify-between text-xs">
          <span className="text-[#659389]">
            {notifications.filter((n) => !n.is_read).length} unread updates
          </span>
          <button
            onClick={handleMarkAllRead}
            className="text-[#06D6A0] hover:underline flex items-center gap-1 font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        </div>

        {/* Notification List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-[#06D6A0]/10">
          {loading ? (
            <div className="text-center py-10 text-[#A2C5BD]">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-[#A2C5BD]">
              <Bell className="w-10 h-10 text-[#06D6A0]/30 mx-auto mb-2" />
              <p className="font-medium text-sm">No notifications yet</p>
              <p className="text-xs text-[#659389]">Submit a report or update a case to trigger alerts.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`pt-2.5 first:pt-0 p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-3 hover:bg-[#082C25]/80 ${
                  !notif.is_read
                    ? "bg-[#082C25]/50 border border-[#06D6A0]/25 shadow-sm"
                    : "opacity-80"
                }`}
              >
                <div className="mt-0.5 p-2 rounded-xl bg-[#04120F]/60 border border-[#06D6A0]/20 flex-shrink-0">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-[#E6FBF6] truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#659389] whitespace-nowrap">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#A2C5BD] mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.link_id && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#06D6A0] font-medium">
                      <span>View Incident</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-[#06D6A0] mt-1.5 flex-shrink-0"></span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#082C25]/80 border-t border-[#06D6A0]/15 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#0C4137] hover:bg-[#125246] text-[#E6FBF6] text-xs font-medium border border-[#06D6A0]/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
