import { TextField } from "@mui/material";
const Other: React.FC<{
  other: string;
  setOther: (value: string) => void;
}> = ({ other, setOther }) => {
  return (
    <>
      <TextField
        label="Muu määrä"
        placeholder="0"
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
