"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Globe, 
  Sun, 
  Moon, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  MoreHorizontal,
  Check,
  LayoutDashboard,
  Filter,
  Zap,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  date: string;
  category: string;
}

const INITIAL_DATA: Subscription[] = [
  { id: '1', name: 'Google AI Pro', cost: 20, date: '2024-03-01', category: 'productivity' },
  { id: '2', name: 'CapCut Pro', cost: 9.99, date: '2024-03-15', category: 'productivity' },
  { id: '3', name: 'Netflix', cost: 15.49, date: '2024-03-10', category: 'streaming' },
];

export default function SubscriptionManager() {
  const { t, theme, toggleTheme, language, setLanguage, formatCurrency, formatDate } = useApp();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [filter, setFilter] = useState('all');

  // Form states
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('streaming');

  useEffect(() => {
    const saved = localStorage.getItem('subscriptions');
    if (saved) {
      try {
        setSubscriptions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse subscriptions", e);
        setSubscriptions(INITIAL_DATA);
      }
    } else {
      setSubscriptions(INITIAL_DATA);
    }
  }, []);

  const saveToLocal = (newSubs: Subscription[]) => {
    setSubscriptions(newSubs);
    localStorage.setItem('subscriptions', JSON.stringify(newSubs));
  };

  const handleSave = () => {
    const parsedCost = parseFloat(cost);
    if (!name || isNaN(parsedCost) || parsedCost < 0) return;

    if (editingSub) {
      const updated = subscriptions.map(s => 
        s.id === editingSub.id ? { ...s, name, cost: parsedCost, date, category } : s
      );
      saveToLocal(updated);
    } else {
      const newSub: Subscription = {
        id: crypto.randomUUID(),
        name,
        cost: parsedCost,
        date,
        category
      };
      saveToLocal([...subscriptions, newSub]);
    }
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const filtered = subscriptions.filter(s => s.id !== id);
    saveToLocal(filtered);
  };

  const startEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setCost(sub.cost.toString());
    setDate(sub.date);
    setCategory(sub.category);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSub(null);
    setName('');
    setCost('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('streaming');
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || parseFloat(value) >= 0) {
      setCost(value);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    if (filter === 'all') return subscriptions;
    return subscriptions.filter(s => s.category === filter);
  }, [subscriptions, filter]);

  const totalMonthlySpend = useMemo(() => 
    subscriptions.reduce((acc, curr) => acc + curr.cost, 0)
  , [subscriptions]);

  const chartData = useMemo(() => {
    const months = language === 'en' 
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    return months.map(month => ({
      name: month,
      total: totalMonthlySpend,
    }));
  }, [totalMonthlySpend, language]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col gap-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-reveal">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="h-6 w-6 text-primary-foreground fill-primary-foreground" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter">{t('title')}</h1>
            </div>
            <p className="text-muted-foreground font-medium text-sm">
              {t('subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-xl h-11 w-11 border border-border/40 hover:bg-accent"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 border border-border/40 hover:bg-accent">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border/40 backdrop-blur-xl">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="flex justify-between items-center cursor-pointer m-1">
                  English (USD) {language === 'en' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')} className="flex justify-between items-center cursor-pointer m-1">
                  Español (EUR) {language === 'es' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-11 px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/10">
                  <Plus className="h-4 w-4 stroke-[3px]" />
                  {t('addSubscription')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[440px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {editingSub ? t('editSubscription') : t('addSubscription')}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid gap-2.5">
                    <Label htmlFor="name" className="text-sm font-semibold">{t('serviceName')}</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-12" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2.5">
                      <Label htmlFor="cost" className="text-sm font-semibold">{t('cost')}</Label>
                      <Input 
                        id="cost" 
                        type="number" 
                        value={cost} 
                        onChange={handleCostChange}
                        onKeyDown={(e) => ["e", "E", "-", "+"].includes(e.key) && e.preventDefault()}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="grid gap-2.5">
                      <Label htmlFor="category" className="text-sm font-semibold">{t('category')}</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" className="rounded-xl h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="streaming">{t('categories.streaming')}</SelectItem>
                          <SelectItem value="productivity">{t('categories.productivity')}</SelectItem>
                          <SelectItem value="gaming">{t('categories.gaming')}</SelectItem>
                          <SelectItem value="utilities">{t('categories.utilities')}</SelectItem>
                          <SelectItem value="other">{t('categories.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2.5">
                    <Label htmlFor="date" className="text-sm font-semibold">{t('billingDate')}</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl h-12" />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">{t('cancel')}</Button>
                  <Button onClick={handleSave} className="rounded-xl bg-primary text-primary-foreground font-bold">{t('save')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-reveal delay-1">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/20 p-8 rounded-[2rem] relative overflow-hidden h-[200px] flex flex-col justify-end">
              <TrendingUp className="absolute top-6 right-6 w-20 h-20 opacity-10 rotate-12" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/60 mb-1">{t('monthlyTotal')}</p>
              <h2 className="text-5xl font-black tracking-tighter mb-4">{formatCurrency(totalMonthlySpend)}</h2>
              <div className="flex gap-4 border-t border-primary-foreground/10 pt-4">
                <div>
                  <p className="text-[9px] font-bold uppercase text-primary-foreground/40">{t('subscriptions')}</p>
                  <p className="text-lg font-bold">{subscriptions.length}</p>
                </div>
                <div className="w-px bg-primary-foreground/10" />
                <div>
                  <p className="text-[9px] font-bold uppercase text-primary-foreground/40">{t('projectedAnnual')}</p>
                  <p className="text-lg font-bold">{formatCurrency(totalMonthlySpend * 12)}</p>
                </div>
              </div>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-sm rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" /> Filters
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'streaming', 'productivity', 'gaming', 'utilities', 'other'].map((cat) => (
                  <Button 
                    key={cat}
                    variant={filter === cat ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "rounded-xl text-xs font-bold px-4 h-9",
                      filter === cat ? "bg-foreground text-background" : "bg-accent/10 text-foreground hover:bg-accent/20"
                    )}
                  >
                    {cat === 'all' ? 'All' : t(`categories.${cat}`)}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm rounded-[2rem] p-8 h-full shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold tracking-tight">{t('chartTitle')}</h3>
              </div>
              <div className="h-[240px] w-full">
                <ChartContainer config={{ total: { label: "Spend", color: "hsl(var(--primary))" } }}>
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="currentColor" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      className="opacity-50 font-bold"
                    />
                    <YAxis 
                      stroke="currentColor" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      className="opacity-50 font-bold"
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--primary))" opacity={0.6 + (index / 12) * 0.4} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </Card>
          </div>
        </section>

        {/* Subscriptions List */}
        <section className="space-y-6 animate-reveal delay-2">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            {t('subscriptions')}
            <Badge variant="secondary" className="rounded-lg font-bold bg-primary/10 text-primary border-none">
              {filteredSubscriptions.length}
            </Badge>
          </h2>

          {filteredSubscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/40 rounded-[2.5rem] bg-accent/5">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold opacity-60">{t('noSubscriptions')}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubscriptions.map((sub) => (
                <Card key={sub.id} className="group border-border/40 hover:border-primary/40 bg-card/40 hover:bg-card rounded-[2rem] p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden flex flex-col justify-between min-h-[190px]">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1.5">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0 text-[10px] font-bold uppercase tracking-widest rounded-md">
                        {t(`categories.${sub.category}`)}
                      </Badge>
                      <h4 className="text-xl font-black tracking-tighter group-hover:text-primary transition-colors">
                        {sub.name}
                      </h4>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-border/40">
                        <DropdownMenuItem onClick={() => startEdit(sub)} className="gap-2 cursor-pointer m-1">
                          <Edit2 className="h-3 w-3" /> {t('editSubscription')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(sub.id)} className="gap-2 text-destructive cursor-pointer m-1">
                          <Trash2 className="h-3 w-3" /> {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-8 flex items-center justify-between relative z-10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black">{formatCurrency(sub.cost)}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">/mo</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-xl border border-border/20">
                      <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-bold opacity-80">{formatDate(sub.date)}</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
                </Card>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 pt-10 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 animate-reveal delay-3">
          <p className="text-xs font-bold tracking-wider">© {new Date().getFullYear()} SubscriBoost · Pro Suite</p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Analytics</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
