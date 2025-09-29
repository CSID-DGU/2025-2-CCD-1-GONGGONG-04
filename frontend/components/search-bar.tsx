"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        placeholder="질병, 진료과, 병원을 검색해보세요"
        className="pl-10 py-3 bg-muted/50 border-border rounded-xl text-base"
      />
    </div>
  )
}
