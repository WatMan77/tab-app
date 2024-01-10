import { Button, Box, ButtonGroup } from "@mui/material";
import type { Drink } from "../types";

const Drink: React.FC<{
  drink: Drink;
  sum: number;
  drinkStates: { [key: string]: number };
  add: (price: number) => void;
  setDrinkStates: (drinks: { [key: string]: number }) => void;
}> = ({ drink, sum, add, setDrinkStates, drinkStates }) => {
  const addDrink = () => {
    add(sum + drink.price);
    setDrinkStates({
      ...drinkStates,
      [drink.name]: drinkStates[drink.name] + 1,
    });
  };

  const removeDrink = () => {
    if (drinkStates[drink.name] >= 1) {
      add(sum - drink.price);
      setDrinkStates({
        ...drinkStates,
        [drink.name]: drinkStates[drink.name] - 1,
      });
    }
  };
  return (
    <>
      <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
        {drink.name} {drink.price}€ {drinkStates[drink.name]}
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
