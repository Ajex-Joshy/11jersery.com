// src/components/common/ImageDropzone.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import ImageCropperModal from "./ImageCropperModal";
import PropTypes from "prop-types";

const ImageDropzone = ({
  onChange,
  value,
  aspect = 16 / 9,
  initialImageUrl,
}) => {
  // Added initialImageUrl prop
  const [uncroppedImage, setUncroppedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (initialImageUrl && !value) {
      setPreview(initialImageUrl);
    } else {
      setPreview(null);
    }
  }, [value, initialImageUrl]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUncroppedImage(reader.result);
        setModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    multiple: false,
  });

  const handleCropComplete = (croppedFile) => {
    onChange(croppedFile);
    setModalOpen(false);
    setUncroppedImage(null);
  };

  const removeImage = (e) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
  };

  if (preview) {
    return (
      <div className="relative w-full h-64 rounded-lg overflow-hidden">
        <img
          src={preview}
          alt="Category preview"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={removeImage}
          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 shadow-md hover:bg-red-700 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        {...getRootProps()}
        className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition ${
          isDragActive
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        {/* ... (Dropzone placeholder UI) ... */}
        <div className="p-4 rounded-full bg-gray-100 mb-4">
          <UploadCloud className="w-10 h-10 text-gray-500" />
        </div>
        <p className="font-semibold text-gray-700">Drag and drop image here</p>
        <p className="text-sm text-gray-500">or click to add image</p>
        <p className="text-xs text-gray-400 mt-2">
          (Supports .png, .jpg, .webp up to 5MB)
        </p>
      </div>

      {modalOpen && (
        <ImageCropperModal
          imageSrc={uncroppedImage}
          onClose={() => setModalOpen(false)}
          onCropComplete={handleCropComplete}
          aspect={aspect}
        />
      )}
    </>
  );
};

ImageDropzone.propTypes = {
  onChange: PropTypes.func.isRequired,

  value: PropTypes.instanceOf(File),

  aspect: PropTypes.number,

  initialImageUrl: PropTypes.string,
};

export default ImageDropzone;
