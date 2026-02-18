import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

interface CategoryFilterProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Get all categories with "Semua" at the beginning
  const allCategories = [
    { id: 'all', name: 'Semua', subcategories: [] },
    ...CATEGORIES.map(cat => ({ id: cat.id, name: cat.name, subcategories: cat.subcategories }))
  ];

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        ref.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    if (categoryId === 'all') {
      setSelectedMainCategory(null);
      onCategoryChange(null);
    } else {
      setSelectedMainCategory(categoryId);
      // Auto-select first subcategory or clear
      onCategoryChange(categoryName);
    }
  };

  const clearFilter = () => {
    setSelectedMainCategory(null);
    onCategoryChange(null);
  };

  const selectedCategoryData = selectedMainCategory 
    ? CATEGORIES.find(cat => cat.id === selectedMainCategory)
    : null;

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border-b sticky top-[60px] sm:top-[64px] z-30 shadow-sm">
      <div className="px-4 sm:px-8 py-4 space-y-4">
        {/* Main Categories - Horizontal Scroll */}
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background shadow-md flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Category Pills */}
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id, cat.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedMainCategory === cat.id || (cat.id === 'all' && !selectedMainCategory)
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-accent/50 text-accent-foreground hover:bg-accent hover:scale-105'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background shadow-md flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Subcategories - Only show when main category selected */}
        {selectedMainCategory && selectedCategoryData && (
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {selectedCategoryData.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => onCategoryChange(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === sub
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary border-2 border-transparent'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Active Filter Display */}
        {activeCategory && activeCategory !== "Semua" && (
          <div className="flex items-center justify-between px-3 py-2 bg-primary/10 rounded-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter:</span>
              <span className="text-sm font-semibold text-primary">{activeCategory}</span>
            </div>
            <button
              onClick={clearFilter}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-primary/20 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Hapus</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
