import type { Active, UniqueIdentifier } from '@dnd-kit/core';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { ReactNode } from 'react';
import React, { useMemo, useState } from 'react';

import { DragHandle, SortableItem, SortableOverlay } from './components';

interface BaseItem {
  id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
  items: T[];
  onChange(from: number, to: number): void;
  renderItem(item: T, index: number): ReactNode;
}

export function SortableList<T extends BaseItem>({
  items,
  onChange,
  renderItem,
}: Props<T>) {
  const [active, setActive] = useState<Active | null>(null);

  const activeDetails = useMemo(() => {
    const index = items.findIndex((item) => item.id === active?.id);
    return index !== -1 ? { item: items[index], index } : null;
  }, [active, items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        setActive(active);
      }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);

          onChange(activeIndex, overIndex);
        }
        setActive(null);
      }}
      onDragCancel={() => {
        setActive(null);
      }}
    >
      <SortableContext items={items}>
        <ul>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderItem(item, index)}
            </React.Fragment>
          ))}
        </ul>
      </SortableContext>
      <SortableOverlay>
        {activeDetails?.item
          ? renderItem(activeDetails?.item, activeDetails?.index)
          : null}
      </SortableOverlay>
    </DndContext>
  );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
