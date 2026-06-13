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
    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
      <button
        onClick={() => onSelect('all')}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 18px', borderRadius: '999px',
          fontSize: '14px', fontWeight: 700,
          border: '2px solid',
          cursor: 'pointer', transition: 'all 0.2s',
          borderColor: selected === 'all' ? '#F97316' : '#F0E0CC',
          background: selected === 'all' ? '#F97316' : 'white',
          color: selected === 'all' ? 'white' : '#78716C',
        }}
      >
        <span style={{fontSize: '16px'}}>🛒</span>
        <span>All</span>
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '999px',
            fontSize: '14px', fontWeight: 700,
            border: '2px solid',
            cursor: 'pointer', transition: 'all 0.2s',
            borderColor: selected === cat.slug ? '#F97316' : '#F0E0CC',
            background: selected === cat.slug ? '#F97316' : 'white',
            color: selected === cat.slug ? 'white' : '#78716C',
          }}
        >
          <span style={{fontSize: '16px'}}>{categoryEmoji[cat.slug] ?? '🍱'}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  )
}