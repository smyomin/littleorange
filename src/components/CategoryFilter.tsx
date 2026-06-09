'use client'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryFilterProps {
  categories: Category[]
  selected: string
  onSelect: (slug: string) => void
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onSelect('all')}
        className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
          selected === 'all'
            ? 'text-white border-orange-500'
            : 'border-gray-200 text-gray-600 hover:border-orange-300'
        }`}
        style={selected === 'all' ? {backgroundColor: 'var(--orange)', borderColor: 'var(--orange)'} : {}}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
            selected === cat.slug
              ? 'text-white border-orange-500'
              : 'border-gray-200 text-gray-600 hover:border-orange-300'
          }`}
          style={selected === cat.slug ? {backgroundColor: 'var(--orange)', borderColor: 'var(--orange)'} : {}}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}