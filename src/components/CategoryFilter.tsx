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

const categoryEmoji: Record<string, string> = {
  'mala': '🌶️',
  'tom-yam': '🍋',
  'curry-paste': '🍛',
  'sauce-condiments': '🫙',
  'soup-base': '🍲',
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onSelect('all')}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
        style={selected === 'all'
          ? {background: 'var(--orange)', color: 'white', borderColor: 'var(--orange)'}
          : {background: 'white', color: 'var(--muted)', borderColor: 'var(--border)'}
        }
      >
        🛒 All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
          style={selected === cat.slug
            ? {background: 'var(--orange)', color: 'white', borderColor: 'var(--orange)'}
            : {background: 'white', color: 'var(--muted)', borderColor: 'var(--border)'}
          }
        >
          {categoryEmoji[cat.slug] ?? '🍱'} {cat.name}
        </button>
      ))}
    </div>
  )
}