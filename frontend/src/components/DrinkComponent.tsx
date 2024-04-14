import { Button, Box, ButtonGroup } from "@mui/material";
import type { Product } from "../types";

const Drink: React.FC<{
  drink: Product;
  sum: number;
  drinkStates: { product: Product; amount: number }[];
  add: (amount: number) => void;
  updateAmount: (product: string, amount: number) => void;
  amount: number;
}> = ({ drinkStates, drink, sum, updateAmount, add, amount }) => {
  const addDrink = () => {
    add(sum + drink.pricein);
    updateAmount(drink.name, 1);
  };

  const removeDrink = () => {
    const currentAmount = drinkStates.find(
      (p) => p.product.name === drink.name
    );
    if (currentAmount && currentAmount.amount >= 1) {
      add(sum - drink.pricein);
      updateAmount(drink.name, -1);
    }
  };
  return (
    <>
      <Box display="flex" gap={2}>
        <Box sx={{ flex: 1 }}>
          {drink.name} {drink.pricein / 100}€
        </Box>
        <Box>{amount}</Box>
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Button onClick={addDrink} variant="contained">
            +
          </Button>
          <Button onClick={removeDrink} variant="contained">
            -
          </Button>
        </ButtonGroup>
      </Box>
    </>
  );
};

export default Drink;
