import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, User, Trash2 } from "lucide-react";
import { S3_URL } from "../../utils/constants";
import toast from "react-hot-toast";
import { useCallback } from "react";

const AvatarUploader = ({ value, onChange, initialImageUrl }) => {
  const [preview, setPreview] = useState(null);

  const getFullUrl = (imageId) => {
    if (!imageId) return null;
    if (imageId.startsWith("http")) return imageId;
    return `${S3_URL}/images/${imageId}`;
  };

  useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (initialImageUrl) {
      setPreview(getFullUrl(initialImageUrl));
    } else {
      setPreview(null);
    }
  }, [value, initialImageUrl]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]); // Set the File object in RHF
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    multiple: false,
    maxSize: 2 * 1024 * 1024, // 2MB
    onDropRejected: (files) => {
      toast.error(files[0].errors[0].message || "Invalid file");
    },
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null); // Clear the file in RHF
    setPreview(null); // Clear the preview
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        {...getRootProps()}
        className={`relative w-24 h-24 rounded-full cursor-pointer group ${
          isDragActive ? "ring-2 ring-blue-500" : ""
        }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.style.display = "none";
            }} // Hide broken image
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <input {...getInputProps()} />
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => getRootProps().onClick()} // Manually trigger dropzone
          className="text-xs font-semibold text-white bg-green-600 px-3 py-1 rounded-md hover:bg-green-700"
        >
          Upload New
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-semibold text-gray-700 hover:text-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default AvatarUploader;
