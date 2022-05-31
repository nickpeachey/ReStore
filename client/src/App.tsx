import React, { useEffect, useState } from 'react';
import './App.css';

const prods = [
  {name: 'product1', price:100.00},
  {name: 'product2', price:200.00}
]

function App() {
  const [products, setProducts] = useState(prods)


  useEffect(() => {
    fetch('http://localhost:5018/api/products')
      .then(response => response.json()
      .then(data => setProducts(data)))
  },[])

  function addProduct() {
    setProducts(prevState => [...prevState, 
      {name: 'product' + (prevState.length + 1), price: (prevState.length * 100)}])
  }


  return (
    <div>
      <h1 style={{color:'red'}}>Re-Store</h1>
      <>
      <ul>
        {products.map(item => (<li key={item.name}>{item.name} - {item.price}</li>))}
      </ul>
      <button onClick={addProduct}>Add Product</button>
      </>
    </div>
  );
}

export default App;
