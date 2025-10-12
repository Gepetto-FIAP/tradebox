import Link from "next/link";
import styles from './Button.module.css';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function Button({ 
  href, 
  onClick, 
  children, 
  icon, 
  className = '' 
}: ButtonProps) {
  const buttonClass = `${styles.button} ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClass}>
        {icon && <div className={styles.button_icon}>{icon}</div>}
        <div className={styles.button_label}>
          {children}
        </div>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClass}>
      {icon && <div className={styles.button_icon}>{icon}</div>}
      <div className={styles.button_label}>
        {children}
      </div>
    </button>
  );
}