import { useQuery } from "@tanstack/react-query";
import type { Product } from "@app/common";
import { Color } from "@app/common";
import "../styling/pricelist.scss";
import axios from "axios";

const PriceList: React.FC = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["products"],
    queryFn: () => axios.get("/api/product").then(res => res.data),
  });

  if (isPending) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>An error has occured {error.message}</p>
      </div>
    );
  }

  const getColorClass = (color: Color): string => {
    return `drink-color drink-color--${color.toLowerCase()}`;
  };

  return (
    <div className="product-table-container">
      <table className="product-table">
        <thead>
          <tr>
            <th>Nimi</th>
            <th>Sisään</th>
            <th>Ulos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p: Product) => (
            <tr key={p.name}>
              <td>
                {p.name}{" "}
                {p.color !== Color.EMPTY && (
                  <span className={getColorClass(p.color)}></span>
                )}
              </td>
              <td>{(p.pricein / 100).toFixed(2)}</td>
              <td>{(p.priceout / 100).toFixed(2)} </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceList;
