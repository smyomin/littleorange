import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4" style={{color: 'var(--orange)'}}>
            Welcome to Little Orange 🍊
          </h1>
          <p className="text-gray-500 text-lg">
            Specialty Asian pantry essentials — coming soon!
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}