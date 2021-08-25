import { Console } from 'console';
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { ThemeConsumer } from 'styled-components';
import { convertCompilerOptionsFromJson } from 'typescript';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {

  const [cart, setCart] = useState<Product[]>(() => {

    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];

  });

  const addProduct = async (productId: number) => {

    try {

      const productData: Product = await
        api.get(`products/${productId}`).then(response => response.data);

      const stock: Stock = await
        api.get(`stock/${productId}`).then(response => response.data);

      const cartUpdate = [...cart];

      const productIndex = cartUpdate.findIndex(product => product.id === productId);

      if (productIndex >= 0) {

        productData.amount = cartUpdate[productIndex].amount + 1;

        cartUpdate.splice(productIndex, 1, productData);

      } else {

        productData.amount = 1;

        cartUpdate.push(productData);

      }

      if (stock.amount < productData.amount) {

        toast.error('Quantidade solicitada fora de estoque');
        return;

      }

      setCart(cartUpdate);

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUpdate));

    } catch {

      toast.error('Erro na adição do produto');

    }

  };

  const removeProduct = (productId: number) => {

    try {

      const productIndex = cart.findIndex(product => product.id === productId);

      if (productIndex < 0) {
        throw '';
      }

      const cartUpdate = [...cart];

      cartUpdate.splice(productIndex, 1);

      setCart(cartUpdate);

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUpdate));

    } catch {

      toast.error('Erro na remoção do produto');

    }

  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {

    try {

      // ----- check if the quantity was informed ---------------------------------------
      if (amount === 0) {
        return;
      }

      // ----- get product stock amount -------------------------------------------------
      const stock: Stock = await api.get(`stock/${productId}`).then(response => response.data);

      // ----- verify if have the product quantity in stock -----------------------------
      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      };

      // ----- copy CART State to use localy --------------------------------------------
      const cartUpdate = [...cart];

      // ----- get index of the refected PRODUCT in the properties ----------------------
      const productIndex = cartUpdate.findIndex(product => product.id === productId);

      // ----- verify if the product stay in CART ---------------------------------------
      if (productIndex < 0) {
        throw '';
      }

      // ----- copy PRODUCT in CART to use localy ---------------------------------------
      const productUpdate: Product = {
        ...cart[productIndex]
      }

      // ----- update product amount with quantity in the properties --------------------
      productUpdate.amount = amount;

      // ----- remove old product of cart and add new -----------------------------------
      cartUpdate.splice(productIndex, 1, productUpdate);

      // ----- updaste cart state -------------------------------------------------------
      setCart(cartUpdate);

      // ----- updaste cart in localStorage ---------------------------------------------
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUpdate));

    } catch {

      toast.error('Erro na alteração de quantidade do produto');

    }

  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );

}

export function useCart(): CartContextData {

  const context = useContext(CartContext);

  return context;

}
