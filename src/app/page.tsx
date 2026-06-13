import { Suspense } from "react"
import { HomeHero } from "@/components/home/HomeHero"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-61px)] max-w-6xl flex-col px-6 py-8 md:py-12">
      <Suspense fallback={<div className="flex flex-1 items-center justify-center py-24" />}>
        <HomeHero />
      </Suspense>
    </main>
  )
}
