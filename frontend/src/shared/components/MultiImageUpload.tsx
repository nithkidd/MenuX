import { useState, useRef, type ChangeEvent } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { menuService } from '../../features/menu/services/menu.service';

interface MultiImageUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  maxIter?: number;
}

export default function MultiImageUpload({ urls, onChange, maxIter = 5 }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    const newUrls = [...urls];
    
    // Process files sequentially or Promise.all
    try {
      const uploadPromises = Array.from(e.target.files).map(file => menuService.uploadImage(file));
      const uploaded = await Promise.all(uploadPromises);
      
      for (const url of uploaded) {
        if (newUrls.length < maxIter) {
          newUrls.push(url);
        }
      }
      onChange(newUrls);
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload some images. Please check size limits (10MB).');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idxToRemove: number) => {
    onChange(urls.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {urls.map((url, idx) => (
          <div key={idx} className="relative group rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 aspect-square">
            <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm btn-press"
            >
              <X size={14} />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-stone-900/70 text-white text-[10px] font-bold rounded-md backdrop-blur-sm">
                PRIMARY
              </span>
            )}
          </div>
        ))}
        
        {urls.length < maxIter && (
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4 aspect-square transition-colors hover:bg-stone-100 dark:hover:bg-stone-900 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isUploading ? (
               <Loader2 className="w-6 h-6 animate-spin text-orange-600 mb-2" />
            ) : (
               <div className="bg-white dark:bg-stone-800 p-2 rounded-full mb-2 shadow-sm text-stone-400">
                 <ImagePlus size={20} />
               </div>
            )}
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-1">
              {isUploading ? 'Uploading...' : `Add Photo (${urls.length}/${maxIter})`}
            </span>
          </div>
        )}
      </div>
      <input
        type="file"
        multiple
        accept="image/jpeg, image/png, image/webp"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
