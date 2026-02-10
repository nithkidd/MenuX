import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { publicMenuService, type PublicMenuData } from '../services/public-menu.service';
import { MenuTemplateSelector } from '../components/MenuTemplateSelector';
import { Search, X } from 'lucide-react'; 

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Ref to track if we are currently scrolling automatically (clicking a tab)
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (slug) loadMenu();
  }, [slug]);

  // Scrollspy Effect
  useEffect(() => {
    const handleScroll = () => {
        if (isScrollingRef.current) return;

        const categories = document.querySelectorAll('[id^="category-"]');
        const headerOffset = 180; // Adjust based on header height + padding

        let currentActive = 'all';
        
        // If at very top, 'all' is usually safe default or first category
        if (window.scrollY < 100) {
            setActiveCategory('all');
            return;
        }

        // Find the category currently in view
        categories.forEach((cat) => {
            const rect = cat.getBoundingClientRect();
            // Check if top of section is near the header offset
            // We consider it active if its top is near the header, or if we're inside it
            if (rect.top <= headerOffset + 50 && rect.bottom >= headerOffset) {
                currentActive = cat.id.replace('category-', '');
            }
        });

        if (currentActive !== activeCategory) {
            setActiveCategory(currentActive);
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  const loadMenu = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const menuData = await publicMenuService.getMenuBySlug(slug);
      setData(menuData);
    } catch (err) {
      setError('Failed to load menu. It might not exist.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="light min-h-screen bg-white pb-20">
        {/* Skeleton Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
                <div className="py-2 overflow-hidden">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-9 w-24 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Skeleton Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="rounded-2xl bg-gray-200 h-48 sm:h-64 animate-pulse" />
        </div>

        {/* Skeleton Categories & Items */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {[1, 2].map(cat => (
                <div key={cat} className="space-y-6">
                     <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4].map(item => (
                            <div key={item} className="h-32 rounded-2xl border border-gray-100 bg-white p-4 flex gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                                </div>
                                <div className="w-24 h-24 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                            </div>
                        ))}
                     </div>
                </div>
            ))}
        </div>
    </div>
  );
  
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col p-4">
        <p className="text-red-500 font-medium">{error || 'Menu not found'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-stone-500 underline text-sm">Retry</button>
    </div>
  );

  const { business, categories } = data;
  const nonEmptyCategories = categories.filter(c => c.items && c.items.length > 0);

  const scrollToCategory = (catId: string) => {
    isScrollingRef.current = true;
    setActiveCategory(catId);
    
    if (catId === 'all') {
         window.scrollTo({ top: 0, behavior: 'smooth' });
         setTimeout(() => { isScrollingRef.current = false; }, 800);
         return;
    }
    const el = document.getElementById(`category-${catId}`);
    if (el) {
        // Offset for sticky header
        const y = el.getBoundingClientRect().top + window.scrollY - 180;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setTimeout(() => { isScrollingRef.current = false; }, 800);
    } else {
        isScrollingRef.current = false;
    }
  };

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className="light min-h-screen bg-white pb-20 text-stone-900">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between gap-4">
                {/* Search Mode */}
                {isSearchOpen ? (
                    <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Search size={18} className="text-gray-400 flex-shrink-0" />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Search menu items..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none text-gray-900 text-lg placeholder-gray-400 focus:ring-0 outline-none h-full"
                        />
                        <button 
                            onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                            }}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    /* Default Mode */
                    <>
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                            {/* Logo */}
                            {business.logo_url ? (
                                <img src={business.logo_url} alt={business.name} className="h-10 w-10 rounded-full object-cover shadow-sm flex-shrink-0" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl flex-shrink-0">
                                    {business.name.charAt(0)}
                                </div>
                            )}
                            <h1 className="text-xl font-bold text-gray-900 truncate">{business.name}</h1>
                        </div>

                        {/* Search Icon */}
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
                        >
                            <Search size={22} strokeWidth={2} />
                        </button>
                    </>
                )}
            </div>
            
            {/* Category Navigation (Scrollable & Sticky) */}
            <div className="py-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-2 min-w-max">
                    <button 
                        onClick={() => scrollToCategory('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                            activeCategory === 'all' 
                            ? 'bg-stone-900 text-white shadow-md transform scale-105' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        All Menu
                    </button>
                    {nonEmptyCategories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => scrollToCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                                activeCategory === cat.id 
                                ? 'bg-stone-900 text-white shadow-md transform scale-105' 
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </header>

      {/* Hero / Banner Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 h-48 sm:h-64 flex items-center justify-center text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-900 to-stone-900 opacity-90"></div>
            <div className="relative z-10 px-6 max-w-2xl">
                 <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
                    {business.name}
                 </h2>
                 {business.description && (
                    <p className="text-orange-100 text-lg sm:text-lg opacity-90">
                        {business.description}
                    </p>
                 )}
            </div>
        </div>
      </div>

      {/* Dynamic Menu Template */}
      <MenuTemplateSelector 
        data={{
            business: data.business,
            categories: data.categories.map(cat => ({
                ...cat,
                items: cat.items?.filter(item => {
                    if (!searchQuery) return true;
                    // Simple case-insensitive search
                    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
                })
            })).filter(cat => cat.items && cat.items.length > 0)
        }} 
      />
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Brand & Description */}
                <div>
                     <h3 className="text-lg font-bold text-gray-900 mb-2">{business.name}</h3>
                     {business.description && (
                        <p className="text-gray-500 text-sm">{business.description}</p>
                     )}
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact</h4>
                    <div className="space-y-3 text-sm text-gray-500">
                        {business.address && (
                            <div className="flex items-start gap-2">
                                <span className="font-medium text-gray-900">Address:</span> 
                                {business.address}
                            </div>
                        )}
                        {business.contact_phone && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">Phone:</span> 
                                <a href={`tel:${business.contact_phone}`} className="hover:text-orange-600 transition-colors">
                                    {business.contact_phone}
                                </a>
                            </div>
                        )}
                        {business.contact_email && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">Email:</span> 
                                <a href={`mailto:${business.contact_email}`} className="hover:text-orange-600 transition-colors">
                                    {business.contact_email}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Opening Hours & Social */}
                <div>
                     {business.opening_hours && Object.keys(business.opening_hours).length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Opening Hours</h4>
                            {/* Basic placeholder for now as structure is generic JSON */}
                            <p className="text-sm text-gray-500">Check our social media for daily updates.</p>
                        </div>
                     )}
                     
                     {business.social_links && Object.keys(business.social_links).length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Follow Us</h4>
                            <div className="flex gap-4">
                                {business.social_links.facebook && (
                                    <a href={ensureAbsoluteUrl(business.social_links.facebook)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                        Facebook
                                    </a>
                                )}
                                {business.social_links.instagram && (
                                    <a href={ensureAbsoluteUrl(business.social_links.instagram)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                                        Instagram
                                    </a>
                                )}
                                {business.social_links.twitter && (
                                    <a href={ensureAbsoluteUrl(business.social_links.twitter)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                                        Twitter
                                    </a>
                                )}
                                {business.website_url && (
                                    <a href={ensureAbsoluteUrl(business.website_url)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-stone-900 transition-colors">
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>
                     )}
                </div>
            </div>
            
            <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} {business.name}. Powered by Menux.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
