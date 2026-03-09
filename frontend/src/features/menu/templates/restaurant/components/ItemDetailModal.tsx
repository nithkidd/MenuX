import { useRef, useEffect, useState } from "react";
import { X, Leaf, Flame, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import ReactDOM from "react-dom";
import type { Item } from "../../../services/menu.service";
import { getFontClass } from "../../../../../shared/utils/text-utils";
import { FacebookIcon, TelegramIcon, TikTokIcon, GoogleMapsIcon, PhoneIconRed } from "../../../../../shared/components/BrandIcons";

import type { Business } from "../../../../business/services/business.service";

interface ItemDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  currentLang: "en" | "km";
  exchangeRate?: number;
  business?: Business;
}

export function ItemDetailModal({
  item,
  isOpen,
  onClose,
  currentLang,
  exchangeRate = 4000,
  business,
}: ItemDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isSwipingRef = useRef(false);

  // Reset Carousel when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIdx(0);
    }
  }, [isOpen, item?.id]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scrolling background
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const displayName =
    currentLang === "km" && item.name_km ? item.name_km : item.name;
  const fontClass = getFontClass(
    displayName,
    currentLang === "km" ? "font-khmer" : "font-english",
  );

  // Currency Formatting (Reused logic)
  const formatPrice = (price: number) => {
    const numPrice = typeof price === "number" ? price : Number(price);
    if (isNaN(numPrice)) return "";

    if (currentLang === "km") {
      const khrPrice = Math.round((numPrice * exchangeRate) / 100) * 100;
      return `${khrPrice.toLocaleString()} ៛`;
    }
    return `$${numPrice.toFixed(2)}`;
  };

  const images = (item.image_urls && item.image_urls.length > 0) ? item.image_urls : (item.image_url ? [item.image_url] : []);
  
  const hasDiscount = item.original_price && item.original_price > item.price;
  const discountPercent = hasDiscount 
    ? Math.round(((item.original_price! - item.price) / item.original_price!) * 100) 
    : 0;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    isSwipingRef.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    isSwipingRef.current = true;
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  const handleImageClick = () => {
    if (isSwipingRef.current) return;
    setIsPreviewOpen(true);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
      >
        {/* Close Button - absolute positioned */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Hero Image / Carousel */}
        <div 
          className="relative w-full aspect-square bg-stone-100 shrink-0 group cursor-pointer select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={handleImageClick}
        >
          {images.length > 0 ? (
            <>
              <img
                key={currentImageIdx}
                src={images[currentImageIdx]}
                alt={displayName}
                className="w-full h-full object-cover transition-opacity duration-300 pointer-events-none bg-stone-100 animate-fade-in"
              />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all shadow-md">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all shadow-md">
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(idx); }}
                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIdx ? 'bg-white' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <ImageIcon size={48} />
            </div>
          )}

          {/* Top-Left Badges Overlay (Hot / Discount) */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
            {item.is_hot && (
                <span className="bg-[#fe3b58] text-white text-[11px] font-black tracking-wider px-2.5 py-1 rounded shadow-md border border-white/20">
                    POPULAR
                </span>
            )}
            {hasDiscount && (
                <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                    {discountPercent}% OFF
                </span>
            )}
          </div>
          
          {/* Bottom Badges Overlay */}
          <div className="absolute bottom-3 left-3 flex gap-2 z-10">
            {item.is_vegetarian && (
              <span className="bg-green-100/90 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm">
                <Leaf size={12} fill="currentColor" /> Vegetarian
              </span>
            )}
            {item.is_spicy && (
              <span className="bg-red-100/90 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm">
                <Flame size={12} fill="currentColor" /> Spicy
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div>
              <h2 className={`text-xl font-bold text-stone-900 leading-tight ${fontClass}`}>
                {displayName}
              </h2>
              {item.sku && (
                <p className="text-xs font-mono text-stone-400 mt-1">{item.sku}</p>
              )}
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div
                className={`text-lg font-bold px-3 py-1 rounded-lg bg-stone-100 whitespace-nowrap ${currentLang === "km" ? "font-khmer" : ""}`}
                style={{ color: "var(--primary)" }}
              >
                {formatPrice(item.price)}
              </div>
              {hasDiscount && (
                <span className={`text-sm text-stone-400 line-through mt-1 mr-1 ${currentLang === 'km' ? 'font-khmer' : ''}`}>
                  {formatPrice(item.original_price!)}
                </span>
              )}
            </div>
          </div>

          <div className="prose prose-stone prose-sm max-w-none">
            {item.description ? (
              <p className={`whitespace-pre-wrap text-stone-600 leading-relaxed text-sm ${getFontClass(item.description, currentLang === 'km' ? 'font-khmer' : 'font-english')}`}>
                {item.description}
              </p>
            ) : (
              <p className="italic text-stone-400 text-sm">
                No description available.
              </p>
            )}
          </div>

          {!item.is_available && (
            <div className="mt-6 p-3 bg-stone-100 rounded-xl text-center text-stone-500 font-medium text-sm border border-stone-200">
              Currently Unavailable
            </div>
          )}

          {/* Social Share / Contact Action Bar */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {business?.social_links?.facebook && (
                  <a href={business.social_links.facebook.startsWith('http') ? business.social_links.facebook : `https://facebook.com/${business.social_links.facebook}`} target="_blank" rel="noopener noreferrer" title="Facebook" className="drop-shadow-sm">
                    <FacebookIcon size={32} />
                  </a>
              )}
              {business?.social_links?.telegram && (
                  <a href={business.social_links.telegram.startsWith('http') ? business.social_links.telegram : `https://t.me/${business.social_links.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" title="Telegram" className="drop-shadow-sm">
                    <TelegramIcon size={32} />
                  </a>
              )}
              {business?.social_links?.tiktok && (
                  <a href={business.social_links.tiktok.startsWith('http') ? business.social_links.tiktok : `https://tiktok.com/@${business.social_links.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" title="TikTok" className="drop-shadow-sm">
                    <TikTokIcon size={32} />
                  </a>
              )}
              {business?.address && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`} target="_blank" rel="noopener noreferrer" title="View on Map" className="drop-shadow-sm">
                    <GoogleMapsIcon size={32} />
                  </a>
              )}
            </div>
            {business?.contact_phone && (
                <a href={`tel:${business.contact_phone}`} className="flex items-center gap-2 font-bold text-[#F43F5E] bg-rose-50 px-3 py-1.5 rounded-full text-lg sm:text-base cursor-pointer w-fit">
                  <PhoneIconRed size={20} />
                  {business.contact_phone}
                </a>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen Image Preview Overlay */}
      {isPreviewOpen && images.length > 0 && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in" 
          onClick={() => setIsPreviewOpen(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(false); }}
            className="absolute top-4 right-4 z-[210] p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            title="Close Preview"
          >
            <X size={24} />
          </button>
          
          <img 
            key={`preview-${currentImageIdx}`}
            src={images[currentImageIdx]} 
            className="max-w-full max-h-[90vh] object-contain pointer-events-none select-none animate-scale-up" 
            alt="Preview full screen" 
          />
          
          {images.length > 1 && (
            <>
               <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-[210]">
                  <ChevronLeft size={24} />
               </button>
               <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-[210]">
                  <ChevronRight size={24} />
               </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
