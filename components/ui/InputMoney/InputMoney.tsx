type MoneyInputProps = {
  value: number;
  onValueChange: (value: number) => void;
};

const MoneyInput: React.FC<MoneyInputProps> = ({ value, onValueChange, ...rest }) => {
  function formatMoney(val: number) {
    return (val / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const onlyNums = e.target.value.replace(/\D/g, '');
    onValueChange(onlyNums === '' ? 0 : Number(onlyNums));
  }

  return (
    <input
      type="text"
      required
      value={value === 0 ? '' : formatMoney(value)}
      onChange={handleChange}
      {...rest}
      inputMode="numeric"
      pattern="[0-9]*"
      placeholder="0,00"
    />
  );
};

export default MoneyInput;