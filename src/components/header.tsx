
"use client"
import { CircleUser, Menu, Users, Bell, Home, ListChecks, GanttChartSquare, Settings, Route, Sparkles, Library } from "lucide-react"
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
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "./language-switcher"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTabs } from "@/hooks/use-tabs"


const pageConfig: { [key: string]: { icon: React.ElementType, titleKey: string } } = {
  '/dashboard': { icon: Home, titleKey: 'dashboard' },
  '/actions': { icon: ListChecks, titleKey: 'actions' },
  '/actions/new': { icon: ListChecks, titleKey: 'actions' },
  '/actions/[id]': { icon: ListChecks, titleKey: 'actions' },
  '/my-groups': { icon: Users, titleKey: 'myGroups' },
  '/settings': { icon: Settings, titleKey: 'settings' },
  '/ai-settings': { icon: Sparkles, titleKey: 'aiSettings' },
  '/prompt-gallery': { icon: Library, titleKey: 'promptGallery' },
  '/roadmap': { icon: Route, titleKey: 'roadmap' },
};


export function Header() {
  const t = useTranslations('Header');
  const tSidebar = useTranslations('AppSidebar');
  const tDialog = useTranslations('SettingsDialog');
  const { user, logout } = useAuth();
  const { tabs, activeTab } = useTabs();
  const pathname = usePathname();

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const Icon = activeTabData?.icon || GanttChartSquare;
  const title = activeTabData?.title || t('title');


  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-sidebar px-4 sm:h-16 sm:px-6">
      <Dialog>
        <SidebarTrigger className="hidden md:flex" />
        
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
            <SheetContent side="left" className="w-[240px] p-0">
                {/* We need a simplified AppSidebar for mobile */}
            </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-semibold text-lg">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">{tSidebar("toggleNotifications")}</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 relative h-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                      <AvatarFallback>
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <CircleUser className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    {user && <span className="text-sm font-medium hidden md:inline-block">{user.displayName}</span>}
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
