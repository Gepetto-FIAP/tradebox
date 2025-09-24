import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #01b5fa 0%, #00384d 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          color: '#00384d', 
          marginBottom: '20px' 
        }}>
          Bem-vindo ao TradeBox
        </h1>
        
        <p style={{ 
          color: '#888', 
          marginBottom: '40px',
          fontSize: '16px'
        }}>
          Sua plataforma de vendas para varejistas
        </p>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <Link 
            href="/auth/login"
            style={{
              padding: '16px 24px',
              background: '#01b5fa',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'background 0.3s ease'
            }}
          >
            Fazer Login
          </Link>
          
          <Link 
            href="/auth/register"
            style={{
              padding: '16px 24px',
              background: 'transparent',
              color: '#01b5fa',
              textDecoration: 'none',
              border: '2px solid #01b5fa',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            Criar Conta
          </Link>
        </div>

        <hr style={{ 
          border: 'none', 
          height: '1px', 
          background: '#e5e5e5',
          margin: '24px 0'
        }} />

        <Link 
          href="/seller"
          style={{
            color: '#888',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          Ou acesse o Dashboard diretamente
        </Link>
      </div>
    </div>
  );
}
