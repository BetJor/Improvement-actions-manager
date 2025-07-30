"use client";

import { usePathname } from "next-intl/navigation";
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
  const pathname = usePathname();

  const onSelectChange = (value: string) => {
    // We can't use the router here because it causes a hard-to-debug error.
    // Instead we will just change the window location.
    const newUrl = `/${value}${pathname}`;
    window.location.href = newUrl;
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
