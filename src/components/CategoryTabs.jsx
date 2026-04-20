function CategoryTabs({ categories, activeCategory, onChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
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
          className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            activeCategory === category.id
              ? 'bg-brand-600 text-white'
              : 'border border-brand-100 bg-white text-brand-700'
          }`}
        >
          {category.name_bn}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
