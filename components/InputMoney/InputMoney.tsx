import React from 'react';

type BasicInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const BasicInput: React.FC<BasicInputProps> = ({onChange, ...rest}) => {
  return (
    <input onChange={onChange} {...rest}/>
  );
};

function App() {
  const [input, setInput] = React.useState('')

  return (
    <>
      <BasicInput
        value={input}
        type='number'
        onChange={(e) => setInput(e.target.value)}
      />
      <p>
        Your input: {input}
      </p>
    </>
  )
}

export default App