// src/components/__tests__/CategorySelect.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CategorySelect from '../CategorySelect';

describe('CategorySelect', () => {
  test('renders categories and fires onChange', () => {
    const categories = ['electronics', 'jewelery'];
    const onChange = jest.fn();

    render(
      <CategorySelect
        categories={categories}
        value="all"
        onChange={onChange}
        isLoading={false}
      />
    );

    // label + select exist
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();

    // options rendered
    expect(screen.getByRole('option', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /electronics/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /jewelery/i })).toBeInTheDocument();

    // simulate change
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'electronics' } });
    expect(onChange).toHaveBeenCalledWith('electronics');
  });
});
