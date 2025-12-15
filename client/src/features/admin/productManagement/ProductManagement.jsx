import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTableParams } from "../../../hooks/useTableParams.jsx";
import {
  useProducts,
  useAllCategories,
  useToggleProductList,
  useDeleteProduct,
} from "./productHooks.js";
import DynamicTable from "../../../components/admin/DynamicTable.jsx";
import {
  ListToggleButton,
  ActionIconButtons,
} from "../../../components/admin/UiElements.jsx";
import ConfirmationModal from "../../../components/common/ConfirmationModal.jsx";
import StockVariantsDisplay from "../../../components/admin/StockVariantsDisplay.jsx";
import { Plus } from "lucide-react";
import { formatRupee } from "../../../utils/currency.js";

const ProductImage = ({ imageUrl, title }) => (
  <img
    src={imageUrl}
    alt={title}
    className="w-12 h-12 object-cover rounded-md border border-gray-200"
    onError={(e) => {
      e.target.src =
        "https://acube.delighterp.com/uploaded/acube_delighterp_com/product/default_product_image.jpg";
    }} // Fallback image
  />
);

const ProductList = () => {
  const navigate = useNavigate();

  // --- STATE & HOOKS ---
  const { queryParams, uiState, handlers } = useTableParams({
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    item: null,
    action: null,
  });

  // --- DATA FETCHING ---
  const {
    data: productData,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts,
  } = useProducts(queryParams);

  // Fetch categories for the filter dropdown
  const { data: categoriesData } = useAllCategories();
  const categoriesForFilter = categoriesData?.data?.categories || [];
  // --- MUTATIONS ---
  const { mutate: toggleList, isLoading: isTogglingList } =
    useToggleProductList();
  const { mutate: deleteProd, isLoading: isDeleting } = useDeleteProduct();

  // --- LOADING / ERROR ---
  if (isLoadingProducts) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 mt-4">Loading product data...</p>
      </div>
    );
  }

  if (isErrorProducts) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-red-500 mt-4">
          Error loading data: {errorProducts.message}
        </p>
      </div>
    );
  }

  // --- MODAL HANDLERS ---
  const openModal = (item, action) =>
    setModalState({ isOpen: true, item, action });
  const closeModal = () =>
    setModalState({ isOpen: false, item: null, action: null });
  const handleConfirm = () => {
    const { item, action } = modalState;
    if (!item) return;
    if (action === "toggleList") {
      toggleList(
        { productId: item._id, isListed: !item.isListed },
        { onSettled: closeModal }
      );
    } else if (action === "delete") {
      deleteProd(item._id, { onSettled: closeModal });
    }
  };

  // --- COLUMN DEFINITIONS ---
  const productColumns = [
    {
      header: "Image",
      key: "image",
      sortable: false,
      render: (item) => (
        <ProductImage imageUrl={item.imageUrls?.[0]} title={item.title} />
      ),
    },
    {
      header: "Product Name",
      key: "title",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900  w-40  break-words whitespace-normal">
          {item.title}
        </span>
      ),
    },
    {
      header: "Category",
      key: "category", // Might not be sortable if ID only
      sortable: false,
      render: (item) => {
        const categoryNames = item.categoryIds
          ?.map(
            (id) => categoriesForFilter.find((cat) => cat._id === id)?.title
          )
          .filter(Boolean) // Remove undefined if category not found
          .join(", ");
        return (
          <span className="text-sm text-gray-600 w-40 break-words whitespace-normal">
            {categoryNames || "N/A"}
          </span>
        );
      },
    },
    {
      header: "Price",
      key: "price", // Sort by sale price
      sortable: true,
      render: (item) => (
        <span className="text-gray-800 font-semibold">
          {formatRupee(item?.price?.sale)}
        </span>
      ),
    },
    {
      header: "Stock",
      key: "stock",
      sortable: false,
      render: (item) => <StockVariantsDisplay variants={item.variants} />,
    },
    {
      header: "List",
      key: "isListed",
      sortable: true,
      render: (item) => (
        <ListToggleButton
          isListed={item.isListed}
          onClick={() => openModal(item, "toggleList")}
        />
      ),
    },
    {
      header: "Action",
      key: "action",
      sortable: false,
      render: (item) => (
        <ActionIconButtons
          onEdit={() => navigate(`/admin/edit-product/${item.slug}`)}
          onDelete={() => openModal(item, "delete")}
        />
      ),
    },
  ];

  // --- DATA ---
  const products = productData?.data?.products || [];
  const pagination = productData?.data?.pagination;

  // const isSortActive = (field, direction) =>
  //   uiState.sortConfig.field === field &&
  //   uiState.sortConfig.direction === direction;

  // --- RENDER ---
  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      {/* --- Header & Add Button --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Link
          to="/admin/add-product"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* --- Dynamic Table --- */}
      <DynamicTable
        title="Product List" // Optional: Add title back if desired
        columns={productColumns}
        data={products}
        isLoading={isLoadingProducts}
        isError={isErrorProducts}
        error={errorProducts}
        // Pass down state and handlers needed by DynamicTable
        searchValue={uiState.searchTerm} // Pass search term for the input
        onSearchChange={handlers.onSearchChange} // Pass search handler
        sortConfig={uiState.sortConfig}
        onSort={handlers.onSort} // Pass sort handler for header clicks
        pagination={pagination}
        onPageChange={handlers.onPageChange}
        limit={uiState.limit}
        onLimitChange={handlers.onLimitChange}
      />

      {/* --- Confirmation Modal --- */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        isLoading={isTogglingList || isDeleting}
        title={
          modalState.action === "delete"
            ? "Delete Product"
            : modalState.action === "toggleList"
            ? modalState.item?.isListed
              ? "Unlist Product"
              : "List Product"
            : ""
        }
        message={
          modalState.action === "delete"
            ? "Are you sure you want to permanently delete this product? This action cannot be undone."
            : modalState.action === "toggleList"
            ? modalState.item?.isListed
              ? "Are you sure you want to unlist this product? It will no longer be visible to customers."
              : "Do you want to list this product and make it visible to customers?"
            : ""
        }
        confirmButtonText={
          modalState.action === "delete"
            ? "Delete"
            : modalState.item?.isListed
            ? "Unlist"
            : "List"
        }
        confirmButtonVariant={
          modalState.action === "delete" ? "danger" : "primary"
        }
      />
    </div>
  );
};

export default ProductList;
