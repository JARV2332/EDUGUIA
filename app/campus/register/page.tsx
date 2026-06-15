import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CampusRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f4f7fa] to-white p-4">
      <Image src="/assets/logo-edukids.png" alt="EduKids" width={140} height={56} className="mb-8 h-14 w-auto" priority />
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registro desactivado</CardTitle>
          <CardDescription>
            Las cuentas del campus las crea el administrador de EduKids. No hace falta correo electrónico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Si ya tienes usuario y contraseña, entra desde el login del campus.
          </p>
          <Button asChild className="w-full">
            <Link href="/campus/login">Ir al login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/acceso">Volver a acceso</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
