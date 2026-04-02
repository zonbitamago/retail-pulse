interface CategoryFilterProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter">
      <button
        className={`filter-btn small ${active === "all" ? "active" : ""}`}
        onClick={() => onChange("all")}
      >
        全カテゴリ
      </button>
      {categories.map((c) => (
        <button
          key={c}
          className={`filter-btn small ${active === c ? "active" : ""}`}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
