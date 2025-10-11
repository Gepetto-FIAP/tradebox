import { BiMoneyWithdraw } from "react-icons/bi";
import styles from './RecentOrders.module.css';

export default function RecentOrders() {
  return (
    <div>
        <table className={styles.table}>
            <thead className={styles.table_head}>
                <tr>
                    <th>Numero pedido</th>
                    <th>Data </th>
                    <th>Status</th>
                    <th>Itens</th>
                    <th>Total</th>
                </tr>
            </thead>

            <tbody className={styles.table_body}>
                <tr>
                    <td>#1234</td>
                    <td>01/10/2023 </td>
                    <td><span className={styles.status_completed}>Concluído</span></td>
                    <td>2</td>
                    <td>R$ 150,00</td>
                </tr>
                <tr>
                    <td>#1234</td>
                    <td>01/10/2023 </td>
                    <td><span className={styles.status_completed}>Concluído</span></td>
                    <td>2</td>
                    <td>R$ 150,00</td>
                </tr>
                <tr>
                    <td>#1234</td>
                    <td>01/10/2023 </td>
                    <td><span className={styles.status_completed}>Concluído</span></td>
                    <td>2</td>
                    <td>R$ 150,00</td>
                </tr>
                <tr>
                    <td>#1234</td>
                    <td>01/10/2023 </td>
                    <td><span className={styles.status_completed}>Concluído</span></td>
                    <td>2</td>
                    <td>R$ 150,00</td>
                </tr>
            </tbody>
        </table>
    </div>
  ); 
}


