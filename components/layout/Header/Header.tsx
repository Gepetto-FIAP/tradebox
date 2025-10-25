
'use client';

import styles from './Header.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BiRightArrowAlt } from "react-icons/bi";

export default function Header() {
    const pathname = usePathname();

    return (
        <header className={ styles.header }>
            <div className={ styles.header_container}>
                <Link href="/" className={styles.header_logo}>
                    <span>
                        Trade
                    </span>
                    <span>
                        Box
                    </span>
                </Link>
  
                <nav>
                    <ul className={ styles.header_items }>
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
                    
                <Link href="/auth/register" className={ styles.header_button }>
                    <span>
                        <BiRightArrowAlt/>
                    </span>
                    <span>
                        Iniciar
                    </span>
                </Link>
                
            </div>
        </header>
    )
}
