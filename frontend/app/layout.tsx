import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "마음이음 - 정신건강증진센터 통합 검색",
  description:
    "전국 정신건강증진센터를 쉽고 빠르게 찾아보세요. 실시간 운영 상태와 맞춤형 추천으로 필요한 정신건강 서비스에 연결됩니다.",
  generator: "v0.app",
  keywords: "정신건강, 상담센터, 정신건강증진센터, 심리상담, 마음건강",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="font-korean">
      <body className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
