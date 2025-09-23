
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getFirestoreRules, saveFirestoreRules } from "@/services/ai-service";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FirestoreRulesPage() {
  const t = useTranslations("FirestoreRules");
  const { toast } = useToast();
  const [rules, setRules] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRules() {
      setIsLoading(true);
      setError(null);
      try {
        const currentRules = await getFirestoreRules();
        setRules(currentRules);
      } catch (err: any) {
        setError(t("errors.loadFailed"));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRules();
  }, [t]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await saveFirestoreRules(rules);
      toast({
        title: t("toast.saveSuccessTitle"),
        description: t("toast.saveSuccessDescription"),
      });
    } catch (err: any) {
      setError(t("errors.saveFailed"));
      console.error(err);
      toast({
        variant: "destructive",
        title: t("errors.title"),
        description: t("errors.saveFailed"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t("errors.title")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">{t("placeholder")}</span>
          </div>
        ) : (
          <Textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="h-[calc(100vh-22rem)] font-mono text-xs"
            placeholder={t("placeholder")}
          />
        )}
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? t("buttons.saving") : t("buttons.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
