import React, { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X } from "lucide-react";
import PropTypes from "prop-types";

// --- Utility function to get the cropped file ---
function getCroppedFile(image, crop, fileName) {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], fileName, { type: blob.type });
        resolve(file);
      },
      "image/jpeg",
      0.9
    ); // 90% quality JPEG
  });
}
// --- End Utility ---

const ImageCropperModal = ({
  imageSrc,
  onClose,
  onCropComplete,
  aspect = 16 / 9,
}) => {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    // Center the crop on load
    setCrop(
      centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
        width,
        height
      )
    );
  }

  const handleCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsLoading(true);
    try {
      const croppedFile = await getCroppedFile(
        imgRef.current,
        completedCrop,
        "cropped-category-image.jpg"
      );
      onCropComplete(croppedFile);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Crop Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (The Cropper) */}
        <div className="p-4 bg-gray-100">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imageSrc}
                onLoad={onImageLoad}
                className="max-h-[70vh] object-contain"
              />
            </ReactCrop>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white rounded-md bg-black hover:bg-gray-800 disabled:bg-gray-400"
          >
            {isLoading ? "Cropping..." : "Save Crop"}
          </button>
        </div>
      </div>
    </div>
  );
};
ImageCropperModal.propTypes = {
  imageSrc: PropTypes.string.isRequired,

  onClose: PropTypes.func.isRequired,

  onCropComplete: PropTypes.func.isRequired,

  aspect: PropTypes.number,
};
export default ImageCropperModal;
