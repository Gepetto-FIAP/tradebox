import { requireAuth } from "@/lib/authorization";
import LogoutButton from "@/components/ui/LogoutButton/LogoutButton";

export const dynamic = 'force-dynamic';

export default async function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar se está autenticado (ambos os tipos podem escanear)
  await requireAuth();

  return (
    <div>
      
      {children}
    </div>
  );
}

