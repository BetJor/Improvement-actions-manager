
"use client"
import { Button } from "@/components/ui/button";
import { useTabs } from "@/hooks/use-tabs";
import { FilePlus } from "lucide-react";
import { useTranslations } from "next-intl";

export function ClientButton() {
    const { openTab } = useTabs();
    const t = useTranslations("Actions.page");

    const handleNewAction = () => {
        openTab({
            path: '/actions/new',
            title: 'Nova Acció',
            icon: FilePlus,
            isClosable: true,
        });
    }

    return (
        <Button onClick={handleNewAction}>
            <FilePlus className="mr-2 h-4 w-4" />
            {t("createAction")}
        </Button>
    )
}
