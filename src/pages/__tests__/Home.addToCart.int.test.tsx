// src/pages/__tests__/Home.addToCart.int.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '../Home';
import { store, type RootState } from '../../app/store';     // ← import RootState
import { selectTotalCount } from '../../features/cart/cartSlice';
import type { Product } from '../../types/product';

// Mock the product/category hooks to return fixed data
jest.mock('../../hooks/useProducts', () => {
  const product: Product = {
    id: 101,
    title: 'Test Phone',
    price: 499,
    category: 'electronics',
    description: 'Great phone',
    image: 'https://example.com/phone.jpg',
    rating: { rate: 4.8, count: 10 },
  };
  return {
    useCategories: () => ({ data: ['electronics', 'fashion'], isLoading: false }),
    useProducts: () => ({ data: [product], isLoading: false, isError: false, error: null }),
  };
});

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
    </Provider>
  );
}

describe('Home integration: add to cart', () => {
  test('clicking "Add to Cart" updates Redux cart state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    // sanity: product shows
    expect(await screen.findByText('Test Phone')).toBeInTheDocument();

    // click "Add to Cart"
    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    // assert Redux store updated (typed — no `any`)
    const state: RootState = store.getState();
    const count = selectTotalCount(state);
    expect(count).toBe(1);
  });
});
