
'use client';

import styles from './Footer.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BiRightArrowAlt } from "react-icons/bi";

export default function Header() {
    const pathname = usePathname();

    return (
        <footer className={ styles.footer }>
            <div className={styles.footer_container}>
                <div className={ styles.footer_top}>
                    <Link href="/" className={styles.footer_logo}>
                        <span>
                            Trade
                        </span>
                        <span>
                            Box
                        </span>
                    </Link>

                    <nav>
                        <ul className={ styles.footer_items }>
                            <li>
                                <Link href="/#home">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/#dashboards">
                                    Dashboards
                                </Link>
                            </li>
                            <li>
                                <Link href="/#solucoes">
                                    Soluções
                                </Link>
                            </li>
                            <li>
                                <Link href="/#recursos">
                                    Recursos
                                </Link>
                            </li>
                            <li>
                                <Link href="/#equipe">
                                    Equipe
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className={styles.footer_bottom}>
                    Tradebox. Projeto acadêmico desenvolvido para a FIAP. Challenge 2025.
                </div>
            </div>
   
        </footer>
    )
}
