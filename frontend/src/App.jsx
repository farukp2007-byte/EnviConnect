import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import RoleBanner from "./components/RoleBanner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotificationModal from "./components/NotificationModal";
import AuthModal from "./components/AuthModal";
import MobileBottomNav from "./components/MobileBottomNav";
import MobileAccessModal from "./components/MobileAccessModal";

// Pages
import LandingPage from "./pages/LandingPage";
import ReportIncidentPage from "./pages/ReportIncidentPage";
import PublicMapPage from "./pages/PublicMapPage";
import MyReportsPage from "./pages/MyReportsPage";
import AuthorityDashboardPage from "./pages/AuthorityDashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AdminPage from "./pages/AdminPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import EcoRewardsPage from "./pages/EcoRewardsPage";

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState("home");
  const [previousTab, setPreviousTab] = useState("home");
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileAccessOpen, setMobileAccessOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll notifications count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const notifs = await api.getNotifications();
        const unread = notifs.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (e) {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSelectReport = (reportId) => {
    setPreviousTab(currentTab === "report-detail" ? "home" : currentTab);
    setSelectedReportId(reportId);
    setCurrentTab("report-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSetTab = (tab) => {
    setPreviousTab(currentTab);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#04120F] text-[#E6FBF6] flex flex-col font-sans">
      {/* 1-Click Role Switcher Demo Banner */}
      <RoleBanner />

      {/* Primary Brand Navbar */}
      <Navbar
        currentTab={currentTab}
        setTab={handleSetTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenMobileAccess={() => setMobileAccessOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Routed Page Area with bottom padding on mobile for sticky bottom bar */}
      <main className="flex-1 pb-20 lg:pb-0">
        {currentTab === "home" && (
          <LandingPage
            setTab={handleSetTab}
            onSelectReport={handleSelectReport}
          />
        )}

        {currentTab === "report" && (
          <ReportIncidentPage
            onSelectReport={handleSelectReport}
            setTab={handleSetTab}
          />
        )}

        {currentTab === "map" && (
          <PublicMapPage onSelectReport={handleSelectReport} />
        )}

        {currentTab === "my-reports" && (
          <MyReportsPage
            onSelectReport={handleSelectReport}
            setTab={handleSetTab}
          />
        )}

        {currentTab === "authority" && (
          <AuthorityDashboardPage onSelectReport={handleSelectReport} />
        )}

        {currentTab === "analytics" && <AnalyticsPage />}

        {currentTab === "rewards" && <EcoRewardsPage setTab={handleSetTab} />}

        {currentTab === "admin" && <AdminPage />}

        {currentTab === "report-detail" && (
          <ReportDetailPage
            reportId={selectedReportId}
            onBack={() => handleSetTab(previousTab)}
            setTab={handleSetTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setTab={handleSetTab} />

      {/* Thumb-friendly Mobile Bottom Navigation */}
      <MobileBottomNav currentTab={currentTab} setTab={handleSetTab} />

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectReport={handleSelectReport}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Mobile Access / Phone Connect QR Modal */}
      <MobileAccessModal
        isOpen={mobileAccessOpen}
        onClose={() => setMobileAccessOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
