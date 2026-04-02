interface Source {
  id: string;
  name: string;
}

interface SourceFilterProps {
  sources: Source[];
  active: string;
  onChange: (source: string) => void;
}

export function SourceFilter({ sources, active, onChange }: SourceFilterProps) {
  return (
    <div className="source-filter">
      <button
        className={`filter-btn ${active === "all" ? "active" : ""}`}
        onClick={() => onChange("all")}
      >
        すべて
      </button>
      {sources.map((s) => (
        <button
          key={s.id}
          className={`filter-btn ${active === s.id ? "active" : ""}`}
          onClick={() => onChange(s.id)}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}
