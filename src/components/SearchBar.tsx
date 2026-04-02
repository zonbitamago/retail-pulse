interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="search"
        className="search-input"
        placeholder="キーワードで検索..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
