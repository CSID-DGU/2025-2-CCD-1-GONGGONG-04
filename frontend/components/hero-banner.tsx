"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function HeroBanner() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-primary to-accent p-6 text-white">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold mb-2 text-balance">독감 무료 접종 시작!</h2>
            <p className="text-lg font-medium mb-1">필수 정보 총 정리</p>
            <p className="text-sm opacity-90">이 글 하나로 끝내세요!</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            1/2
          </Badge>
        </div>
      </div>

      {/* Illustration placeholder */}
      <div className="absolute right-4 bottom-4 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-white/30 rounded-full"></div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-8 w-6 h-6 bg-white/20 rounded transform rotate-45"></div>
      <div className="absolute bottom-8 left-8 w-4 h-4 bg-white/15 rounded-full"></div>
    </Card>
  )
}
