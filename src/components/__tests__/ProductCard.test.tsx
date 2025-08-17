// src/components/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../ProductCard';
import type { Product } from '../../types/product';

const sample: Product = {
  id: 1,
  title: 'USB-C Cable',
  price: 9.99,
  category: 'electronics',
  description: 'Fast charging cable',
  image: 'https://example.com/cable.jpg',
  rating: { rate: 4.5, count: 100 },
};

describe('ProductCard', () => {
  test('renders product and calls onAdd when clicked', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductCard product={sample} onAdd={onAdd} />);

    expect(screen.getByRole('img', { name: sample.title })).toBeInTheDocument();
    expect(screen.getByText(sample.title)).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText(/electronics/i)).toBeInTheDocument();
    expect(screen.getByText(/⭐ 4.5/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onAdd).toHaveBeenCalledWith(sample);
  });
});
