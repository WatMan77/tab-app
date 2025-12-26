import { TextField, InputAdornment } from "@mui/material";
const Other: React.FC<{
  other: string;
  setOther: (value: string) => void;
}> = ({ other, setOther }) => {
  return (
    <>
      <TextField
        label="Muu määrä"
        placeholder="0"
        color="secondary"
        InputProps={{
          startAdornment: <InputAdornment position="start"></InputAdornment>,
        }}
        type="number"
        onChange={({ target }) => {
          setOther(target.value);
        }}
        value={other}
      />
    </>
  );
};

export default Other;
