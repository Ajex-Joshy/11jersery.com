import express from "express";
const router = express.Router();
import { Webhook } from "svix";
import User from "../models/userModel.js";

router.post("/clerk", async (req, res) => {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: "WEBHOOK_SECRET not set" });
  }

  // Get the headers
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Error: Missing Svix headers" });
  }

  // Get the raw body
  const payload = req.body;
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    return res.status(400).json({ error: "Webhook verification failed" });
  }

  // Get the event type
  const { id } = evt.data;
  const eventType = evt.type;

  // --- HANDLE THE WEBHOOKS ---

  // 1. User Created
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, phone_numbers } =
      evt.data;

    try {
      await User.create({
        _id: id, // Use Clerk's ID as your _id
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
        phone: phone_numbers[0]?.phone_number,
        isBlocked: false, // Your app-specific defaults
        status: "active",
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to create user" });
    }
  }

  // 2. User Updated (e.g., email change)
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, phone_numbers } =
      evt.data;

    try {
      await User.findByIdAndUpdate(id, {
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
        phone: phone_numbers[0]?.phone_number,
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  }

  // 3. User Deleted
  if (eventType === "user.deleted") {
    try {
      // You can either delete them or set an 'isDeleted' flag
      await User.findByIdAndDelete(id);
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete user" });
    }
  }

  res.status(200).json({ message: "Webhook processed" });
});

export default router;
