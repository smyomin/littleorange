export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p className="font-semibold text-gray-700 mb-1">Little Orange</p>
        <p>Specialty Asian pantry essentials — delivered to your door</p>
        <p className="mt-2">Payment on delivery · Cash or Bank Transfer · NZD</p>
        <p className="mt-4 text-xs text-gray-400">© {new Date().getFullYear()} Little Orange. All rights reserved.</p>
      </div>
    </footer>
  )
}