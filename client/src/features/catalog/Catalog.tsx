import { Product } from "../../app/models/product"

interface Props {
    products: Product[];
    addProduct: () => void;
}

export default function Catalog({products, addProduct}: Props) {
    return (
        <>
        <ul>
          {products.map(item => (<li key={item.name}>{item.name} - {item.price}</li>))}
        </ul>
        {<button onClick={addProduct}>Add Product</button>}
        </>
    )
}