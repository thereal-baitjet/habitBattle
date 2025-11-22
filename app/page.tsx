import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">HabitBattle</h1>
      <nav className="space-x-4">
        <Link 
          href="/account" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Account Settings
        </Link>
      </nav>
    </div>
  )
}

