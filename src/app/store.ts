import { configureStore} from '@reduxjs/toolkit';
 import userReducer from  '../Slices/userSlice';
import ProductsReducer from  '../Slices/productSlice';
import CartReducer from  '../Slices/CartSlice';
import CompareReducer from '../Slices/compareSlice';



const store = configureStore({
  reducer: {
    user: userReducer,
    products: ProductsReducer,
    cart: CartReducer,
    compare: CompareReducer,

  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
