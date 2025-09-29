"use client"

import { ChevronDown, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const currentTime = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Status bar simulation */}
        <div className="flex items-center space-x-1 text-sm font-medium">
          <span>{currentTime}</span>
          <div className="flex items-center space-x-1 ml-4">
            <div className="flex space-x-1">
              <div className="w-1 h-3 bg-foreground rounded-full opacity-60"></div>
              <div className="w-1 h-3 bg-foreground rounded-full opacity-80"></div>
              <div className="w-1 h-3 bg-foreground rounded-full"></div>
            </div>
            <span className="text-xs ml-1">5G</span>
            <Badge variant="secondary" className="ml-2 text-xs px-2 py-0.5">
              89
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        {/* Location selector */}
        <Button variant="ghost" className="flex items-center space-x-1 p-2">
          <span className="font-medium">수표동</span>
          <ChevronDown className="w-4 h-4" />
        </Button>

        <div className="flex items-center space-x-3">
          {/* Membership badge */}
          <Badge className="bg-primary text-primary-foreground px-3 py-1 rounded-full">멤버십</Badge>

          {/* Notification bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
