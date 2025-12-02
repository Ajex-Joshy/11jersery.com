import Auction from "../../../models/auction.model";
import { STATUS_CODES } from "../../../utils/constants";
import { AppError, createSlug } from "../../../utils/helpers";
import { uploadFileToS3 } from "../service-helpers/s3.service";

/**
 * Create Auction Service
 */
export const createAuction = async ({
  title,
  images,
  description,
  tagline,
  joiningTime,
  startTime,
  scheduledEndTime,
  startingBid,
  bidIncrement,
}) => {
  try {
    if (!images || images.length < 3) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "VALIDATION_ERROR",
        "At least 3 images are required to create an auction."
      );
    }

    const uploadedImages = await Promise.all(
      images.map((img) => uploadFileToS3(img))
    );

    const slug = createSlug(title);

    const auctionDetails = await Auction.create({
      title,
      imageIds: uploadedImages,
      description,
      tagline,
      joiningTime,
      startTime,
      scheduledEndTime,
      startingBid,
      bidIncrement,
      slug,
    });

    return auctionDetails;
  } catch (error) {
    throw new AppError(
      STATUS_CODES.SERVER_ERROR,
      "INTERNAL_ERROR",
      error.message || "Something went wrong while creating auction"
    );
  }
};

/**
 * Edit Auction By ID Service
 */
export const editAuctionById = async ({
  auctionId,
  updateAuctionData,
  images,
}) => {
  try {
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      throw new AppError(
        STATUS_CODES.NOT_FOUND,
        "AUCTION_NOT_FOUND",
        "Auction not found."
      );
    }

    let updatedData = { ...updateAuctionData };

    if (images && images.length > 0) {
      const uploadedNewImages = await Promise.all(
        images.map((img) => uploadFileToS3(img))
      );

      updatedData.imageIds = [
        ...(auction.imageIds || []),
        ...uploadedNewImages,
      ];
    }

    if (updateAuctionData?.title) {
      updatedData.slug = createSlug(updateAuctionData.title);
    }

    const newAuctionData = await Auction.findByIdAndUpdate(
      auctionId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!newAuctionData) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "UPDATE_FAILED",
        "Failed to update auction."
      );
    }

    return newAuctionData;
  } catch (error) {
    throw new AppError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "INTERNAL_ERROR",
      error.message || "Something went wrong while updating auction"
    );
  }
};

/**
 * Delete Auction By ID Service
 */

export const deleteAuctionByID = async (auctionId) => {
  try {
    const auction = await Auction.findByIdAndUpdate(auctionId, {
      isDeleted: true,
    });
    if (!auction) {
      throw new AppError(
        STATUS_CODES.NOT_FOUND,
        "AUCTION_NOT_FOUND",
        "Auction not found."
      );
    }
  } catch (err) {
    throw new AppError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "INTERNAL_ERROR",
      err.message || "Something went wrong while updating auction"
    );
  }
};


export const getAuctions = (queryParams) => {}