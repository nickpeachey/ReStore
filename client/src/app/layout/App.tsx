import { Container, CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Catalog from '../../features/catalog/Catalog';
import { Product } from '../models/product';
import Header from './Header';

function App() {
  const [products, setProducts] = useState<Product[]>([])


  useEffect(() => {
    fetch('http://localhost:5018/api/products')
      .then(response => response.json()
      .then(data => setProducts(data)))
  },[])

  function addProduct() {
    setProducts(prevState => [...prevState, 
      {
        id: prevState.length + 101,
        name: 'product' + (prevState.length + 1), 
        price: (prevState.length * 100),
        brand: 'some brand',
        description: 'some description',
        pictureUrl: 'http://picsum.photos/200',
        quantityInStock: 100,
        type: 'blah'
      }])
  }


  return (
    <>
      <CssBaseline />
      <Header />
      <Container>
      <Catalog products={products} addProduct={addProduct} />
      </Container>
    </>
  );
}

export default App;
