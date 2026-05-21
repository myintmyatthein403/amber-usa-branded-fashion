export interface CategoryNode {
  id: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CategoryTreeNode extends CategoryNode {
  children: CategoryTreeNode[];
}

/** Walk ancestors to build e.g. "Women > Clothing > Dresses". */
export function buildCategoryPath(
  categories: CategoryNode[],
  categoryId: string,
): string {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const parts: string[] = [];
  const visited = new Set<string>();
  let current = byId.get(categoryId);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    parts.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return parts.join(' > ');
}

/** Nesting depth (0 = root). */
export function getCategoryDepth(
  categories: CategoryNode[],
  categoryId: string,
): number {
  const byId = new Map(categories.map((c) => [c.id, c]));
  let depth = 0;
  const visited = new Set<string>();
  let current = byId.get(categoryId);

  while (current?.parentId && !visited.has(current.id)) {
    visited.add(current.id);
    depth += 1;
    current = byId.get(current.parentId);
  }

  return depth;
}

/** All descendant ids (not including the category itself). */
export function getCategoryDescendantIds(
  categories: CategoryNode[],
  categoryId: string,
): string[] {
  const ids: string[] = [];
  const queue = [categoryId];

  while (queue.length > 0) {
    const parentId = queue.shift()!;
    for (const cat of categories) {
      if (cat.parentId === parentId && !ids.includes(cat.id)) {
        ids.push(cat.id);
        queue.push(cat.id);
      }
    }
  }

  return ids;
}

/** Self + all descendants — for storefront parent filtering. */
export function getCategoryScopeIds(
  categories: CategoryNode[],
  categoryId: string,
): string[] {
  return [categoryId, ...getCategoryDescendantIds(categories, categoryId)];
}

export function sortCategoriesHierarchically<T extends CategoryNode>(categories: T[]): T[] {
  const roots = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));

  const result: T[] = [];

  const append = (node: T) => {
    result.push(node);
    categories
      .filter((c) => c.parentId === node.id)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name))
      .forEach((child) => append(child as T));
  };

  roots.forEach(append);
  return result;
}

export function buildCategoryTree<T extends CategoryNode>(categories: T[]): CategoryTreeNode[] {
  const byParent = new Map<string | null, T[]>();

  for (const cat of categories) {
    const key = cat.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(cat);
  }

  const sortSiblings = (list: T[]) =>
    [...list].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name),
    );

  const build = (parentId: string | null): CategoryTreeNode[] =>
    sortSiblings(byParent.get(parentId) ?? []).map((cat) => ({
      ...cat,
      children: build(cat.id),
    }));

  return build(null);
}

/** Option label with `--` prefix by depth for selects. */
export function formatCategoryOptionLabel(
  categories: CategoryNode[],
  category: CategoryNode,
): string {
  const depth = getCategoryDepth(categories, category.id);
  const prefix = depth > 0 ? `${'-- '.repeat(depth)}` : '';
  return `${prefix}${category.name}`;
}

/** Parent options for admin form — excludes self and descendants. */
export interface CategoryReorderFlatItem {
  id: string;
  parentId: string | null;
  displayOrder: number;
}

/** Flatten tree to API reorder payload (depth-first, sibling order preserved). */
export function flattenCategoryTree(tree: CategoryTreeNode[]): CategoryReorderFlatItem[] {
  const result: CategoryReorderFlatItem[] = [];

  const walk = (nodes: CategoryTreeNode[], parentId: string | null) => {
    nodes.forEach((node, index) => {
      result.push({
        id: node.id,
        parentId,
        displayOrder: index,
      });
      if (node.children.length > 0) {
        walk(node.children, node.id);
      }
    });
  };

  walk(tree, null);
  return result;
}

/** Whether draggedId may be moved under newParentId (null = root). */
export function canReparent(
  categories: CategoryNode[],
  draggedId: string,
  newParentId: string | null,
): boolean {
  if (newParentId === null) return true;
  if (draggedId === newParentId) return false;
  const descendants = getCategoryDescendantIds(categories, draggedId);
  return !descendants.includes(newParentId);
}

export function getSelectableParentCategories<T extends CategoryNode>(
  categories: T[],
  editingCategoryId?: string,
): T[] {
  if (!editingCategoryId) {
    return sortCategoriesHierarchically(categories.filter((c) => c.isActive !== false));
  }

  const exclude = new Set([
    editingCategoryId,
    ...getCategoryDescendantIds(categories, editingCategoryId),
  ]);

  return sortCategoriesHierarchically(
    categories.filter((c) => !exclude.has(c.id) && c.isActive !== false),
  );
}
