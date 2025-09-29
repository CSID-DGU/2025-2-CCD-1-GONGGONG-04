"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function PromotionalSection() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-pink-50 to-purple-50 p-6">
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-foreground mb-2">병원 가기 전 필수</h3>
        <p className="text-base font-medium text-foreground mb-4">바로접수 연습하기</p>

        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
          바로 연결하기
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Illustration placeholder */}
      <div className="absolute right-4 top-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-primary/30 rounded-full"></div>
        </div>
      </div>

      {/* Phone illustration */}
      <div className="absolute right-8 bottom-4 w-8 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
        <div className="w-4 h-6 bg-primary/40 rounded"></div>
      </div>
    </Card>
  )
}
