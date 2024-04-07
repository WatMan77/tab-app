import { Box, TextField } from "@mui/material";

const Other: React.FC<{
  sum: number;
  add: (amount: number) => void;
}> = ({ add }) => {
  const changePrice = (val: string) => {
    const n: number = Number.parseFloat(val);
    add(isNaN(n) ? 0 : n);
  };

  return (
    <>
      <Box component="section" sx={{ p: 2, border: "1px dashed grey" }} />
      <TextField
        label="Muu määrä"
        placeholder="0"
        type="number"
        onChange={({ target }) => changePrice(target.value)}
      />
    </>
  );
};

export default Other;
