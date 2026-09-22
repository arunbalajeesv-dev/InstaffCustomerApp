/**
 * @format
 */

import { useCartStore } from '../src/store/useCartStore';

const service = { id: 'svc-1', name: 'Opening/Closing Cleaning', category: 'Cleaning' };
const tier = {
  id: 'tier-small',
  serviceId: 'svc-1',
  facilitySize: 'Small',
  professionals: 2,
  durationHours: 2,
  price: 1500,
};

const baseItem = {
  service,
  tier,
  addons: [],
  date: '2024-01-15',
  dateDisplay: 'Mon, Jan 15',
  startTime: '9:00 AM',
  endTime: '11:00 AM',
  startTime24: '09:00:00',
  endTime24: '11:00:00',
  linePrice: 1500,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

test('addItem appends the item and returns its generated id', () => {
  const id = useCartStore.getState().addItem(baseItem);

  const items = useCartStore.getState().items;
  expect(items).toHaveLength(1);
  expect(items[0].id).toBe(id);
  expect(items[0]).toMatchObject(baseItem);
});

test('addItem called twice keeps both entries, even for the same service', () => {
  useCartStore.getState().addItem(baseItem);
  useCartStore.getState().addItem({ ...baseItem, startTime: '3:00 PM', endTime: '5:00 PM' });

  expect(useCartStore.getState().items).toHaveLength(2);
});

test('updateItem replaces the item in place, keeping its id and position', () => {
  const id = useCartStore.getState().addItem(baseItem);
  useCartStore.getState().addItem({ ...baseItem, startTime: '3:00 PM' });

  useCartStore.getState().updateItem(id, { ...baseItem, linePrice: 2000 });

  const items = useCartStore.getState().items;
  expect(items).toHaveLength(2);
  expect(items[0].id).toBe(id);
  expect(items[0].linePrice).toBe(2000);
});

test('removeItem removes only the matching item', () => {
  const id = useCartStore.getState().addItem(baseItem);
  useCartStore.getState().addItem({ ...baseItem, startTime: '3:00 PM' });

  useCartStore.getState().removeItem(id);

  const items = useCartStore.getState().items;
  expect(items).toHaveLength(1);
  expect(items[0].startTime).toBe('3:00 PM');
});
