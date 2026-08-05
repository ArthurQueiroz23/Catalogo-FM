'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import clsx from 'clsx';

interface ComId {
  id: number;
}

interface SortableItemProps {
  id: number;
  children: React.ReactNode;
  handleClassName?: string;
}

function SortableItem({ id, children, handleClassName }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        type="button"
        aria-label="Arrastar para reordenar"
        className={clsx(
          'absolute z-10 flex cursor-grab touch-none items-center justify-center text-gray-300 hover:text-gray-500 active:cursor-grabbing',
          handleClassName
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

interface SortableListProps<T extends ComId> {
  items: T[];
  onReorder: (itensReordenados: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  orientation?: 'vertical' | 'grid';
  className?: string;
  handleClassName?: string;
}

/**
 * Lista/grade reordenável genérica via drag-and-drop, reaproveitada em Categorias, Tamanhos e
 * na galeria de Produtos. `onReorder` recebe o array já na nova ordem — quem chama decide como
 * persistir (normalmente mapeando para `{ id, ordem: index }` e chamando o endpoint de
 * reordenação correspondente).
 */
export function SortableList<T extends ComId>({
  items,
  onReorder,
  renderItem,
  orientation = 'vertical',
  className,
  handleClassName = 'left-2 top-1/2 -translate-y-1/2',
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={orientation === 'vertical' ? verticalListSortingStrategy : rectSortingStrategy}
      >
        <div className={className}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} handleClassName={handleClassName}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
