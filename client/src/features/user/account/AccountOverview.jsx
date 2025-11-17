import React from "react";
import { useSelector } from "react-redux";
import { User, Mail, Phone } from "lucide-react";

import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays.jsx";
import { S3_URL } from "../../../utils/constants";
import { selectCurrentUser } from "./authSlice.js";

const getJoinDateFromObjectId = (objectId) => {
  if (!objectId || objectId.length < 8) {
    return "N/A";
  }
  try {
    const timestamp = parseInt(objectId.substring(0, 8), 16) * 1000;
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    console.error("Error parsing ObjectId:", e);
    return "N/A";
  }
};

/**
 * A reusable row for displaying profile information.
 */
// eslint-disable-next-line no-unused-vars
const InfoRow = ({ icon: Icon, label, value }) => (
  <div>
    <label className="flex items-center text-xs font-semibold text-gray-500 uppercase mb-1">
      <Icon size={14} className="mr-2" />
      {label}
    </label>
    <p className="text-md text-gray-800 ml-[22px]">{value || "Not provided"}</p>
  </div>
);

const AccountOverview = () => {
  const user = useSelector(selectCurrentUser);

  if (!user) {
    return <ErrorDisplay error={{ message: "Could not load user data." }} />;
  }

  const joinDate = getJoinDateFromObjectId(user._id);
  const imageUrl =
    user.imageId && user.imageId !== "default-profile"
      ? `${S3_URL}/images/${user.imageId}`
      : null; // Will show fallback

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
      {/* --- Header --- */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Hello, {user.firstName}
      </h1>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Member Since
        </label>
        <p className="text-md text-gray-800">{joinDate}</p>
      </div>

      {/* --- Main Content --- */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-start gap-8">
        <div className="flex-shrink-0 w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/128/eeeeee/aaaaaa?text=User";
              }}
            />
          ) : (
            <User className="w-20 h-20 text-gray-400" />
          )}
        </div>

        {/* Profile Details */}
        <div className="flex my-auto space-x-10">
          <InfoRow
            icon={User}
            label="Full Name"
            value={`${user.firstName} ${user.lastName}`}
          />
          <InfoRow icon={Mail} label="Email Address" value={user.email} />
          <InfoRow
            icon={Phone}
            label="Phone Number"
            value={user.phone || "Not provided"}
          />
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;
