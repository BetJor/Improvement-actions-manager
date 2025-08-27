
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Chrome, LogIn, Mail, Key, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const t = useTranslations("Actions.login");
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({ variant: "destructive", title: t("errors.fieldsRequired") });
      return;
    }
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      toast({ variant: "destructive", title: t("errors.signInFailed"), description: error.message });
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({ variant: "destructive", title: t("errors.fieldsRequired") });
      return;
    }
    try {
      await signUpWithEmail(email, password);
      toast({ title: t("success.signUpSuccessTitle"), description: t("success.signUpSuccessDescription") });
    } catch (error: any) {
      toast({ variant: "destructive", title: t("errors.signUpFailed"), description: error.message });
    }
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
      toast({ variant: "destructive", title: t("errors.emailRequiredForReset") });
      return;
    }
    try {
      await sendPasswordReset(email);
      toast({ title: t("success.passwordResetSentTitle"), description: t("success.passwordResetSentDescription") });
    } catch (error: any) {
       toast({ variant: "destructive", title: t("errors.passwordResetFailed"), description: error.message });
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={signInWithGoogle} className="w-full">
            <Chrome className="mr-2 h-4 w-4" />
            {t("googleSignIn")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t("orContinueWith")}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
               <div className="flex justify-end">
                <Button variant="link" onClick={handlePasswordReset} className="h-auto p-0 text-xs text-muted-foreground">
                  {t("forgotPassword")}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleSignIn} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              {t("signIn")}
            </Button>
            <Button onClick={handleSignUp} variant="outline" className="w-full">
               <UserPlus className="mr-2 h-4 w-4" />
              {t("signUp")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
