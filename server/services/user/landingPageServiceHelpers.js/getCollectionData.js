import Category from "../../../models/categoryModel.js";

export const getCollectionsData = async () => {
  const categories = await Category.find(
    {
      inCollections: true,
      isDeleted: false,
      isListed: true,
    },
    {
      _id: 1,
      title: 1,
      slug: 1,
      cloudinaryImageId: 1,
    }
  ).lean();
  return categories;
};
