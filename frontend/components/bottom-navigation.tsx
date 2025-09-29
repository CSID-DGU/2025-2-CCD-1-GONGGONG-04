"use client"

import { Home, Map, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const navItems = [
  { icon: Home, label: "홈", active: true },
  { icon: Map, label: "나의 독닥", active: false },
  { icon: Star, label: "찜", active: false },
  { icon: User, label: "마이페이지", active: false, hasNotification: true },
]

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`flex flex-col items-center space-y-1 p-2 touch-target relative ${
              item.active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.hasNotification && (
                <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0 bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  N
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  )
}
