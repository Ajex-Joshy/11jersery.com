import axiosInstance from "../../../api/axiosInstance";
/**
 * Fetches products with pagination, sorting, filtering.
 */
export const getProducts = async ({ queryKey }) => {
  const [, params] = queryKey;
  const response = await axiosInstance.get("/admin/products", { params });
  return response.data;
};

/**
 * Toggles the isListed status of a product.
 */
export const toggleProductList = async ({ productId, isListed }) => {
  const { data } = await axiosInstance.patch(
    `/admin/products/${productId}/status`,
    {
      isListed,
    }
  );
  return data;
};

/**
 * Deletes a product.
 */
export const deleteProduct = async (productId) => {
  const { data } = await axiosInstance.delete(`/admin/products/${productId}`);
  return data;
};

// --- Category API (Might already exist) ---
/**
 * Fetches all categories for filter dropdown.
 */
export const getAllCategories = async () => {
  // Assuming a simple GET route without pagination needed for the filter
  const response = await axiosInstance.get("/admin/categories"); // Or adjust endpoint
  return response.data;
};

export const getProductDetails = async ({ queryKey }) => {
  const [_, slug] = queryKey;
  const response = await axiosInstance.get(`/admin/products/${slug}`); // Or adjust endpoint
  return response.data;
};

/**
 * Adds a new product. Sends FormData including stringified JSON.
 */
export const addProduct = async (formData) => {
  const { data } = await axiosInstance.post("/admin/products", formData, {
    headers: {
      // Axios usually sets this automatically for FormData, but being explicit is fine
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateProduct = async ({ id, formData }) => {
  const { data } = await axiosInstance.patch(
    `/admin/products/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};
