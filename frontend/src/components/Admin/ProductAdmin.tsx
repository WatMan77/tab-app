import { useEffect, useState } from "react";
import type { Product } from "../../types";
import EditProduct from "./EditProduct";
import NewProduct from "./NewProduct";

const ProductAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/product")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data as Product[]);
      });
  }, []);

  return (
    <>
      <NewProduct />
      {products.map((p) => (
        <EditProduct key={p.name} product={p} />
      ))}
    </>
  );
};

export default ProductAdmin;
