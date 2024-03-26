import type {
  DraggableSyntheticListeners,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { IconButton } from '@mui/joy';
import type { CSSProperties, PropsWithChildren } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
interface Props {
  id: UniqueIdentifier;
}

interface Context {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
});

export function SortableItem({ children, id }: PropsWithChildren<Props>) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  );
  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <SortableItemContext.Provider value={context}>
      <li className="flex w-full" ref={setNodeRef} style={style}>
        {children}
      </li>
    </SortableItemContext.Provider>
  );
}

export function DragHandle({ style = {} }: { style?: Record<string, any> }) {
  const { attributes, listeners, ref } = useContext(SortableItemContext);

  return (
    <IconButton
      size="sm"
      {...attributes}
      {...listeners}
      ref={ref}
      style={style}
    >
      <DragIndicatorIcon fontSize="sm" shapeRendering="circle" />
    </IconButton>
  );
}
