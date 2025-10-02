import { useEffect, useState } from "react";
import type { Product } from "../../types";
import EditProduct from "./EditProduct";
import NewProduct from "./NewProduct";
import axios from "axios";

const ProductAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = () => {
    axios.get("/api/product")
      .then(res => {
        setProducts(res.data as Product[]);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container">
      <NewProduct fetchProducts={fetchProducts} />
      <div className="product-grid">
        <span>Product name</span>
        <span>Price in</span>
        <span>Price out</span>
        <span></span>
        <span></span>
        <span></span>
        {[...products]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p) => (
            <EditProduct
              key={p.name}
              product={p}
              fetchProducts={fetchProducts}
            />
          ))}
      </div>
    </div>
  );
};

export default ProductAdmin;
