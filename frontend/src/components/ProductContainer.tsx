import { type Product, type Account, Color } from "../types";
import Drink from "./DrinkComponent";
import { useState } from "react";
import { Stack, Button } from "@mui/material";
import Other from "./OtherDrink";
import "../styling/aside.scss";

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
  const [other, setOther] = useState<string>("");

  const confirm = async () => {
    const items = drinkState.filter((x) => x.amount >= 1);
    if (parseFloat(other) > 0) {
      const otherFloat = parseFloat(other);
      const otherFixed = otherFloat.toFixed(2);
      const otherProduct: { product: Product; amount: number } = {
        product: {
          name: "MUU",
          pricein: parseFloat(otherFixed) * 100,
          priceout: 0,
          color: Color.WHITE, // Inserted as Color is required
        },
        amount: 1,
      };
      items.push(otherProduct);
    }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items,
        users: users.map((u) => u.user),
      }),
    };
    try {
      await fetch("/api/transaction", requestOptions);
      resetStates();
      setSum(0);
      setOther("");
    } catch (e) {
      console.log(e);
    }
  };

  const finalSum = () => {
    if (other === "") {
      return sum / 100;
    } else {
      return (sum + parseFloat(other) * 100) / 100;
    }
  };

  return (
    <div className="aside">
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

        <Other other={other} setOther={setOther} />
      </Stack>
      <div className="aside-footer">
        <span className="calculated">
          Yhteensä: <strong>{finalSum().toFixed(2)} €</strong>
        </span>
        <div className="buttons">
          <Button
            disabled={users.length == 0 || finalSum() <= 0}
            variant="contained"
            onClick={() => confirm()}
          >
            Vahvista
          </Button>
          <Button
            disabled={users.length == 0 || finalSum() <= 0}
            variant="contained"
            color="error"
            onClick={resetStates}
          >
            Peruuta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductContainer;
