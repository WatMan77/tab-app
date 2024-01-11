import type { Drink } from "../types";

const ShopList: React.FC<{
  drinks: Drink[];
  amounts: { [key: string]: number };
}> = ({ drinks, amounts }) => {
  // Take only drinks whose amount is > 1
  const cart = drinks.filter((d) => amounts[d.name] >= 1);
  return (
    <ul>
      {cart.map((d) => (
        <li key={d.name}>
          {d.name} (x{amounts[d.name]}) {d.price * amounts[d.name]}€
        </li>
      ))}
    </ul>
  );
};

export default ShopList;
