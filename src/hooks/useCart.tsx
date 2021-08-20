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

      const productIndex = cart.findIndex(product => product.id === productId);

      if (productIndex >= 0) {

        productData.amount = cart[productIndex].amount + 1;

        if (stock.amount < productData.amount) {

          toast.error('Quantidade solicitada fora de estoque');
          return;

        }

        cart.splice(productIndex, 1);

      } else {

        productData.amount = 1;

        if (stock.amount < productData.amount) {

          toast.error('Quantidade solicitada fora de estoque');
          return;

        }

      }

      setCart([...cart, productData]);

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));

    } catch {

      toast.error('Erro na adição do produto');

    }

  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {

    try {

      if (amount <= 0) {
        return;
      }

      const productIndex = cart.findIndex(product => product.id === productId);

      if (productIndex < 0) {
        return;
      }

      const productActive: Product = {
        ...cart[productIndex]
      }

      productActive.amount += amount;

      const stock: Stock = await
        api.get(`stock/${productActive.id}`).then(response => response.data);

      if (productActive.amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      };

      cart.splice(productIndex, 1);

      setCart([...cart, productActive]);

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
