
import styles from './Header.module.css'
import Link from 'next/link'
import { BiRightArrowAlt } from "react-icons/bi";

export default function Header() {
    return (
        <header className={ styles.header }>
            <div className={ styles.header_container }>
                <div className={styles.header_logo}>
                    <span>
                        Trade
                    </span>
                    <span>
                        Box
                    </span>
                </div>

                <nav>
                    <ul className={ styles.header_items }>
                        <li>
                            <Link href="#section1">
                                Sessao um
                            </Link>
                        </li>
                        <li>
                            <Link href="#section2">
                                Sessao dois
                            </Link>
                        </li>
                        <li>
                            <Link href="#section3">
                                Sessao tres
                            </Link>
                        </li>
                        <li>
                            <Link href="#section3">
                                Sessao tres
                            </Link>
                        </li>

                    </ul>
                </nav>
                
                    
                <button className={ styles.header_button }>
                    <span>
                        <BiRightArrowAlt/>
                    </span>
                    <span>
                        Iniciar
                    </span>
                </button>
            </div>
        </header>
    )
}