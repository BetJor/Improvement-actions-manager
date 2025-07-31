
"use client";

import { useTabs } from "@/hooks/use-tabs";
import { Button } from "@/components/ui/button";
import { X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";


export function DynamicTabs({ initialContent }: { initialContent: React.ReactNode }) {
    const { tabs, activeTab, addTab, removeTab, setActiveTab } = useTabs();
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("AppSidebar");

    useEffect(() => {
        // This effect ensures that the initial page (e.g., dashboard) is added as the first tab
        if (tabs.length === 0 && pathname) {
            const initialTabId = pathname.split('/').pop() || 'dashboard';
            const pageTitle = t('dashboard');
            
            // Avoid adding duplicate dashboard tabs
            if (!tabs.some(tab => tab.id === 'dashboard')) {
                addTab({
                    id: 'dashboard', 
                    title: pageTitle,
                    href: `/${pathname.split('/')[1]}/dashboard`, // ensure correct locale
                    isClosable: false
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, t, tabs.length]);


    const handleTabClick = (tabId: string, href: string) => {
        setActiveTab(tabId);
        window.history.replaceState({}, '', href);
    };

    const renderContent = () => {
        if (!activeTab) return initialContent;
        if (activeTab.id === 'dashboard') return initialContent;
        return activeTab.content;
    }

    return (
        <>
            <div className="flex border-b bg-background">
                <div className="flex items-center overflow-x-auto">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id, tab.href)}
                            className={cn(
                                "flex items-center gap-2 cursor-pointer border-r p-2 text-sm",
                                activeTab?.id === tab.id
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            <GripVertical className="h-4 w-4" />
                            <span>{tab.title}</span>
                            {tab.isClosable && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 rounded-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeTab(tab.id);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <main className="flex-1 space-y-4 p-4 lg:p-6 bg-background/60 overflow-y-auto">
               {renderContent()}
            </main>
        </>
    );
}
