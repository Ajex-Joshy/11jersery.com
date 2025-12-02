import mongoose, { Schema, Types } from "mongoose";

const { ObjectId } = Types;

const auctionSchema = new Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [150, "Product name must be at most 150 characters"],
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug may only contain lowercase letters, numbers and dashes",
      ],
      maxlength: [200, "Slug must be at most 200 characters"],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description must be at most 5000 characters"],
      default: "",
    },

    tagline: {
      type: String,
      trim: true,
      maxlength: [250, "Tagline must be at most 250 characters"],
      default: "",
    },

    imageIds: {
      type: [String],
      validate: {
        validator: function (arr) {
          // allow empty but if present ensure IDs are non-empty strings
          return (
            Array.isArray(arr) &&
            arr.every((s) => typeof s === "string" && s.trim().length > 0)
          );
        },
        message: "imageIds must be an array of non-empty strings",
      },
      default: [],
    },

    // Auction Configuration
    joiningTime: {
      type: Date,
      required: [true, "Joining time is required"],
    },

    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },

    scheduledEndTime: {
      type: Date,
      required: [true, "Scheduled end time is required"],
    },

    currentEndTime: {
      type: Date,
      required: [true, "Current end time is required"],
    },

    startingBid: {
      type: Number,
      required: [true, "Starting bid is required"],
      min: [0, "Starting bid must be >= 0"],
    },

    bidIncrement: {
      type: Number,
      default: 50,
      min: [1, "Bid increment must be at least 1"],
    },

    // Live State
    currentBid: {
      type: Number,
      default: 0,
      min: [0, "Current bid must be >= 0"],
    },

    currentBidId: {
      type: ObjectId,
      ref: "Bid",
      default: null,
    },

    highestBidder: {
      type: ObjectId,
      ref: "User",
      default: null,
    },

    totalBids: {
      type: Number,
      default: 0,
      min: [0, "Total bids cannot be negative"],
    },

    // Status Management
    status: {
      type: String,
      enum: [
        "UPCOMING",
        "LIVE",
        "PENDING_PAYMENT",
        "COMPLETED",
        "CANCELLED",
        "UNSOLD",
      ],
      default: "UPCOMING",
      required: true,
      index: true,
    },

    // Payment Tracking for Winner
    paymentDeadline: {
      type: Date,
      validate: {
        validator: function (v) {
          // If status is PENDING_PAYMENT then paymentDeadline must be set and in the future
          if (this.status === "PENDING_PAYMENT")
            return v instanceof Date && v.getTime() > Date.now();
          // otherwise allow null/undefined or a valid date
          return v === undefined || v === null || v instanceof Date;
        },
        message:
          "paymentDeadline must be a future date when status is PENDING_PAYMENT",
      },
    },

    winnerPaymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    // For resuming auctions: Blacklist users who won but didn't pay
    blacklistedUsers: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Indexes for common queries
auctionSchema.index({ status: 1, currentEndTime: 1 });
auctionSchema.index({ startTime: 1, scheduledEndTime: 1 });
auctionSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string" } } }
);

// Pre-validate hook to enforce logical constraints and provide helpful messages
auctionSchema.pre("validate", function (next) {
  // Ensure time ordering: joiningTime < startTime <= scheduledEndTime
  if (
    this.joiningTime &&
    this.startTime &&
    this.startTime <= this.joiningTime
  ) {
    this.invalidate("startTime", "startTime must be after joiningTime");
  }

  if (
    this.startTime &&
    this.scheduledEndTime &&
    this.scheduledEndTime <= this.startTime
  ) {
    this.invalidate(
      "scheduledEndTime",
      "scheduledEndTime must be after startTime"
    );
  }

  // currentEndTime should be at least startTime and not in the past (unless auction completed)
  if (
    this.currentEndTime &&
    this.startTime &&
    this.currentEndTime < this.startTime
  ) {
    this.invalidate(
      "currentEndTime",
      "currentEndTime cannot be before startTime"
    );
  }

  // currentBid should never be less than startingBid
  if (
    typeof this.currentBid === "number" &&
    typeof this.startingBid === "number" &&
    this.currentBid < this.startingBid
  ) {
    this.invalidate("currentBid", "currentBid cannot be less than startingBid");
  }

  // If currentBid > 0 then it should align with bidIncrement steps from startingBid
  if (
    typeof this.currentBid === "number" &&
    this.currentBid > 0 &&
    typeof this.bidIncrement === "number" &&
    typeof this.startingBid === "number"
  ) {
    const diff = this.currentBid - this.startingBid;
    if (diff % this.bidIncrement !== 0) {
      this.invalidate(
        "currentBid",
        `currentBid must equal startingBid + N * bidIncrement (increment: ${this.bidIncrement})`
      );
    }
  }

  // If status is PENDING_PAYMENT, ensure there is a highestBidder and paymentDeadline
  if (this.status === "PENDING_PAYMENT") {
    if (!this.highestBidder)
      this.invalidate(
        "highestBidder",
        "highestBidder must be set when auction is in PENDING_PAYMENT"
      );
    if (!this.paymentDeadline)
      this.invalidate(
        "paymentDeadline",
        "paymentDeadline must be set when auction is in PENDING_PAYMENT"
      );
  }

  // totalBids must be integer
  if (this.totalBids !== undefined && !Number.isInteger(this.totalBids)) {
    this.invalidate("totalBids", "totalBids must be an integer");
  }

  next();
});

// Helpful virtuals
auctionSchema.virtual("isLive").get(function () {
  return this.status === "LIVE";
});

auctionSchema.virtual("timeRemaining").get(function () {
  if (!this.currentEndTime) return null;
  const ms = this.currentEndTime.getTime() - Date.now();
  return ms > 0 ? ms : 0;
});

// Clean JSON output
auctionSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Auction", auctionSchema);
