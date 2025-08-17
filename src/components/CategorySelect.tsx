// src/components/CategorySelect.tsx
type Props = {
  categories: string[] | undefined;
  value: string;
  onChange: (v: string) => void;
  isLoading?: boolean;
};

export default function CategorySelect({ categories, value, onChange, isLoading }: Props) {
  return (
    <div className="category-select">
      <label htmlFor="category">Category</label>
      <select
        id="category"
        value={value}
        disabled={isLoading}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">All</option>
        {categories?.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
