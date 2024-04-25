import { useEffect, useState } from "react";
import type { Product } from "../../types";
import EditProduct from "./EditProduct";
import NewProduct from "./NewProduct";

const ProductAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = () => {
    fetch("http://localhost:3000/api/product")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data as Product[]);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <NewProduct fetchProducts={fetchProducts} />
      {products.map((p) => (
        <EditProduct key={p.name} product={p} fetchProducts={fetchProducts} />
      ))}
    </>
  );
};

export default ProductAdmin;
