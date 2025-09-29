"use client"

import { Shield, Calendar, Star, Heart, CheckSquare, Phone, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"

const quickAccessItems = [
  { icon: Shield, label: "지금 진료 중", color: "bg-green-100 text-green-600" },
  { icon: Calendar, label: "당일 예약", color: "bg-blue-100 text-blue-600" },
  { icon: MapPin, label: "동네 인기 병원", color: "bg-purple-100 text-purple-600" },
  { icon: Heart, label: "영유아검진", color: "bg-pink-100 text-pink-600" },
  { icon: User, label: "소아청소년과", color: "bg-orange-100 text-orange-600" },
  { icon: CheckSquare, label: "이비인후과", color: "bg-indigo-100 text-indigo-600" },
  { icon: Phone, label: "내과", color: "bg-red-100 text-red-600" },
  { icon: Star, label: "가정의학과", color: "bg-yellow-100 text-yellow-600" },
]

export function QuickAccessGrid() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {quickAccessItems.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          className="flex flex-col items-center space-y-2 h-auto p-4 touch-target transition-smooth hover:bg-secondary/50"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
            <item.icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
        </Button>
      ))}
    </div>
  )
}
