import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CampusMap, { CampusMapSvg } from './CampusMap';

const COORDINATES = {
  points: [[100, 100], [200, 100], [200, 200], [100, 200]],
  label: { x: 150, y: 150 }
};

const STUDENT_LOT = { id: 'lot-a', code: 'PA', permitType: 'Student', percentFull: 74, status: 'OK', coordinates: COORDINATES };
const STAFF_LOT = { id: 'lot-b', code: 'PB', permitType: 'Staff', percentFull: 30, status: 'OK', coordinates: COORDINATES };
const UPDATING_LOT = { id: 'lot-c', code: 'PC', permitType: 'Student', percentFull: null, status: 'UPDATING', coordinates: COORDINATES };
const UNMAPPED_LOT = { id: 'lot-d', code: 'PD', permitType: 'Student', percentFull: 50, status: 'OK' };

const renderMap = (lots, onSelectLot = () => {}) => {
  const { container } = render(<CampusMap lots={lots} onSelectLot={onSelectLot} />);
  return [...container.querySelectorAll('.map-lot-group')];
};

describe('CampusMap', () => {
  it('draws one clickable shape per lot that has coordinates', () => {
    const groups = renderMap([STUDENT_LOT, STAFF_LOT, UNMAPPED_LOT]);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.querySelector('text').textContent)).toEqual(['PA', 'PB']);
  });

  it('labels each lot with its code and percent full', () => {
    const [group] = renderMap([STUDENT_LOT]);
    const [code, status] = group.querySelectorAll('text');
    expect(code).toHaveTextContent('PA');
    expect(status).toHaveTextContent('74% Full');
    expect(group.querySelector('polygon')).toHaveAttribute('points', '100,100 200,100 200,200 100,200');
  });

  it('fills lots with their permit color, or grey while updating', () => {
    const [student, staff, updating] = renderMap([STUDENT_LOT, STAFF_LOT, UPDATING_LOT]);
    expect(student.querySelector('polygon')).toHaveAttribute('fill', '#16a34a');
    expect(staff.querySelector('polygon')).toHaveAttribute('fill', '#eab308');
    expect(updating.querySelector('polygon')).toHaveAttribute('fill', '#64748b');
    expect(updating.querySelectorAll('text')[1]).toHaveTextContent('Updating...');
  });

  it('passes the lot to onSelectLot when its shape is clicked', async () => {
    const onSelectLot = vi.fn();
    const [, staff] = renderMap([STUDENT_LOT, STAFF_LOT], onSelectLot);
    await userEvent.click(staff);
    expect(onSelectLot).toHaveBeenCalledWith(STAFF_LOT);
  });
});

describe('CampusMap: selection', () => {
  it('outlines the selected lot and dims the rest', () => {
    const { container } = render(
      <CampusMap lots={[STUDENT_LOT, STAFF_LOT]} onSelectLot={() => {}} selectedLotId="lot-b" />
    );
    const [student, staff] = container.querySelectorAll('.map-lot-group');
    expect(staff).toHaveClass('selected');
    expect(staff.querySelector('polygon')).toHaveAttribute('stroke-width', '4');
    expect(student).not.toHaveClass('selected');
    expect(student.querySelector('polygon')).toHaveAttribute('stroke-width', '2.4');
    expect(container.querySelector('svg')).toHaveClass('has-selection');
  });

  it('shows the whole map with nothing selected by default', () => {
    const { container } = render(<CampusMap lots={[STUDENT_LOT]} onSelectLot={() => {}} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toHaveClass('has-selection');
    expect(svg).toHaveAttribute('viewBox', '0 0 1000 612');
    expect(container.querySelector('.map-lot-group.selected')).toBeNull();
  });
});

describe('CampusMapSvg', () => {
  it('uses a custom view box to zoom in', () => {
    const { container } = render(
      <CampusMapSvg lots={[STUDENT_LOT]} onSelectLot={() => {}} viewBox="50 50 300 150" />
    );
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '50 50 300 150');
  });

  it('passes the lot to onSelectLot when its shape is clicked', async () => {
    const onSelectLot = vi.fn();
    const { container } = render(<CampusMapSvg lots={[STUDENT_LOT]} onSelectLot={onSelectLot} />);
    await userEvent.click(container.querySelector('.map-lot-group'));
    expect(onSelectLot).toHaveBeenCalledWith(STUDENT_LOT);
  });
});
