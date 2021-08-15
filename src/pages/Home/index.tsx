import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {

  const [products, setProducts] = useState<ProductFormatted[]>([]);
  // const { addProduct, cart } = useCart();

  // const cartItemsAmount = cart.reduce((sumAmount, product) => {
  //   // TODO
  // }, {} as CartItemsAmount)

  useEffect(() => {

    function numberFormater(price: number) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price)
    }

    async function loadProducts() {

      // ----- Carrega a lista de produtos da api -------------------------------------------------
      const data: Product[] = await api.get('/products').then(response => response.data)

      // ----- Cria uma nova lista de produtos adicionando o valor do produto formatado -----------
      const loadedProducts = data.map(product => {
        const formatted: ProductFormatted = {
          ...product,
          priceFormatted: numberFormater(product.price)
        };
        return formatted;
      });

      // ----- Atualiza o estado de produtos com a lista carrega e tratada ------------------------
      setProducts(loadedProducts);

    }

    loadProducts();

  }, []);

  function handleAddProduct(id: number) {
    // TODO
  }

  return (
    <ProductList>
      {
        products.map(product => (
          <li key={product.id}>
            <img src={product.image} alt={product.title} />
            <strong>{product.title}</strong>
            <span>{product.priceFormatted}</span>
            <button
              type="button"
              data-testid="add-product-button"
            // onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {/* {cartItemsAmount[product.id] || 0} */} 2
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        ))
      }
    </ProductList>
  );
};

export default Home;
