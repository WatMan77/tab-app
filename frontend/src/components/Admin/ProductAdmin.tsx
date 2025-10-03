import { useEffect, useState } from "react";
import type { Product } from "../../types";
import EditProduct from "./EditProduct";
import NewProduct from "./NewProduct";
import axios from "axios";
import { toast } from "react-toastify";

const ProductAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = () => {
    try {
      axios.get("/api/product")
        .then(res => {
          setProducts(res.data as Product[]);
        });
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message = e?.response?.data && e.response.data !== "" ?
          e.response.data : e.message;
        toast.error("Error fetching products: " + message)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error")
      }
    }
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
