import { Button, Box, ButtonGroup } from "@mui/material";

const Drink: React.FC<{
  name: string;
  price: number;
  sum: number;
  drinkStates: { [key: string]: number };
  add: (price: number) => void;
  setDrinkStates: (drinks: { [key: string]: number }) => void;
}> = ({ name, price, sum, add, setDrinkStates, drinkStates }) => {
  const addDrink = () => {
    add(sum + price);
    setDrinkStates({ ...drinkStates, [name]: drinkStates[name] + 1 });
  };

  const removeDrink = () => {
    if (drinkStates[name] >= 1) {
      add(sum - price);
      setDrinkStates({ ...drinkStates, [name]: drinkStates[name] - 1 });
    }
  };
  return (
    <>
      <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
        {name} {price}€ {drinkStates[name]}
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Button onClick={() => addDrink()} variant="contained">
            +
          </Button>
          <Button onClick={() => removeDrink()} variant="contained">
            -
          </Button>
        </ButtonGroup>
      </Box>
    </>
  );
};

export default Drink;
