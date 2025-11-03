// src/components/common/AdvancedImageDropzone.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Star, Crop } from "lucide-react";
import ImageCropperModal from "./ImageCropperModal"; // Assuming path is correct
import toast from "react-hot-toast"; // Import toast for re-crop warning

const ProductImageDropzone = ({
  onChangeFiles,
  valueFiles = [], // New files added by user
  onChangeCoverIndex,
  valueCoverIndex = 0,
  initialImageUrls = [], // Existing image URLs
  onRemoveInitialImage, // Callback to notify parent about removed initial images
  label = "Upload Product Images",
  error,
  aspect = 1 / 1,
}) => {
  // Combined state for display: { type: 'initial'|'new', source: string|File, previewUrl: string }
  const [cropModalState, setCropModalState] = useState({
    isOpen: false,
    imageSrc: null,
    originalFile: null,
    editIndex: null,
  });
  // --- Compute Combined Display Items ---
  const displayItems = [
    ...initialImageUrls.map((url) => ({
      type: "initial",
      source: url,
      previewUrl: url,
    })),
    ...valueFiles.map((file) => ({
      type: "new",
      source: file,
      previewUrl: URL.createObjectURL(file),
    })),
  ];

  useEffect(() => {
    return () => {
      valueFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
      });
    };
  }, [valueFiles]);

  // Handle Dropped Files -> Open Cropper
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropModalState({
          isOpen: true,
          imageSrc: reader.result,
          originalFile: file,
          editIndex: null,
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    multiple: false, // Dropzone accepts one, component manages array
  });

  // Handle Crop Completion -> Add/Update Cropped File
  const handleCropComplete = (croppedFile) => {
    let updatedFiles;
    const editIndex = cropModalState.editIndex;

    if (editIndex !== null && editIndex >= initialImageUrls.length) {
      // Re-cropping a 'new' file
      const newFileIndex = editIndex - initialImageUrls.length;
      updatedFiles = [...valueFiles];
      updatedFiles[newFileIndex] = croppedFile;
    } else if (editIndex === null) {
      // Adding a new file
      updatedFiles = [...valueFiles, croppedFile];
      if (updatedFiles.length === 1 && initialImageUrls.length === 0) {
        onChangeCoverIndex(0);
      }
    } else {
      // Re-cropping 'initial' image - add as new file for simplicity
      toast.info("Re-cropped existing image added as a new image.");
      updatedFiles = [...valueFiles, croppedFile];
      if (updatedFiles.length === 1 && initialImageUrls.length === 0) {
        onChangeCoverIndex(0);
      }
    }

    onChangeFiles(updatedFiles); // Update RHF 'images' array (only new Files)
    setCropModalState({
      isOpen: false,
      imageSrc: null,
      originalFile: null,
      editIndex: null,
    });
  };

  // --- Updated Remove Logic ---
  const removeImage = (indexToRemove, e) => {
    e.stopPropagation();
    const itemToRemove = displayItems[indexToRemove];

    if (itemToRemove.type === "initial") {
      // Callback for initial image removal
      onRemoveInitialImage(itemToRemove.source);
    } else if (itemToRemove.type === "new") {
      // Filter out new file
      const newFileIndex = indexToRemove - initialImageUrls.length;
      const updatedFiles = valueFiles.filter(
        (_, index) => index !== newFileIndex
      );
      onChangeFiles(updatedFiles);
    }

    // Adjust cover index
    if (valueCoverIndex === indexToRemove) {
      onChangeCoverIndex(0);
    } else if (valueCoverIndex > indexToRemove) {
      onChangeCoverIndex(valueCoverIndex - 1);
    }
  };

  // Set Cover Image (index is based on combined displayItems)
  const setCoverImage = (index, e) => {
    e.stopPropagation();
    onChangeCoverIndex(index);
  };

  // Open Cropper for re-cropping 'new' files
  const openRecropModal = (index, e) => {
    e.stopPropagation();
    const itemToRecrop = displayItems[index];

    if (itemToRecrop.type === "new") {
      const fileToRecrop = itemToRecrop.source;
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropModalState({
          isOpen: true,
          imageSrc: reader.result,
          originalFile: fileToRecrop,
          editIndex: index,
        });
      };
      reader.readAsDataURL(fileToRecrop);
    } else {
      toast.info(
        "To re-crop an existing image, please remove it and upload the new version."
      );
      console.warn(
        "Re-cropping initial images directly from URL is not implemented."
      );
    }
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* --- Dropzone Area --- */}
      <div
        {...getRootProps()}
        className={`w-full min-h-[150px] p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition mb-4 ${
          isDragActive
            ? "border-green-500 bg-green-50"
            : error
            ? "border-red-500 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <div className="p-3 rounded-full bg-gray-100 mb-3">
          <UploadCloud className="w-8 h-8 text-gray-500" />
        </div>
        {isDragActive ? (
          <p className="font-semibold text-green-700">Drop an image here ...</p>
        ) : (
          <>
            <p className="font-semibold text-gray-700">
              Drag & drop image or click
            </p>
            <p className="text-xs text-gray-400 mt-1">
              (Crop will open after selection)
            </p>
            <p className="text-xs text-gray-400 mt-2">
              ({displayItems.length} files added, Max 5MB each)
            </p>
          </>
        )}
      </div>

      {/* --- Previews Area --- */}
      {displayItems.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 gap-3">
          {displayItems.map((item, index) => (
            <div
              key={item.type + "-" + index} // Use a more unique key
              className="relative aspect-square rounded-md overflow-hidden border border-gray-200 shadow-sm group w-30"
            >
              <img
                src={item.previewUrl}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* --- Overlay & Actions --- */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 p-1">
                {/* Set Cover Button */}
                {/* <button
                  type="button"
                  onClick={(e) => setCoverImage(index, e)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
                                        ${
                                          valueCoverIndex === index
                                            ? "bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200"
                                            : "bg-white/80 text-gray-700 hover:bg-white hover:text-black"
                                        }`}
                  aria-label={
                    valueCoverIndex === index
                      ? "Cover Image (Selected)"
                      : "Set as Cover Image"
                  }
                  title={
                    valueCoverIndex === index
                      ? "Current Cover Image"
                      : "Set as Cover Image"
                  }
                >
                  <Star
                    className="w-5 h-5 pointer-events-none"
                    fill={valueCoverIndex === index ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                </button> */}

                {/* Re-crop Button */}
                <button
                  type="button"
                  onClick={(e) => openRecropModal(index, e)}
                  disabled={item.type === "initial"}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 text-gray-700 shadow-lg hover:bg-white hover:text-black transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Edit/Re-crop Image"
                  title={
                    item.type === "initial"
                      ? "Remove and re-upload to crop"
                      : "Edit / Re-crop Image"
                  }
                >
                  <Crop className="w-5 h-5 pointer-events-none" />
                </button>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => removeImage(index, e)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  aria-label={`Remove image ${index + 1}`}
                  title="Remove Image"
                >
                  <X className="w-5 h-5 pointer-events-none" />
                </button>
              </div>
              {/* --- Cover Image Badge --- */}
              {valueCoverIndex === index && (
                <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold z-10 pointer-events-none">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Display RHF/Zod error */}
      {error && (
        <span className="text-red-500 text-sm mt-2 block">{error}</span>
      )}

      {/* Cropper Modal */}
      {cropModalState.isOpen && (
        <ImageCropperModal
          imageSrc={cropModalState.imageSrc}
          onClose={() =>
            setCropModalState({
              isOpen: false,
              imageSrc: null,
              originalFile: null,
              editIndex: null,
            })
          }
          onCropComplete={handleCropComplete}
          aspect={aspect}
          // Pass originalFile if needed by cropper for context
          // originalFile={cropModalState.originalFile}
        />
      )}
    </div>
  );
};

export default ProductImageDropzone; // Changed name back for consistency if needed
