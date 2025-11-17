import logger from "../../../config/logger.js";
import Faq from "../../../models/faq.model.js";
import { STATUS_CODES } from "../../../utils/constants.js";

export const buildCategoryStockPipeline = (query, sort, skip, pageSize) => [
  { $match: query },
  { $sort: sort },
  { $skip: skip },
  { $limit: pageSize },
  {
    $lookup: {
      from: "products",
      let: { categoryId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$$categoryId", "$categoryIds"] },
          },
        },
        // Unwind product variants to access each stock
        { $unwind: "$variants" },
        // Group all variants to calculate total stock and product count
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$variants.stock" },
            productCount: { $sum: 1 },
          },
        },
      ],
      as: "meta",
    },
  },
  {
    $addFields: {
      totalStock: { $ifNull: [{ $first: "$meta.totalStock" }, 0] },
      productCount: { $ifNull: [{ $first: "$meta.productCount" }, 0] },
    },
  },
  { $project: { meta: 0, updatedAt: 0, _v: 0, __v: 0 } },
];

export const updateFaqs = async (newFaqsData = [], productId) => {
  if (!productId) {
    throw createError(
      STATUS_CODES.BAD_REQUEST,
      "Product ID is required to update FAQs."
    );
  }

  // 1. Get all existing FAQs for this product
  const existingFaqs = await Faq.find({ productId: productId });
  const existingFaqMap = new Map(
    existingFaqs.map((faq) => [faq._id.toString(), faq])
  );
  const incomingFaqIds = new Set(
    newFaqsData.map((faq) => faq._id).filter(Boolean)
  ); // IDs from the submitted form that might exist

  const operations = []; // Array to hold all DB operations promises

  // 2. Identify FAQs to Delete
  const faqsToDelete = [];
  existingFaqs.forEach((existingFaq) => {
    if (!incomingFaqIds.has(existingFaq._id.toString())) {
      faqsToDelete.push(existingFaq._id);
    }
  });

  if (faqsToDelete.length > 0) {
    operations.push(Faq.deleteMany({ _id: { $in: faqsToDelete } }));
  }

  // 3. Identify FAQs to Create or Update
  newFaqsData.forEach((incomingFaq) => {
    if (incomingFaq._id && existingFaqMap.has(incomingFaq._id)) {
      // --- Update Existing ---
      const existingFaq = existingFaqMap.get(incomingFaq._id);
      // Check if question or answer actually changed
      if (
        existingFaq.question !== incomingFaq.question ||
        existingFaq.answer !== incomingFaq.answer
      ) {
        operations.push(
          Faq.findByIdAndUpdate(
            incomingFaq._id,
            {
              $set: {
                question: incomingFaq.question,
                answer: incomingFaq.answer,
              },
            },
            { new: true, runValidators: true } // Return updated, run schema validation
          )
        );
      }
    } else {
      // --- Create New ---
      const faqToCreate = { ...incomingFaq };
      delete faqToCreate._id;
      operations.push(
        Faq.create({
          ...faqToCreate,
          productId: productId,
        })
      );
    }
  });

  // 4. Execute all operations
  try {
    await Promise.all(operations);
  } catch (error) {
    logger.error(error);
    throw createError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Failed to update product FAQs."
    );
  }

  // 5. Return the final list of FAQs for the product
  const finalFaqs = await Faq.find({ productId: productId });
  return finalFaqs;
};

// --- Example saveFaqs function (if needed for create product) ---
// This assumes you *don't* pass IDs during creation
export const saveFaqs = async (faqsData = [], productId) => {
  if (!productId) {
    throw createError(
      STATUS_CODES.BAD_REQUEST,
      "Product ID is required to save FAQs."
    );
  }
  if (faqsData.length === 0) {
    return [];
  }

  const faqsToCreate = faqsData.map((faq) => ({
    ...faq,
    productId: productId, // Ensure productId is set
  }));

  try {
    const savedFaqs = await Faq.insertMany(faqsToCreate);
    return savedFaqs;
  } catch (error) {
    logger.error(error);
    throw createError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Failed to save product FAQs."
    );
  }
};
