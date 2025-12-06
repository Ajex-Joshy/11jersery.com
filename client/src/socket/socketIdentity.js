import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { selectCurrentUser } from "../features/user/account/authSlice.js";

export const getSocketIdentity = (user) => {
  if (user) {
    return { userId: user._id, role: "user", token: user.token };
  }

  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = `guest_${uuidv4()}`;
    localStorage.setItem("guest_id", guestId);
  }
  return { userId: guestId, role: "guest", token: null };
};
