import { TextField } from "@mui/material";
const Other: React.FC<{
  add: (amount: number) => void;
  other: string;
  setOther: (value: string) => void;
}> = ({ add, other, setOther }) => {
  const changePrice = (val: string) => {
    const n: number = Number.parseFloat(val);
    add(isNaN(n) ? 0 : n * 100);
  };

  return (
    <>
      <TextField
        label="Muu määrä"
        placeholder="0"
        type="number"
        onChange={({ target }) => {
          changePrice(target.value);
          setOther(target.value);
        }}
        value={other}
      />
    </>
  );
};

export default Other;
