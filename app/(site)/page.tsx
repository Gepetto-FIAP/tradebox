import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { BiStore, BiBuildings, BiLineChart, BiBarcode, BiPackage, BiTrendingUp, BiCheckCircle, BiRocket, BiShield, BiSupport } from 'react-icons/bi';

export default function Home() {
  return (
    <div className={styles.home_content}>
      {/* Hero Section */}
      <section id="home" className={styles.hero}>
        <div className={styles.hero_overlay}></div>
        <div className={styles.hero_container}>
          <div className={styles.hero_badge}>
            <span>🚀 Conectando Varejistas e Indústrias</span>
          </div>
          
          <h1 className={styles.hero_title}>
            <span className={styles.highlight_text}>Gestão Inteligente</span>
            {' '}para Varejo e Indústria
          </h1>
          
          <p className={styles.hero_description}>
            Analytics em tempo real, scanner GTIN e dashboards completos. 
            Tudo que você precisa para crescer.
          </p>
          
          <div className={styles.hero_cta}>
            <Link href="/auth/register" className={styles.btn_primary}>
              Começar Gratuitamente
            </Link>
            <Link href="/auth/login" className={styles.btn_secondary}>
              Fazer Login
            </Link>
          </div>
        </div>


      </section>

      {/* Product Preview Section - DASHBOARDS (MOVED UP!) */}
      <section id="dashboards" className={styles.preview_section}>
        <div className={styles.section_header}>
          <h2>Dashboards Poderosos em Ação</h2>
          <p>Visualize e gerencie tudo em interfaces modernas e intuitivas</p>
        </div>
        
        <div className={styles.preview_container}>
          {/* Dashboard Seller */}
          <div className={styles.preview_card}>
            <div className={styles.preview_header}>
              <BiStore className={styles.preview_icon} />
              <div>
                <h3>Dashboard Varejista</h3>
                <p>Analytics em tempo real com gráficos interativos</p>
              </div>
            </div>
            <div className={styles.preview_image_wrapper}>
              <Image 
                src="/images/dashboard_seller.png"
                alt="Dashboard Seller - Analytics e Vendas"
                width={1200}
                height={800}
                className={styles.preview_image}
                priority
              />
            </div>
            <div className={styles.preview_features}>
              <span>📊 Gráficos Interativos</span>
              <span>💰 Receita Total</span>
              <span>📈 Crescimento</span>
              <span>🔝 Top Produtos</span>
            </div>
          </div>

          {/* Dashboard Industry */}
          <div className={styles.preview_card}>
            <div className={styles.preview_header}>
              <BiBuildings className={styles.preview_icon} />
              <div>
                <h3>Dashboard Indústria</h3>
                <p>Gestão completa de produtos e distribuição</p>
              </div>
            </div>
            <div className={styles.preview_image_wrapper}>
              <Image 
                src="/images/dashboard_industry.png"
                alt="Dashboard Industry - Gestão de Produtos"
                width={1200}
                height={800}
                className={styles.preview_image}
                priority
              />
            </div>
            <div className={styles.preview_features}>
              <span>📦 Catálogo Completo</span>
              <span>📊 Analytics Avançado</span>
              <span>🌐 Distribuição</span>
              <span>🎯 Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section - Varejista vs Indústria */}
      <section id="solucoes" className={styles.comparison_section}>
        <div className={styles.section_header}>
          <h2>Escolha a melhor solução para você</h2>
          <p>Recursos específicos para cada tipo de negócio</p>
        </div>
        
        <div className={styles.comparison_grid}>
          {/* Varejista */}
          <div className={styles.comparison_card}>
            <div className={styles.comparison_header}>
              <BiStore className={styles.comparison_icon} />
              <h3>Para Varejistas</h3>
              <p>Ferramentas completas para gestão de vendas</p>
            </div>
            <ul className={styles.comparison_list}>
              <li><BiCheckCircle /> Scanner GTIN para leitura de produtos</li>
              <li><BiCheckCircle /> Registro rápido de vendas</li>
              <li><BiCheckCircle /> Analytics de desempenho em tempo real</li>
              <li><BiCheckCircle /> Gráficos de receita e crescimento</li>
              <li><BiCheckCircle /> Top produtos mais vendidos</li>
              <li><BiCheckCircle /> Histórico completo de transações</li>
            </ul>
            <Link href="/auth/register?type=seller" className={styles.comparison_btn}>
              Começar como Varejista
            </Link>
          </div>

          {/* Indústria */}
          <div className={styles.comparison_card}>
            <div className={styles.comparison_header}>
              <BiBuildings className={styles.comparison_icon} />
              <h3>Para Indústrias</h3>
              <p>Controle total do seu catálogo de produtos</p>
            </div>
            <ul className={styles.comparison_list}>
              <li><BiCheckCircle /> Cadastro completo de produtos</li>
              <li><BiCheckCircle /> Gestão de códigos GTIN</li>
              <li><BiCheckCircle /> Analytics de distribuição no mercado</li>
              <li><BiCheckCircle /> Visualização de vendas por região</li>
              <li><BiCheckCircle /> Métricas de performance de produtos</li>
              <li><BiCheckCircle /> Integração com base de dados global</li>
            </ul>
            <Link href="/auth/register?type=industry" className={styles.comparison_btn}>
              Começar como Indústria
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="recursos" className={styles.benefits_section}>
        <div className={styles.section_header}>
          <h2>Por que escolher o TradeBox?</h2>
          <p>Benefícios que fazem a diferença no seu dia a dia</p>
        </div>
        
        <div className={styles.benefits_grid}>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}>
              <BiRocket />
            </div>
            <h3>Rápido e Fácil</h3>
            <p>Interface intuitiva que não requer treinamento. Comece a usar em minutos.</p>
          </div>

          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}>
              <BiLineChart />
            </div>
            <h3>Analytics Poderosos</h3>
            <p>Visualize métricas em tempo real e tome decisões baseadas em dados concretos.</p>
          </div>

          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}>
              <BiShield />
            </div>
            <h3>Seguro e Confiável</h3>
            <p>Seus dados protegidos com criptografia e backup automático diário.</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.section_header}>
          <h2>Recursos completos em um só lugar</h2>
          <p>Tudo que você precisa para gerenciar seu negócio</p>
        </div>
        
        <div className={styles.features_grid}>
          <div className={styles.feature_card}>
            <div className={styles.feature_icon}>
              <BiLineChart />
            </div>
            <h3>Analytics em Tempo Real</h3>
            <p>Visualize receita, ticket médio, produtos mais vendidos e crescimento com gráficos interativos e insights acionáveis.</p>
          </div>

          <div className={styles.feature_card}>
            <div className={styles.feature_icon}>
              <BiPackage />
            </div>
            <h3>Gestão de Produtos</h3>
            <p>Controle completo do catálogo, estoque, preços e informações detalhadas de cada produto.</p>
          </div>

          <div className={styles.feature_card}>
            <div className={styles.feature_icon}>
              <BiTrendingUp />
            </div>
            <h3>Insights & Tendências</h3>
            <p>Identifique padrões de vendas, produtos em alta e oportunidades de crescimento com IA.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="equipe" className={styles.team_section}>
        <div className={styles.section_header}>
          <h2>Conheça Nossa Equipe</h2>
          <p>Profissionais dedicados que tornaram este projeto realidade</p>
        </div>
        
        <div className={styles.team_grid}>
          <div className={styles.team_card}>
            <div className={styles.team_image_wrapper}>
              <img 
                src="/images/team/antonio.png"
                alt="Antonio"
                className={styles.team_image}
              />
            </div>
            <div className={styles.team_info}>
              <h3>Antonio</h3>
              <p className={styles.team_role}>Desenvolvedor</p>
            </div>
          </div>

          <div className={styles.team_card}>
            <div className={styles.team_image_wrapper}>
              <img 
                src="/images/team/eduardo.png"
                alt="Eduardo"
                className={styles.team_image}
              />
            </div>
            <div className={styles.team_info}>
              <h3>Eduardo</h3>
              <p className={styles.team_role}>Desenvolvedor</p>
            </div>
          </div>

          <div className={styles.team_card}>
            <div className={styles.team_image_wrapper}>
              <img 
                src="/images/team/guilherme.png"
                alt="Guilherme"
                className={styles.team_image}
              />
            </div>
            <div className={styles.team_info}>
              <h3>Guilherme</h3>
              <p className={styles.team_role}>Desenvolvedor</p>
            </div>
          </div>

          <div className={styles.team_card}>
            <div className={styles.team_image_wrapper}>
              <img 
                src="/images/team/higor.png"
                alt="Higor"
                className={styles.team_image}
              />
            </div>
            <div className={styles.team_info}>
              <h3>Higor</h3>
              <p className={styles.team_role}>Desenvolvedor</p>
            </div>
          </div>

          <div className={styles.team_card}>
            <div className={styles.team_image_wrapper}>
              <img 
                src="/images/team/luiz.png"
                alt="Luiz"
                className={styles.team_image}
              />
            </div>
            <div className={styles.team_info}>
              <h3>Luiz</h3>
              <p className={styles.team_role}>Desenvolvedor</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.cta_section}>
        <div className={styles.cta_content}>
          <h2>Pronto para transformar sua gestão?</h2>
            <Link href="/auth/register" className={styles.btn_cta_large}>
            Criar Conta
          </Link>
        </div>
      </section>
    </div>
  );
}