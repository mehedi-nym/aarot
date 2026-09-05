function CategoryTabs({ categories, activeCategory, onChange }) {
  return (
    <div className="w-full lg:w-auto">
      <div className="mb-2 flex items-center justify-between sm:hidden">
        <span className="text-xs font-black text-slate-500">ক্যাটাগরি</span>
        <span className="text-[10px] font-bold text-brand-600">পাশে স্লাইড করুন →</span>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute bottom-2 right-0 top-0 z-10 w-10 bg-gradient-to-l from-[#FDFDFD] to-transparent sm:hidden" />
        <div className="flex gap-2 overflow-x-auto pb-2 pr-8 sm:gap-3 sm:pr-0">
          <button
            type="button"
            onClick={() => onChange('all')}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition sm:px-5 ${
              activeCategory === 'all'
                ? 'bg-ink text-white'
                : 'border border-brand-100 bg-white text-brand-700'
            }`}
          >
            সব
          </button>
          {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onChange(category.id)}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition sm:px-5 ${
            activeCategory === category.id
              ? 'bg-brand-600 text-white'
              : 'border border-brand-100 bg-white text-brand-700'
          }`}
        >
          {category.name_bn}
        </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryTabs;
