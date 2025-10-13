import styles from './Table.module.css';

interface TableColumn {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  className?: string;
}

export default function Table({ columns, data, className }: TableProps) {
  return (
    <div className={`${styles.table_wrapper} ${className || ''}`}>
      <div className={styles.table}>
        <div className={`${styles.table_row} ${styles.table_header}`}>
          {columns.map((column) => (
            <div key={column.key} className={styles.table_col} title={column.header}>
              {column.header}
            </div>
          ))}
        </div>

        <div className={styles.table_body}>
          {data.map((row, index) => (
            <div key={index} className={styles.table_row}>
              {columns.map((column) => (
                <div key={column.key} className={styles.table_col} title={row[column.key]}>
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key]
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}