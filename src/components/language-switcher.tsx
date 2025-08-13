"use client";

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
  const t = useTranslations("Common.LanguageSwitcher");
  const locale = useLocale();

  const onSelectChange = (value: string) => {
    // To switch the locale, we replace the current locale in the path
    // with the new one.
    const newPath = window.location.pathname.replace(`/${locale}`, `/${value}`);
    window.location.href = newPath + window.location.search;
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
