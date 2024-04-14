import type { Product, Account } from "../types";
import Drink from "./DrinkComponent";
import { useState } from "react";
import { Stack, Button } from "@mui/material";

interface ProductContainerProps {
  drinkState: { product: Product; amount: number }[];
  className?: string;
  updateAmount: (product: string, amount: number) => void;
  users: {
    user: Account;
    pressed: boolean;
  }[];
  resetStates: () => void;
}

const ProductContainer: React.FC<ProductContainerProps> = ({
  drinkState,
  updateAmount,
  users,
  resetStates,
}) => {
  const [sum, setSum] = useState(0);

  const confirm = async () => {
    const items = drinkState.filter((x) => x.amount >= 1);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items,
        users: users.map((u) => u.user),
      }),
    };
    try {
      await fetch("http://localhost:3000/api/transaction", requestOptions);
      resetStates();
      setSum(0);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Stack spacing={2}>
        <h2>Tuotteet</h2>
        {drinkState.map((drink) => (
          <Drink
            key={drink.product.name}
            amount={drink.amount}
            drinkStates={drinkState}
            drink={drink.product}
            sum={sum}
            add={setSum}
            updateAmount={updateAmount}
          />
        ))}
        Yhteensä: {sum / 100} € <br />
        <Button
          disabled={users.length == 0 || sum <= 0}
          variant="contained"
          onClick={() => confirm()}
        >
          Vahvista
        </Button>
      </Stack>
    </>
  );
};

export default ProductContainer;
