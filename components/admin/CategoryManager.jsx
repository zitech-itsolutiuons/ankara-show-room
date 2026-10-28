"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Btn, Card, inputCls } from "@/components/admin/ui";

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `category-${Date.now()}-${Math.random()}`);

export default function CategoryManager({ categories, variants, onChange }) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  const hasDuplicateName = (name, ignoreId) =>
    categories.some((category) => category.id !== ignoreId && category.name.trim().toLowerCase() === name.trim().toLowerCase());

  const addCategory = (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return setError("Enter a category name.");
    if (name.length > 40) return setError("Category names can be up to 40 characters.");
    if (categories.length >= 30) return setError("You can create up to 30 categories.");
    if (hasDuplicateName(name)) return setError("A category with that name already exists.");
    onChange([...categories, { id: uid(), name }], variants);
    setNewName("");
    setError("");
  };

  const saveEdit = (event) => {
    event.preventDefault();
    const name = editName.trim();
    if (!name) return setError("Enter a category name.");
    if (name.length > 40) return setError("Category names can be up to 40 characters.");
    if (hasDuplicateName(name, editingId)) return setError("A category with that name already exists.");
    onChange(categories.map((category) => category.id === editingId ? { ...category, name } : category), variants);
    setEditingId(null);
    setError("");
  };

  const moveCategory = (index, direction) => {
    const destination = index + direction;
    if (destination < 0 || destination >= categories.length) return;
    const next = [...categories];
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next, variants);
  };

  const deleteCategory = (category) => {
    if (categories.length <= 1) return;
    const remaining = categories.filter((item) => item.id !== category.id);
    const destination = remaining[0];
    const reassigned = variants.map((variant) => (
      variant.categoryId === category.id ? { ...variant, categoryId: destination.id } : variant
    ));
    if (!window.confirm(`Delete "${category.name}"? Clothes in this category will move to "${destination.name}".`)) return;
    onChange(remaining, reassigned);
    if (editingId === category.id) setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <Card
        title="Collection categories"
        desc="Create, rename, reorder, and remove the filters shown in the collection. Assign each colourway to a category from its editor."
      >
        <form onSubmit={addCategory} className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="new-collection-category">New category name</label>
          <input
            id="new-collection-category"
            className={inputCls}
            value={newName}
            onChange={(event) => { setNewName(event.target.value); setError(""); }}
            maxLength={40}
            placeholder="e.g. Occasion wear"
            disabled={categories.length >= 30}
          />
          <Btn type="submit" disabled={!newName.trim() || categories.length >= 30} className="shrink-0">
            <Plus size={15} /> Add category
          </Btn>
        </form>

        {error && <p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}

        <ul className="mt-5 divide-y divide-white/10">
          {categories.map((category, index) => {
            const count = variants.filter((variant) => variant.categoryId === category.id).length;
            return (
              <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  {editingId === category.id ? (
                    <form onSubmit={saveEdit} className="flex gap-2">
                      <label className="sr-only" htmlFor={`edit-category-${category.id}`}>Category name</label>
                      <input
                        id={`edit-category-${category.id}`}
                        className={inputCls}
                        value={editName}
                        onChange={(event) => { setEditName(event.target.value); setError(""); }}
                        maxLength={40}
                        autoFocus
                      />
                      <button type="submit" aria-label="Save category name" className="rounded-lg p-2 text-white/75 hover:bg-white/10 hover:text-white">
                        <Check size={17} />
                      </button>
                      <button type="button" aria-label="Cancel category rename" onClick={() => { setEditingId(null); setError(""); }} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white">
                        <X size={17} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <p className="truncate text-sm font-medium">{category.name}</p>
                      <p className="mt-0.5 text-xs text-white/50">{count} {count === 1 ? "colourway" : "colourways"}</p>
                    </>
                  )}
                </div>
                {editingId !== category.id && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" aria-label={`Move ${category.name} up`} onClick={() => moveCategory(index, -1)} disabled={index === 0} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                      <ArrowUp size={16} />
                    </button>
                    <button type="button" aria-label={`Move ${category.name} down`} onClick={() => moveCategory(index, 1)} disabled={index === categories.length - 1} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Rename ${category.name}`}
                      onClick={() => { setEditingId(category.id); setEditName(category.name); setError(""); }}
                      className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => deleteCategory(category)}
                      disabled={categories.length <= 1}
                      title={categories.length <= 1 ? "At least one category is required" : ""}
                      className="rounded-lg p-2 text-white/60 hover:bg-red-500/15 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
