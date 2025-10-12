import { requireAuth } from "@/lib/authorization";
import LogoutButton from "@/components/LogoutButton/LogoutButton";

export default async function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar se está autenticado (ambos os tipos podem escanear)
  await requireAuth();

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
      }}>
        <LogoutButton variant="icon" />
      </div>
      {children}
    </div>
  );
}

