import type { Product } from "../types";
import Drink from "./DrinkComponent";
import { useState } from "react";
import { Stack } from "@mui/material";

interface ProductContainerProps {
  drinkState: { product: Product; amount: number }[];
  className?: string;
  updateAmount: (product: string, amount: number) => void;
}

const ProductContainer: React.FC<ProductContainerProps> = ({
  drinkState,
  updateAmount,
}) => {
  const [sum, setSum] = useState(0);
  return (
    <>
      <Stack spacing={2}>
        <h2>Tuotteet</h2>
        {drinkState.map((drink) => (
          <Drink
            amount={drink.amount}
            drinkStates={drinkState}
            drink={drink.product}
            sum={sum}
            add={setSum}
            updateAmount={updateAmount}
          />
        ))}
        Yhteensä: {sum / 100} €
      </Stack>
    </>
  );
};

export default ProductContainer;
