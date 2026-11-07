'use client';

import { useState } from 'react';
import { Button } from '@/registry/ds/ui/button';
import { Tag, TagGroup } from '@/registry/ds/ui/tag';

const initialCategories = [{ id: 'travel', name: 'Travel' }];

export default function TagGroupValidation() {
  const [categories, setCategories] = useState(initialCategories);
  const isEmpty = categories.length === 0;

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-3">
      <TagGroup
        label="Categories"
        description="Helps people find this post."
        errorMessage="Add at least one category."
        isInvalid={isEmpty}
        items={categories}
        onRemove={(keys) =>
          setCategories((current) => current.filter((category) => !keys.has(category.id)))
        }
        renderEmptyState={() => (
          <span className="text-sm text-on-surface-variant">No categories yet</span>
        )}
      >
        {(category) => <Tag id={category.id}>{category.name}</Tag>}
      </TagGroup>
      <Button
        size="sm"
        variant="ghost"
        isDisabled={!isEmpty}
        onPress={() => setCategories(initialCategories)}
      >
        Add “Travel” back
      </Button>
    </div>
  );
}
