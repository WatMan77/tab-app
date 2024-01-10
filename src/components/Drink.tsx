import { Button } from "@mui/material";

const Drink: React.FC<{ name: string; price: number }> = ({ name, price }) => {
  return (
    <Button variant="contained">
      {name} {price}€
    </Button>
  );
};

export default Drink;
