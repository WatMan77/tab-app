import { Box } from "@mui/material";
import { Unstable_NumberInput as NumberInput } from "@mui/base/Unstable_NumberInput";

const Other: React.FC<{
  sum: number;
  add: (amount: number) => void;
}> = ({ sum, add }) => {
  const name = "MUU";

  const changePrice = (val: number) => {
    add(val);
  };
  return (
    <>
      <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
        {name}
        <NumberInput
          placeholder="0"
          value={sum}
          onChange={(_event, val) => changePrice(val ? val : 0)}
        />
      </Box>
    </>
  );
};

export default Other;
