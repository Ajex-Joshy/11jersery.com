import React, { useState } from "react";
import { Pencil, AlertTriangle, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { PersonalDetailsModal } from "./components/PersonalDetailsModal";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { ErrorDisplay } from "../../../components/common/StateDisplays";
import { selectCurrentUser } from "./authSlice";
import toast from "react-hot-toast";
import { useUserProfile } from "./userHooks";

const SettingsCard = ({ title, children, onEdit }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <button
        onClick={onEdit}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
        aria-label={`Edit ${title}`}
      >
        <Pencil size={16} />
      </button>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center">
    <span className="text-sm font-medium text-gray-500 w-28 flex-shrink-0">
      {label}
    </span>
    <span className="text-md text-gray-800 break-words">{value}</span>
  </div>
);

const AccountSettingsPage = () => {
  const [modalView, setModalView] = useState(null); // 'personal' | 'password' | null

  // Fetch fresh profile data
  const { data: profilePayload, isLoading, isError, error } = useUserProfile();
  const userFromStore = useSelector(selectCurrentUser);

  // Get data from Redux as a fallback/initial state
  const user = profilePayload?.data || userFromStore;

  // Loading State
  if (isLoading && !user) {
    return <LoadingSpinner text="Loading Settings..." />;
  }

  // Error State
  if (isError) {
    return <ErrorDisplay error={error} />;
  }

  // This should not happen if user is logged in, but good to check
  if (!user) {
    return (
      <ErrorDisplay error={{ message: "User data could not be loaded." }} />
    );
  }

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>

        {/* --- Personal Details Card --- */}
        <SettingsCard
          title="Personal Details"
          onEdit={() => setModalView("personal")}
        >
          <InfoRow label="First Name" value={user.firstName || "..."} />
          <InfoRow label="Last Name" value={user.lastName || "..."} />
          <InfoRow label="Email" value={user.email || "..."} />
          {/* Add other fields as needed, e.g., Gender, DOB */}
        </SettingsCard>

        {/* --- Email & Password Card --- */}
        <SettingsCard
          title="Phone & Password"
          onEdit={() => setModalView("password")}
        >
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow label="Password" value="••••••••" />
        </SettingsCard>

        {/* --- Delete Account Section --- */}
        {/* <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2 mb-3">
            <AlertTriangle size={20} />
            Delete Account
          </h2>
          <p className="text-sm text-gray-700 mb-4 max-w-lg">
            Permanently delete your account, orders, and all associated data.
            This action cannot be undone.
          </p>
          <button
            className="text-sm font-medium text-red-600 bg-white hover:bg-red-50 px-4 py-2 rounded-md border border-red-300 shadow-sm transition-colors"
            onClick={() =>
              toast.error("Delete account functionality not yet implemented.")
            } // Placeholder action
          >
            Delete my account
          </button>
        </div> */}
      </div>

      <PersonalDetailsModal
        isOpen={modalView === "personal"}
        onClose={() => setModalView(null)}
        user={user}
      />

      <ChangePasswordModal
        isOpen={modalView === "password"}
        onClose={() => setModalView(null)}
        userEmail={user.email}
      />
    </>
  );
};

export default AccountSettingsPage;
