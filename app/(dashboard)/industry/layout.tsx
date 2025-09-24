export default function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header style={{ 
        padding: '10px 20px', 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        TradeBox Indústria
      </header>
      {children}
    </div>
  );
}
