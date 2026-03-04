import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getReminders,
  saveReminders,
  generateId,
  type Reminder,
} from "@/lib/storage";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newText, setNewText] = useState("");

  useEffect(() => {
    setReminders(getReminders());
    const interval = setInterval(() => setReminders(getReminders()), 60000);
    return () => clearInterval(interval);
  }, []);

  const save = (updated: Reminder[]) => {
    setReminders(updated);
    saveReminders(updated);
  };

  const add = () => {
    const text = newText.trim();
    if (!text) return;
    save([
      { id: generateId(), text, done: false, createdAt: Date.now() },
      ...reminders,
    ]);
    setNewText("");
  };

  const toggle = (id: string) => {
    save(
      reminders.map((r) =>
        r.id === id
          ? { ...r, done: !r.done, doneAt: !r.done ? Date.now() : undefined }
          : r
      )
    );
  };

  const remove = (id: string) => {
    save(reminders.filter((r) => r.id !== id));
  };

  const pending = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-6">Lembretes</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex gap-2 mb-6"
      >
        <Input
          placeholder="Adicionar lembrete..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <AnimatePresence mode="popLayout">
        {pending.map((r) => (
          <ReminderItem
            key={r.id}
            reminder={r}
            onToggle={toggle}
            onRemove={remove}
          />
        ))}
      </AnimatePresence>

      {done.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mt-6 mb-2">
            Feitos (apagam em 48h)
          </p>
          <AnimatePresence mode="popLayout">
            {done.map((r) => (
              <ReminderItem
                key={r.id}
                reminder={r}
                onToggle={toggle}
                onRemove={remove}
              />
            ))}
          </AnimatePresence>
        </>
      )}

      {reminders.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Nenhum lembrete ainda. Adicione um acima!
        </p>
      )}
    </div>
  );
}

function ReminderItem({
  reminder,
  onToggle,
  onRemove,
}: {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 p-3 rounded-2xl mb-2 glass glass-highlight hover:shadow-md transition-all duration-200"
    >
      <Checkbox
        checked={reminder.done}
        onCheckedChange={() => onToggle(reminder.id)}
      />
      <span
        className={`flex-1 text-sm ${
          reminder.done
            ? "line-through text-muted-foreground"
            : "text-foreground"
        }`}
      >
        {reminder.text}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(reminder.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}
