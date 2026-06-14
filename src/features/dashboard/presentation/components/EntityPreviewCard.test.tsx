import { fireEvent, render, screen } from '@testing-library/react-native';
import { EntityPreviewCard } from './EntityPreviewCard';

describe('EntityPreviewCard', () => {
  it('busca por nombre entre todos los registros', () => {
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
      />,
    );

    fireEvent.changeText(screen.getByTestId('search-domiciliarios'), 'juan');

    expect(screen.getByText('Juancho')).toBeTruthy();
    expect(screen.queryByText('Ana')).toBeNull();
  });

  it('permite mostrar el directorio completo', () => {
    render(
      <EntityPreviewCard
        title="Comercios"
        emptyMessage="Sin comercios"
        items={[
          { id: '1', name: 'Comercio 1' },
          { id: '2', name: 'Comercio 2' },
          { id: '3', name: 'Comercio 3' },
          { id: '4', name: 'Comercio 4' },
        ]}
      />,
    );

    expect(screen.queryByText('Comercio 4')).toBeNull();
    fireEvent.press(screen.getByTestId('toggle-comercios'));
    expect(screen.getByText('Comercio 4')).toBeTruthy();
  });
});
