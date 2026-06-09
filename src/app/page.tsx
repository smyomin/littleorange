import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase.from('settings').select('*')

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Little Orange</h1>
      {error && <p className="text-red-500">Connection failed: {error.message}</p>}
      {data && <p className="text-green-500">✅ Supabase connected! Store: {data[0]?.store_name}</p>}
    </main>
  )
}