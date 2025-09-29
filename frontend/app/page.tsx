import { Header } from "@/components/header"
import { SearchBar } from "@/components/search-bar"
import { HeroBanner } from "@/components/hero-banner"
import { QuickAccessGrid } from "@/components/quick-access-grid"
import { PromotionalSection } from "@/components/promotional-section"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-korean">
      <Header />
      <main className="pb-20">
        <div className="px-4 py-6 space-y-6">
          <SearchBar />
          <HeroBanner />
          <QuickAccessGrid />
          <PromotionalSection />
        </div>
      </main>
      <BottomNavigation />
    </div>
  )
}
