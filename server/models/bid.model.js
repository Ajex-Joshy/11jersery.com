import mongoose, { Schema, Types } from "mongoose";

const bidSchema = new Schema(
  {
    auctionId: {
      type: Types.ObjectId,
      ref: "Auction",
      required: true,
      index: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    // To detect "sniping" or late bids
    bidTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Bid", bidSchema);
