
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  const { signInWithGoogle, user } = useAuth();

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Inicia sessió</CardTitle>
          <CardDescription>
            Accedeix a la plataforma amb el teu compte de Google.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button onClick={signInWithGoogle} className="w-full">
              <Chrome className="mr-2 h-4 w-4" />
              Continua amb Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
