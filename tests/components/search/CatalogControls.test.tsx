import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CatalogControls } from '@/components/search/CatalogControls';

describe('CatalogControls', () => {
  const defaultProps = {
    searchInput: '',
    onSearchChange: vi.fn(),
    onSearchClear: vi.fn(),
    view: 'grid' as const,
    onViewChange: vi.fn(),
    hasActiveFilters: false,
    genresData: undefined,
    selectedGenres: '',
    selectedRating: undefined,
    toYear: '',
    fromYear: '',
    onToggleGenre: vi.fn(),
    onUpdateParams: vi.fn(),
    onClearFilters: vi.fn(),
  };

  it('renders search bar', () => {
    render(
      <BrowserRouter>
        <CatalogControls {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/поиск/i)).toBeInTheDocument();
  });

  it('renders filter button', () => {
    render(
      <BrowserRouter>
        <CatalogControls {...defaultProps} />
      </BrowserRouter>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders view toggle with two buttons', () => {
    render(
      <BrowserRouter>
        <CatalogControls {...defaultProps} />
      </BrowserRouter>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
  });

  it('calls onSearchChange when search input changes', () => {
    const onSearchChange = vi.fn();
    render(
      <BrowserRouter>
        <CatalogControls {...defaultProps} onSearchChange={onSearchChange} />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/поиск/i);
    fireEvent.change(input, { target: { value: 'test' } });
    expect(onSearchChange).toHaveBeenCalledWith('test');
  });

  it('calls onViewChange when view toggle buttons are clicked', () => {
    const onViewChange = vi.fn();
    render(
      <BrowserRouter>
        <CatalogControls {...defaultProps} view="grid" onViewChange={onViewChange} />
      </BrowserRouter>
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]);
    expect(onViewChange).toHaveBeenCalledWith('list');
  });
});