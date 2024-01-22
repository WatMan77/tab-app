import { Button, Box, ButtonGroup } from "@mui/material";
import type { Product } from "../types";

const Drink: React.FC<{
  drink: Product;
  sum: number;
  drinkStates: { product: Product; amount: number }[];
  add: (amount: number) => void;
  updateAmount: (product: string, amount: number) => void;
}> = ({ drink, sum, add, drinkStates, updateAmount }) => {
  const addDrink = () => {
    add(sum + drink.pricein);
    updateAmount(drink.name, 1);
  };

  const removeDrink = () => {
    const currentAmount = drinkStates.find((p) => p.amount);
    if (currentAmount && currentAmount.amount >= 1) {
      add(sum - drink.pricein);
      updateAmount(drink.name, -1);
    }
  };
  return (
    <>
      <Box component="section" sx={{ p: 2, border: "1px dashed grey" }}>
        {drink.name} {drink.pricein / 100}€
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
