// src/utils/identity.js
import { v4 as uuidv4 } from "uuid"; // npm install uuid

export const getSocketIdentity = (user) => {
  if (user) {
    return {
      userId: user._id,
      username: user.username,
      role: "authenticated",
      token: user.token,
    };
  } else {
    let guestId = localStorage.getItem("guest_id");
    if (!guestId) {
      guestId = `guest_${uuidv4()}`;
      localStorage.setItem("guest_id", guestId);
    }

    return {
      userId: guestId,
      username: "Guest",
      role: "guest",
      token: null,
    };
  }
};
