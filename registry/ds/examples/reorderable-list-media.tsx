import { ReorderableList } from '@/registry/ds/ui/reorderable-list';

const scenes = [
  { id: 'lagoon', title: 'A quieter morning', detail: 'Lagoon · 3 min' },
  { id: 'dusk', title: 'The last light', detail: 'Dusk · 4 min' },
  { id: 'moss', title: 'Somewhere green', detail: 'Moss · 2 min' },
  { id: 'dune', title: 'Room to wander', detail: 'Dune · 5 min' },
];

export default function ReorderableListMedia() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-5">
        <p className="mb-1 text-xs font-medium text-on-surface-variant">THE SLOW COLLECTION</p>
        <h3 className="text-xl font-semibold tracking-tight text-on-surface">
          A change of scenery.
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Four small escapes. You choose the order.
        </p>
      </div>
      <ReorderableList
        aria-label="Scene order"
        defaultValue={scenes}
        getKey={(scene) => scene.id}
        getTextValue={(scene) => scene.title}
      >
        {(scene, index) => (
          <>
            <img
              src={`/samples/${scene.id}.jpg`}
              alt=""
              width={64}
              height={64}
              draggable={false}
              className="size-14 shrink-0 rounded-item object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{scene.title}</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">{scene.detail}</p>
            </div>
            <span aria-hidden="true" className="text-xs text-on-surface-variant tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
          </>
        )}
      </ReorderableList>
    </div>
  );
}
