import React, { useState } from "react";
import {
  useCategories,
  useToggleCategoryList,
  useDeleteCategory,
} from "./categoryHooks";
import DynamicTable from "../../../components/admin/DynamicTable";
import { Plus, Image } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { S3_URL } from "../../../utils/constants.js";
import { useTableParams } from "../../../hooks/useTableParams.jsx";
import {
  ListToggleButton,
  ActionIconButtons,
} from "../../../components/admin/UiElements.jsx";
import ConfirmationModal from "../../../components/common/ConfirmationModal.jsx";

const DiscoverCard = ({ data }) => (
  <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
      {data?.imageId ? (
        <img
          src={`${S3_URL}/categories/${data.imageId}`}
          alt={data.title}
          className="w-16 h-16 object-cover rounded-md"
        />
      ) : (
        <Image className="w-8 h-8 text-gray-400" /> // fallback icon
      )}
    </div>
    <h3 className="font-semibold text-gray-900">{data?.title}</h3>
  </div>
);

const CategoryManagement = () => {
  const navigate = useNavigate();
  const { queryParams, uiState, handlers } = useTableParams({
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    item: null,
    action: null,
  });

  const {
    data: categoryData,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    error: errorCategories,
  } = useCategories(queryParams);

  const { mutate: toggleList, isLoading: isTogglingList } =
    useToggleCategoryList();
  const { mutate: deleteCat, isLoading: isDeleting } = useDeleteCategory();

  // --- MODAL HANDLERS ---
  const openModal = (item, action) => {
    setModalState({ isOpen: true, item, action });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, item: null, action: null });
  };

  const handleConfirm = () => {
    const { item, action } = modalState;
    if (!item) return;

    if (action === "toggleList") {
      toggleList(
        { categoryId: item._id, isListed: !item.isListed },
        { onSettled: closeModal } // Close modal when mutation finishes
      );
    } else if (action === "delete") {
      deleteCat(item._id, { onSettled: closeModal });
    }
  };

  // --- COLUMN DEFINITIONS  ---
  const categoryColumns = [
    {
      header: "SNO",
      key: "sno",
      sortable: false,
      render: (_, index) => (
        <span className="font-medium text-gray-900">
          {/* Calculate index based on pagination */}
          {(queryParams.page - 1) * queryParams.limit + index + 1}
        </span>
      ),
    },
    {
      header: "Category Name",
      key: "title", // Matches API `sortBy` value
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900">{item.title}</span>
      ),
    },
    {
      header: "Stock",
      key: "totalStock", // Assuming API supports sorting by this
      sortable: true,
      render: (item) => (
        <span className="text-gray-700">{item.totalStock}</span>
      ),
    },
    {
      header: "Date Added",
      key: "createdAt", // Matches API `sortBy` value
      sortable: true,
      render: (item) => (
        <span className="text-gray-700">
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "List / Unlist",
      key: "list",
      sortable: false, // Usually not sortable
      render: (item) => (
        <ListToggleButton
          isListed={item.isListed}
          // Open modal on click, pass item and action type
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
          onEdit={() => navigate(`/admin/edit-category/${item.slug}`)}
          // Open delete confirmation modal
          onDelete={() => openModal(item, "delete")}
        />
      ),
    },
    {
      header: "Offer %",
      key: "discount", // Assuming API supports sorting
      sortable: true,
      render: (item) => <span className="text-gray-700">{item.discount}</span>,
    },
    {
      header: "Max Reedmable",
      key: "maxReedemable", // Assuming API supports sorting
      sortable: true,
      render: (item) => (
        <span className="text-gray-700">{item.maxReedemable}</span>
      ),
    },
  ];
  // --- DATA ---
  const categories = categoryData?.data?.categories || [];
  const pagination = categoryData?.data?.pagination;
  const discoverCategories = categories.filter(
    (cat) => cat.inHome || cat.inCollections
  );

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      {/* --- Page Header --- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <Link
          to="/admin/add-category"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      {/* --- Discover Section --- */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Discover</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {categories.map((cat) => (
          <DiscoverCard key={cat._id} data={cat} />
        ))}
      </div>

      {/* --- Dynamic Table --- */}
      <DynamicTable
        title="Category List"
        columns={categoryColumns}
        data={categories}
        isLoading={isLoadingCategories}
        isError={isErrorCategories}
        error={errorCategories}
        // Pass down state and handlers from useTableParams
        searchValue={uiState.searchTerm}
        status={uiState.status}
        limit={uiState.limit}
        sortConfig={uiState.sortConfig}
        onSearchChange={handlers.onSearchChange}
        onStatusChange={handlers.onStatusChange}
        onLimitChange={handlers.onLimitChange}
        onSort={handlers.onSort}
        pagination={pagination}
        onPageChange={handlers.onPageChange}
      />

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        isLoading={isTogglingList || isDeleting} // Show loading for either mutation
        title={
          modalState.action === "delete"
            ? "Delete Category?"
            : modalState.item?.isListed
            ? "Unlist Category?"
            : "List Category?"
        }
        message={`Are you sure you want to ${
          modalState.action === "delete"
            ? `delete the category "${modalState.item?.title}"? This cannot be undone.`
            : modalState.item?.isListed
            ? `unlist the category "${modalState.item?.title}"?`
            : `list the category "${modalState.item?.title}"?`
        }`}
        confirmButtonText={
          modalState.action === "delete"
            ? "Yes, Delete"
            : modalState.item?.isListed
            ? "Yes, Unlist"
            : "Yes, List"
        }
        confirmButtonVariant={
          modalState.action === "delete" ? "danger" : "primary" // Use danger variant for delete
        }
      />
    </div>
  );
};

export default CategoryManagement;
