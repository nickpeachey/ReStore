import { useEffect } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";
import { useAppDispatch, useAppSelector } from "../../app/store/configureStore";
import {
  fetchFiltersAsync,
  fetchProductsAsync,
  productSelectors,
} from "./catalogSlice";
import ProductList from "./ProductList";

export default function Catalog() {
  const products = useAppSelector(productSelectors.selectAll);
  const { productsLoaded, status, filtersLoaded } = useAppSelector(
    (state) => state.catalog
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!productsLoaded) dispatch(fetchProductsAsync());
    if (!filtersLoaded) dispatch(fetchFiltersAsync());
  }, [productsLoaded, dispatch, filtersLoaded]);

  if (status.includes("pending")) return <LoadingComponent />;

  return (
    <>
      <ProductList products={products} />
    </>
  );
}
