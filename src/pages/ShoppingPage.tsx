import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ShoppingCart, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  getShoppingLists,
  saveShoppingLists,
  generateId,
  type ShoppingList,
} from "@/lib/storage";

export default function ShoppingPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    setLists(getShoppingLists());
  }, []);

  const save = (updated: ShoppingList[]) => {
    setLists(updated);
    saveShoppingLists(updated);
  };

  const addList = () => {
    const name = newListName.trim();
    if (!name) return;
    save([...lists, { id: generateId(), name, items: [], createdAt: Date.now() }]);
    setNewListName("");
  };

  const removeList = (id: string) => {
    save(lists.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selected = lists.find((l) => l.id === selectedId);

  const addItem = () => {
    const text = newItemText.trim();
    if (!text || !selected) return;
    save(
      lists.map((l) =>
        l.id === selected.id
          ? { ...l, items: [...l.items, { id: generateId(), text, done: false }] }
          : l
      )
    );
    setNewItemText("");
  };

  const toggleItem = (itemId: string) => {
    if (!selected) return;
    save(
      lists.map((l) =>
        l.id === selected.id
          ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) }
          : l
      )
    );
  };

  const removeItem = (itemId: string) => {
    if (!selected) return;
    save(
      lists.map((l) =>
        l.id === selected.id
          ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
          : l
      )
    );
  };

  if (selected) {
    const current = lists.find((l) => l.id === selectedId)!;
    return (
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          {current.name}
        </h1>

        <form onSubmit={(e) => { e.preventDefault(); addItem(); }} className="flex gap-2 mb-6">
          <Input placeholder="Adicionar item..." value={newItemText} onChange={(e) => setNewItemText(e.target.value)} className="flex-1" />
          <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
        </form>

        <AnimatePresence mode="popLayout">
          {current.items.filter(i => !i.done).map((item) => (
            <motion.div
              key={item.id} layout
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 p-3 rounded-2xl mb-2 glass glass-highlight"
            >
              <Checkbox checked={item.done} onCheckedChange={() => toggleItem(item.id)} />
              <span className="flex-1 text-sm">{item.text}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {current.items.filter(i => i.done).length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mt-4 mb-2">Feitos</p>
            {current.items.filter(i => i.done).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl mb-2 glass-subtle opacity-60">
                <Checkbox checked={item.done} onCheckedChange={() => toggleItem(item.id)} />
                <span className="flex-1 text-sm line-through text-muted-foreground">{item.text}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </>
        )}

        {current.items.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Lista vazia. Adicione itens acima!</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-6">Listas de Compras</h1>

      <form onSubmit={(e) => { e.preventDefault(); addList(); }} className="flex gap-2 mb-6">
        <Input placeholder="Nova lista (ex: Supermercado)..." value={newListName} onChange={(e) => setNewListName(e.target.value)} className="flex-1" />
        <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
      </form>

      <AnimatePresence mode="popLayout">
        {lists.map((list) => (
          <motion.div key={list.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card
              className="p-4 mb-3 cursor-pointer hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
              onClick={() => setSelectedId(list.id)}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{list.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {list.items.length} {list.items.length === 1 ? "item" : "itens"}
                    {list.items.filter(i => i.done).length > 0 && ` · ${list.items.filter(i => i.done).length} feito(s)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); removeList(list.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {lists.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Nenhuma lista ainda. Crie uma acima!</p>
      )}
    </div>
  );
}
