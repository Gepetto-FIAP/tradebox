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
            <span>≡ƒÜÇ Conectando Varejistas e Ind├║strias</span>
          </div>
          
          <h1 className={styles.hero_title}>
            <span className={styles.highlight_text}>Gest├úo Inteligente</span>
            {' '}para Varejo e Ind├║stria
          </h1>
          
          <p className={styles.hero_description}>
            Analytics em tempo real, scanner GTIN e dashboards completos. 
            Tudo que voc├¬ precisa para crescer.
          </p>
          
          <div className={styles.hero_cta}>
            <Link href="/auth/register" className={styles.btn_primary}>
              Come├ºar Gratuitamente
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
          <h2>Dashboards Poderosos em A├º├úo</h2>
          <p>Visualize e gerencie tudo em interfaces modernas e intuitivas</p>
        </div>
        
        <div className={styles.preview_container}>
          {/* Dashboard Seller */}
          <div className={styles.preview_card}>
            <div className={styles.preview_header}>
              <BiStore className={styles.preview_icon} />
              <div>
                <h3>Dashboard Varejista</h3>
                <p>Analytics em tempo real com gr├íficos interativos</p>
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
              <span>≡ƒôè Gr├íficos Interativos</span>
              <span>≡ƒÆ░ Receita Total</span>
              <span>≡ƒôê Crescimento</span>
              <span>≡ƒö¥ Top Produtos</span>
            </div>
          </div>

          {/* Dashboard Industry */}
          <div className={styles.preview_card}>
            <div className={styles.preview_header}>
              <BiBuildings className={styles.preview_icon} />
              <div>
                <h3>Dashboard Ind├║stria</h3>
                <p>Gest├úo completa de produtos e distribui├º├úo</p>
              </div>
            </div>
            <div className={styles.preview_image_wrapper}>
              <Image 
                src="/images/dashboard_industry.png"
                alt="Dashboard Industry - Gest├úo de Produtos"
                width={1200}
                height={800}
                className={styles.preview_image}
                priority
              />
            </div>
            <div className={styles.preview_features}>
              <span>≡ƒôª Cat├ílogo Completo</span>
              <span>≡ƒôè Analytics Avan├ºado</span>
              <span>≡ƒîÉ Distribui├º├úo</span>
              <span>≡ƒÄ» Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section - Varejista vs Ind├║stria */}
      <section id="solucoes" className={styles.comparison_section}>
        <div className={styles.section_header}>
          <h2>Escolha a melhor solu├º├úo para voc├¬</h2>
          <p>Recursos espec├¡ficos para cada tipo de neg├│cio</p>
        </div>
        
        <div className={styles.comparison_grid}>
          {/* Varejista */}
          <div className={styles.comparison_card}>
            <div className={styles.comparison_header}>
              <BiStore className={styles.comparison_icon} />
              <h3>Para Varejistas</h3>
              <p>Ferramentas completas para gest├úo de vendas</p>
            </div>
            <ul className={styles.comparison_list}>
              <li><BiCheckCircle /> Scanner GTIN para leitura de produtos</li>
              <li><BiCheckCircle /> Registro r├ípido de vendas</li>
              <li><BiCheckCircle /> Analytics de desempenho em tempo real</li>
              <li><BiCheckCircle /> Gr├íficos de receita e crescimento</li>
              <li><BiCheckCircle /> Top produtos mais vendidos</li>
              <li><BiCheckCircle /> Hist├│rico completo de transa├º├╡es</li>
            </ul>
            <Link href="/auth/register?type=seller" className={styles.comparison_btn}>
              Come├ºar como Varejista
            </Link>
          </div>

          {/* Ind├║stria */}
          <div className={styles.comparison_card}>
            <div className={styles.comparison_header}>
              <BiBuildings className={styles.comparison_icon} />
              <h3>Para Ind├║strias</h3>
              <p>Controle total do seu cat├ílogo de produtos</p>
            </div>
            <ul className={styles.comparison_list}>
              <li><BiCheckCircle /> Cadastro completo de produtos</li>
              <li><BiCheckCircle /> Gest├úo de c├│digos GTIN</li>
              <li><BiCheckCircle /> Analytics de distribui├º├úo no mercado</li>
              <li><BiCheckCircle /> Visualiza├º├úo de vendas por regi├úo</li>
              <li><BiCheckCircle /> M├⌐tricas de performance de produtos</li>
              <li><BiCheckCircle /> Integra├º├úo com base de dados global</li>
            </ul>
            <Link href="/auth/register?type=industry" className={styles.comparison_btn}>
              Come├ºar como Ind├║stria
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="recursos" className={styles.benefits_section}>
        <div className={styles.section_header}>
          <h2>Por que escolher o TradeBox?</h2>
          <p>Benef├¡cios que fazem a diferen├ºa no seu dia a dia</p>
        </div>
        
        <div className={styles.benefits_grid}>
          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}>
              <BiRocket />
            </div>
            <h3>R├ípido e F├ícil</h3>
            <p>Interface intuitiva que n├úo requer treinamento. Comece a usar em minutos.</p>
          </div>

          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}>
              <BiLineChart />
            </div>
            <h3>Analytics Poderosos</h3>
            <p>Visualize m├⌐tricas em tempo real e tome decis├╡es baseadas em dados concretos.</p>
          </div>

          <div className={styles.benefit_card}>
            <div className={styles.benefit_icon}>
              <BiShield />
            </div>
            <h3>Seguro e Confi├ível</h3>
            <p>Seus dados protegidos com criptografia e backup autom├ítico di├írio.</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.section_header}>
          <h2>Recursos completos em um s├│ lugar</h2>
          <p>Tudo que voc├¬ precisa para gerenciar seu neg├│cio</p>
        </div>
        
        <div className={styles.features_grid}>
          <div className={styles.feature_card}>
            <div className={styles.feature_icon}>
              <BiLineChart />
            </div>
            <h3>Analytics em Tempo Real</h3>
            <p>Visualize receita, ticket m├⌐dio, produtos mais vendidos e crescimento com gr├íficos interativos e insights acion├íveis.</p>
          </div>

          <div className={styles.feature_card}>
            <div className={styles.feature_icon}>
              <BiPackage />
            </div>
            <h3>Gest├úo de Produtos</h3>
            <p>Controle completo do cat├ílogo, estoque, pre├ºos e informa├º├╡es detalhadas de cada produto.</p>
          </div>

          <div className={styles.feature_card}>
            <div className={styles.feature_icon}>
              <BiTrendingUp />
            </div>
            <h3>Insights & Tend├¬ncias</h3>
            <p>Identifique padr├╡es de vendas, produtos em alta e oportunidades de crescimento com IA.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="equipe" className={styles.team_section}>
        <div className={styles.section_header}>
          <h2>Conhe├ºa Nossa Equipe</h2>
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
          <h2>Pronto para transformar sua gest├úo?</h2>
            <Link href="/auth/register" className={styles.btn_cta_large}>
            Criar Conta
          </Link>
        </div>
      </section>
    </div>
  );
}
