import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getBills,
  saveBills,
  generateId,
  type Bill,
} from "@/lib/storage";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function BillsPage() {
  const now = new Date();
  const [bills, setBills] = useState<Bill[]>([]);
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [recurring, setRecurring] = useState(false);

  useEffect(() => {
    setBills(getBills());
  }, []);

  const save = (updated: Bill[]) => {
    setBills(updated);
    saveBills(updated);
  };

  const addBill = () => {
    if (!name.trim() || !amount || !dueDay) return;
    save([
      ...bills,
      {
        id: generateId(),
        name: name.trim(),
        amount: parseFloat(amount),
        dueDay: parseInt(dueDay),
        recurring,
        paid: false,
        month,
        year,
        createdAt: Date.now(),
      },
    ]);
    setName("");
    setAmount("");
    setDueDay("");
    setRecurring(false);
    setDialogOpen(false);
  };

  const togglePaid = (id: string) => {
    save(bills.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)));
  };

  const removeBill = (id: string) => {
    save(bills.filter((b) => b.id !== id));
  };

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Get bills for current month: specific + recurring from any month
  const monthBills = bills.filter((b) => {
    if (b.month === month && b.year === year) return true;
    if (b.recurring) {
      // Show recurring if created on or before this month
      const createdDate = new Date(b.createdAt);
      const createdMonth = createdDate.getMonth();
      const createdYear = createdDate.getFullYear();
      if (year > createdYear || (year === createdYear && month >= createdMonth)) {
        // Check not already a specific entry for this month
        const hasSpecific = bills.some(
          (other) =>
            other.name === b.name &&
            other.month === month &&
            other.year === year &&
            other.id !== b.id
        );
        return !hasSpecific;
      }
    }
    return false;
  });

  const unpaid = monthBills.filter((b) => !b.paid);
  const paid = monthBills.filter((b) => b.paid);
  const total = monthBills.reduce((s, b) => s + b.amount, 0);
  const totalPaid = paid.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Contas</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Conta</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addBill();
              }}
              className="space-y-4 mt-2"
            >
              <div>
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Luz, Internet..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Label>Dia vcto.</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="15"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={recurring}
                  onCheckedChange={setRecurring}
                  id="recurring"
                />
                <Label htmlFor="recurring">Recorrente (todo mês)</Label>
              </div>
              <Button type="submit" className="w-full">
                Adicionar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-center gap-4 mb-6 bg-card border rounded-lg p-3">
        <Button variant="ghost" size="icon" onClick={prev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-display font-semibold text-lg min-w-[160px] text-center">
          {MONTH_NAMES[month]} {year}
        </span>
        <Button variant="ghost" size="icon" onClick={next}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      {monthBills.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-display font-bold text-lg">
              R$ {total.toFixed(2)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Pago</p>
            <p className="font-display font-bold text-lg text-success">
              R$ {totalPaid.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {unpaid.map((bill) => (
          <BillItem
            key={bill.id}
            bill={bill}
            onToggle={togglePaid}
            onRemove={removeBill}
          />
        ))}
      </AnimatePresence>

      {paid.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mt-4 mb-2">Pagas</p>
          <AnimatePresence mode="popLayout">
            {paid.map((bill) => (
              <BillItem
                key={bill.id}
                bill={bill}
                onToggle={togglePaid}
                onRemove={removeBill}
              />
            ))}
          </AnimatePresence>
        </>
      )}

      {monthBills.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Nenhuma conta para {MONTH_NAMES[month]}.
        </p>
      )}
    </div>
  );
}

function BillItem({
  bill,
  onToggle,
  onRemove,
}: {
  bill: Bill;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 p-3 rounded-lg mb-2 bg-card border hover:shadow-sm transition-shadow"
    >
      <Checkbox checked={bill.paid} onCheckedChange={() => onToggle(bill.id)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-medium ${
              bill.paid ? "line-through text-muted-foreground" : ""
            }`}
          >
            {bill.name}
          </span>
          {bill.recurring && (
            <RotateCcw className="h-3 w-3 text-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Dia {bill.dueDay} · R$ {bill.amount.toFixed(2)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(bill.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}
