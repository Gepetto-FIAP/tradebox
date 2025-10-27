import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { BiStore, BiBuildings, BiLineChart, BiPackage, BiTrendingUp, BiCheckCircle, BiRocket, BiShield, BiSupport, BiCartAlt } from 'react-icons/bi';
import CardData from '@/components/dashboard/Cards/CardData/CardData';
import ProfitCard from '@/components/dashboard/Cards/ProfitCard/ProfitCard';
import SalesChart from '@/components/dashboard/Charts/SalesChart/SalesChart';

export default function Home() {
  return (
    <div className={styles.home_content}>
      <section id="home" className={styles.hero}>
        <div className={styles.section_inner}>
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
        </div>
      </section>

      <section className={styles.charts_section} id='dashboards'>
        <div className={styles.section_inner}>
          <div className={styles.section_header}>
            <h2>Dashboards Poderosos em Ação</h2>
            <p>Visualize e gerencie tudo em interfaces modernas e intuitivas</p>
          </div>

          <div className={styles.charts_container}>
            <div className={styles.chart_card} id={styles.cards}>
              <div className={styles.chart}>
                <CardData icon={<BiCartAlt />} label="Vendas" value={99} badge_value={"+5%"} />
                <CardData icon={<BiCartAlt />} label="Faturamento" value={99} badge_value={"+15%"} />
                <CardData icon={<BiCartAlt />} label="Lucro" value={99} badge_value={"+25%"} />
              </div>

              <div className={styles.chart_info}>
                <h3> 
                  Cards de resumo de indicadores
                </h3>
                <p>
                  Veja rapidamente os principais números do seu negócio: vendas, faturamento e lucro, com variação percentual em relação ao período anterior.
                </p>
              </div>
            </div>
          
            <div className={styles.chart_card} id={styles.profit}>
              <div className={styles.chart}>
                <ProfitCard totalsByPeriod={{
                  '7': { revenue: 35000, cost: 29000 }, // ultimos 7 dias
                  '30': { revenue: 52000, cost: 40000 }, // ultimos 30 dias
                  '365': { revenue: 154000, cost: 112000 }, // ultimos 365 dias
                }}/>
              </div>
              <div className={styles.chart_info}>
                <h3> 
                  Margem de lucro por Período
                </h3>
                <p>
                  Veja a margem de lucro do seu negócio em diferentes períodos: últimos 7 dias, 30 dias e 365 dias.
                </p>
              </div>
            </div>


            <div className={styles.chart_card} id={styles.sales}>
              <div className={styles.chart}>
                <SalesChart 
                  colorStart={"#01b5fa70"}
                  colorEnd={"transparent"}
                  colorBorder={"#01b5fa"}
                  value={"R$ 99.999,99"}
                  axis={{
                    x: [15, 22, 17, 20, 24, 27, 24],
                    y: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
                  }}
                />
                
              </div>

              <div className={styles.chart_info}>
                <h3> 
                  Vendas por dia da semana
                </h3>
                <p>
                  Visualize o volume de vendas ao longo dos dias da semana e identifique quais dias concentram mais movimento na sua operação.
                </p>
              </div>
            </div>
          
          </div>
        </div>
      </section>

      <section id="recursos" className={styles.benefits_section} >
        <div className={styles.section_inner}>
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
        </div>
      </section>

      <section id="equipe" className={styles.team_section}>

        <div className={styles.section_inner}>
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
        </div>

      </section>
      <section id="solucoes" className={styles.comparison_section}>
        <div className={styles.section_inner}>
          <div className={styles.section_header}>
            <h2>Escolha a melhor solução para você</h2>
            <p>Recursos específicos para cada tipo de negócio</p>
          </div> 
          
          <div className={styles.comparison_grid}>
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
        </div>
      </section>

    </div>
  );
}
