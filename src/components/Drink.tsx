import { Button } from "@mui/material";

const Drink: React.FC<{
  name: string;
  price: number;
  sum: number;
  add: (price: number) => void;
}> = ({ name, price, sum, add }) => {
  return (
    <Button onClick={() => add(price + sum)} variant="contained">
      {name} {price}€
    </Button>
  );
};

export default Drink;
