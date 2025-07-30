"use client"
import { CircleUser, Menu, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "./app-sidebar"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function Header() {
  const t = useTranslations('Header');
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <AppSidebar />
            </SheetContent>
        </Sheet>

      <div className="w-full flex-1">
        <h1 className="font-semibold text-lg">
            {t("title")}
        </h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
          <DropdownMenuItem>{t("support")}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t("logout")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
