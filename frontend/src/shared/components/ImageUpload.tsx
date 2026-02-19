import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ChangeEvent,
  type MouseEvent,
  type FC,
} from "react";
import {
  ImagePlus,
  X,
  Loader2,
  ZoomIn,
  ZoomOut,
  Check,
  Link,
  FileUp,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { menuService } from "../../features/menu/services/menu.service";
import getCroppedImg from "../utils/cropImage";
import type { Area } from "react-easy-crop";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  initialUrl?: string | null;
  className?: string;
  onError?: (message: string) => void;
  aspectRatio?: number; // e.g., 1 for square, 16/9 for wide
}

export const ImageUpload: FC<ImageUploadProps> = ({
  onUpload,
  onRemove,
  initialUrl,
  className = "",
  onError,
  aspectRatio,
}) => {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sync preview with initialUrl when it changes (e.g. after data load)
  useEffect(() => {
    setPreview(initialUrl || null);
  }, [initialUrl]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"upload" | "link">("upload");
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Cropping state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    // Basic validation
    if (!file.type.startsWith("image/")) {
      const msg = "Please upload an image file";
      onError ? onError(msg) : alert(msg);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // Increased limit for raw upload
      const msg = "File size must be less than 10MB";
      onError ? onError(msg) : alert(msg);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result?.toString() || null);
      setIsCropping(true);
    });
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (!croppedBlob) {
        throw new Error("Failed to create cropped image");
      }

      // Create a File object from the Blob
      const file = new File([croppedBlob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      // Create local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Close cropper
      setIsCropping(false);
      setImageSrc(null);

      // Upload to server
      const url = await menuService.uploadImage(file);
      onUpload(url);
    } catch (error) {
      console.error("Upload failed:", error);
      const msg = "Failed to upload image. Please try again.";
      onError ? onError(msg) : alert(msg);
      setPreview(initialUrl || null);
      setIsCropping(false);
      setImageSrc(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrlInput.trim()) return;

    // Basic URL validation
    try {
      new URL(imageUrlInput);
    } catch (_) {
      const msg = "Please enter a valid URL";
      onError ? onError(msg) : alert(msg);
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrl = await menuService.uploadImageFromUrl(imageUrlInput);
      setPreview(uploadedUrl);
      onUpload(uploadedUrl);
      setImageUrlInput("");
    } catch (error) {
      console.error("URL upload failed:", error);
      const msg = "Failed to upload image from URL. Please try again.";
      onError ? onError(msg) : alert(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (
      activeTab === "upload" &&
      e.dataTransfer.files &&
      e.dataTransfer.files[0]
    ) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    // Reset value to allow selecting same file again
    e.target.value = "";
  };

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
    setPreview(null);
    onUpload("");
  };

  // If crop mode is active, show the cropper modal/overlay
  if (isCropping && imageSrc) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">
              Adjust Image
            </h3>
            <button
              onClick={() => {
                setIsCropping(false);
                setImageSrc(null);
              }}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="relative h-64 sm:h-96 w-full bg-stone-950">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio || 4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-4">
              <ZoomOut size={20} className="text-stone-500" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <ZoomIn size={20} className="text-stone-500" />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCropping(false);
                  setImageSrc(null);
                }}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadCroppedImage}
                disabled={isUploading}
                className="flex items-center px-6 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all btn-press disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Save & Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview Mode (Image already set)
  if (preview) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative w-full h-48 rounded-xl overflow-hidden group border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 btn-press transform hover:scale-105 transition-transform"
            >
              <X size={20} />
            </button>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none">
            Click X to Replace
          </div>
        </div>
      </div>
    );
  }

  // Upload / Link Input Mode
  return (
    <div className={`w-full ${className}`}>
      {/* Tabs */}
      <div className="flex gap-4 mb-2 border-b border-stone-100 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "upload"
              ? "text-orange-600 border-orange-600"
              : "text-stone-500 border-transparent hover:text-stone-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileUp size={16} />
            Upload File
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("link")}
          className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "link"
              ? "text-orange-600 border-orange-600"
              : "text-stone-500 border-transparent hover:text-stone-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Link size={16} />
            Paste URL
          </div>
        </button>
      </div>

      {activeTab === "upload" ? (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-full h-40 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group flex flex-col items-center justify-center
            ${
              isDragOver
                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-900"
            }
            `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept="image/*"
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin mb-2" />
              <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
                Uploading...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 p-4 text-center">
              <div
                className={`
                p-3 rounded-full mb-3 transition-colors
                ${isDragOver ? "bg-orange-100 text-orange-600" : "bg-white dark:bg-stone-800 shadow-sm"}
                `}
              >
                <ImagePlus size={24} />
              </div>
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                {isDragOver
                  ? "Drop image here"
                  : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs mt-1 opacity-70">
                SVG, PNG, JPG or GIF (max. 10MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="h-40 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 p-4 flex flex-col justify-center gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
              Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="w-full rounded-lg border-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-white text-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!imageUrlInput.trim()}
            className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use Image
          </button>
        </div>
      )}
    </div>
  );
};
