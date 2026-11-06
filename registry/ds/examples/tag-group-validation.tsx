'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Tag, TagGroup } from '@/registry/ds/ui/tag';

const initialCategories = [{ id: 'software', name: 'Software' }];

export default function TagGroupValidation() {
  const [categories, setCategories] = useState(initialCategories);
  const isEmpty = categories.length === 0;

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-3">
      <TagGroup
        label="Expense categories"
        description="Used to group this vendor in reports."
        errorMessage="Add at least one category."
        isInvalid={isEmpty}
        items={categories}
        onRemove={(keys) =>
          setCategories((current) => current.filter((category) => !keys.has(category.id)))
        }
        renderEmptyState={() => (
          <span className="text-body-md text-on-surface-variant">No categories yet</span>
        )}
      >
        {(category) => <Tag id={category.id}>{category.name}</Tag>}
      </TagGroup>
      <Button
        size="xs"
        variant="text"
        isDisabled={!isEmpty}
        onPress={() => setCategories(initialCategories)}
      >
        Add “Software” back
      </Button>
    </div>
  );
}
