import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { EntityPreviewCard } from './EntityPreviewCard';

describe('EntityPreviewCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('busca por nombre cuando hay mas de tres registros', async () => {
    const onSearch = jest.fn().mockResolvedValue([
      { id: '4', name: 'Juancho', detail: 'juancho@jota.com' },
    ]);

    render(
      <EntityPreviewCard
        title="Domiciliarios"
        emptyMessage="Sin domiciliarios"
        items={[
          { id: '1', name: 'Ana' },
          { id: '2', name: 'Beto' },
          { id: '3', name: 'Carlos' },
          { id: '4', name: 'Juancho' },
        ]}
        onSearch={onSearch}
      />,
    );

    fireEvent.changeText(screen.getByTestId('search-domiciliarios'), 'juan');
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('juan'));
    expect(screen.getByText('Juancho')).toBeTruthy();
  });
});
