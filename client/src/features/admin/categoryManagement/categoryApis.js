import axiosInstance from "../../../api/axiosInstance";

export const getCategories = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { data } = await axiosInstance.get("/admin/categories", { params });

  return data;
};

export const addCategory = async (formData) => {
  console.log("data");
  const { data } = await axiosInstance.post("/admin/categories", formData);
  console.log(data);
  return data;
};

export const toggleCategoryList = async ({ categoryId, isListed }) => {
  const { data } = await axiosInstance.patch(
    `/admin/categories/${categoryId}/status`,
    {
      isListed,
    }
  );
  return data;
};

export const deleteCategory = async (categoryId) => {
  const { data } = await axiosInstance.delete(
    `/admin/categories/${categoryId}`
  );
  return data;
};

export const getCategoryDetails = async (slug) => {
  const { data } = await axiosInstance.get(`/admin/categories/${slug}`);
  return data;
};

export const updateCategory = async ({ id, formData }) => {
  console.log("update cat");
  for (const [key, value] of formData.entries()) {
    console.log("formData", key, value);
  }

  const { data } = await axiosInstance.patch(
    `/admin/categories/${id}`,
    formData
  );
  return data;
};
