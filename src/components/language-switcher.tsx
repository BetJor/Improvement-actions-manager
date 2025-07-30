"use client";

import { usePathname, useRouter } from "next-intl/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (value: string) => {
    router.replace(pathname, { locale: value });
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="language-select">{t("selectLanguage")}</Label>
      <Select defaultValue={locale} onValueChange={onSelectChange}>
        <SelectTrigger id="language-select">
          <SelectValue placeholder={t("selectLanguage")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ca">{t("catalan")}</SelectItem>
          <SelectItem value="es">{t("spanish")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
