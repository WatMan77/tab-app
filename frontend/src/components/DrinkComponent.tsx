import { Button, Box, ButtonGroup } from "@mui/material";
import type { Product } from "../types";
import { Color } from "../types";

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

  const drinkColor = `drink-color drink-color--${drink.color.toLowerCase()}`;

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
    <div className={"drink " + (amount > 0 ? "selected" : "")}>
      <Box display="flex" gap={2}>
        <Box sx={{ flex: 1 }} className="drink-title">
          {drink.name}
          {drink.color !== Color.EMPTY && <span className={drinkColor}></span>}
        </Box>

        <Box>{drink.pricein / 100}€</Box>

        <ButtonGroup
          variant="contained"
          color="secondary"
          aria-label="outlined primary button group"
        >
          <Button
            className="minus"
            color="secondary"
            onClick={removeDrink}
            variant="contained"
          >
            -
          </Button>{" "}
          <Button
            className="plus"
            color="secondary"
            onClick={addDrink}
            variant="contained"
          >
            +
          </Button>
        </ButtonGroup>
        <Box sx={{ minWidth: "20px", fontWeight: "bold" }}>{amount}</Box>
      </Box>
    </div>
  );
};

export default Drink;
