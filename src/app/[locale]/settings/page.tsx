
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getTranslations } from "next-intl/server"
import { MasterDataManager } from "@/components/master-data-manager"
import { getActionTypes, getCategories, getSubcategories, getAffectedAreas } from "@/lib/data"

export default async function SettingsPage() {
    const t = await getTranslations("SettingsPage")

    const [actionTypes, categories, subcategories, affectedAreas] = await Promise.all([
        getActionTypes(),
        getCategories(),
        getSubcategories(),
        getAffectedAreas(),
    ]);

    const masterData = {
        actionTypes: { title: t("tabs.actionTypes"), data: actionTypes, columns: [{key: 'name', label: t('col.name')}] },
        categories: { title: t("tabs.categories"), data: categories, columns: [{key: 'name', label: t('col.name')}] },
        subcategories: { title: t("tabs.subcategories"), data: subcategories, columns: [{key: 'name', label: t('col.name')}, {key: 'categoryId', label: t('col.category')}] },
        affectedAreas: { title: t("tabs.affectedAreas"), data: affectedAreas, columns: [{key: 'name', label: t('col.name')}] },
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">
                {t("description")}
            </p>
            <MasterDataManager data={masterData} />
        </div>
    )
}
