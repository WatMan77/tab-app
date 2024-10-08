import type { Product } from "../types";

const ShopList: React.FC<{
  drinkStates: { product: Product; amount: number }[];
}> = ({ drinkStates }) => {
  // Take only drinks whose amount is > 1
  const cart = drinkStates.filter((p) => p.amount >= 1);
  return (
    <ul>
      {cart.map((d) => (
        <li key={d.product.name}>
          {d.product.name} (x{d.amount}) {(d.product.pricein * d.amount) / 100}
        </li>
      ))}
    </ul>
  );
};

export default ShopList;
