
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getTranslations } from "next-intl/server"

export default async function SettingsPage() {
    const t = await getTranslations("SettingsPage")

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">
                {t("description")}
            </p>
            {/* TODO: Add tabs and components to manage master data */}
        </div>
    )
}
