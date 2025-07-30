"use client"
import { CircleUser, Menu, Users, Bell } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "./app-sidebar"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "./language-switcher"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const t = useTranslations('Header');
  const tSidebar = useTranslations('AppSidebar');
  const tDialog = useTranslations('SettingsDialog');
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <Dialog>
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
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">{tSidebar("toggleNotifications")}</span>
            </Button>
            {user && <span className="text-sm font-medium hidden md:inline-block">{user.displayName}</span>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                      <AvatarFallback>
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <CircleUser className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user ? user.displayName : t("myAccount")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-groups">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{t("myGroups")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DialogTrigger asChild>
                    <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem>{t("support")}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>{t("logout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <DialogContent>
            <DialogHeader>
              <DialogTitle>{tDialog("title")}</DialogTitle>
              <DialogDescription>
                {tDialog("description")}
              </DialogDescription>
            </DialogHeader>
            <LanguageSwitcher />
          </DialogContent>
      </Dialog>
    </header>
  )
}
