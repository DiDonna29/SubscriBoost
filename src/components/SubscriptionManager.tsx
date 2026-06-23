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
  ArrowUpRight
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

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  date: string;
  category: string;
}

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
      }
    }
  }, []);

  const saveToLocal = (newSubs: Subscription[]) => {
    setSubscriptions(newSubs);
    localStorage.setItem('subscriptions', JSON.stringify(newSubs));
  };

  const handleSave = () => {
    if (!name || !cost) return;

    if (editingSub) {
      const updated = subscriptions.map(s => 
        s.id === editingSub.id ? { ...s, name, cost: parseFloat(cost), date, category } : s
      );
      saveToLocal(updated);
    } else {
      const newSub: Subscription = {
        id: crypto.randomUUID(),
        name,
        cost: parseFloat(cost),
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

  const filteredSubscriptions = useMemo(() => {
    if (filter === 'all') return subscriptions;
    return subscriptions.filter(s => s.category === filter);
  }, [subscriptions, filter]);

  const totalMonthlySpend = subscriptions.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-20 flex flex-col gap-12">
        
        {/* Navigation & Brand */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 animate-reveal">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">{t('title')}</h1>
            </div>
            <p className="text-muted-foreground font-medium text-sm md:text-base">
              {t('subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-xl h-11 w-11 hover:bg-accent transition-all duration-300"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 hover:bg-accent transition-all duration-300">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border/40 backdrop-blur-xl">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="flex justify-between items-center cursor-pointer rounded-lg m-1">
                  English {language === 'en' && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')} className="flex justify-between items-center cursor-pointer rounded-lg m-1">
                  Español {language === 'es' && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open) resetForm();
              setIsDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-11 px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/10 transition-all duration-500 hover:scale-[1.02] active:scale-95">
                  <Plus className="h-4 w-4 stroke-[3px]" />
                  {t('addSubscription')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[440px] rounded-2xl border-border/40 backdrop-blur-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {editingSub ? t('editSubscription') : t('addSubscription')}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid gap-2.5">
                    <Label htmlFor="name" className="text-sm font-semibold ml-1">{t('serviceName')}</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Netflix, Spotify..."
                      className="rounded-xl border-border/40 h-12 px-4 focus:ring-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2.5">
                      <Label htmlFor="cost" className="text-sm font-semibold ml-1">{t('cost')}</Label>
                      <Input 
                        id="cost" 
                        type="number" 
                        value={cost} 
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0.00"
                        className="rounded-xl border-border/40 h-12 px-4"
                      />
                    </div>
                    <div className="grid gap-2.5">
                      <Label htmlFor="category" className="text-sm font-semibold ml-1">{t('category')}</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" className="rounded-xl border-border/40 h-12 px-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40">
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
                    <Label htmlFor="date" className="text-sm font-semibold ml-1">{t('billingDate')}</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-xl border-border/40 h-12 px-4"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 px-6">{t('cancel')}</Button>
                  <Button onClick={handleSave} className="rounded-xl h-11 px-8 bg-primary text-primary-foreground font-bold">{t('save')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Stats (Left Column) */}
          <section className="lg:col-span-4 space-y-6 animate-reveal delay-1">
            <Card className="border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/20 overflow-hidden relative min-h-[220px] flex flex-col justify-end p-8 rounded-3xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp className="w-24 h-24 rotate-12" />
              </div>
              <div className="relative z-10 space-y-1">
                <p className="text-primary-foreground/70 font-bold uppercase tracking-widest text-[10px]">
                  {t('monthlyTotal')}
                </p>
                <div className="flex items-baseline gap-1">
                  <h2 className="text-5xl font-black tracking-tighter">
                    {formatCurrency(totalMonthlySpend)}
                  </h2>
                </div>
                <div className="pt-4 flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-primary-foreground/50">{t('subscriptions')}</span>
                    <span className="text-lg font-bold leading-none">{subscriptions.length}</span>
                  </div>
                  <div className="w-px h-8 bg-primary-foreground/20" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-primary-foreground/50">Average</span>
                    <span className="text-lg font-bold leading-none">
                      {subscriptions.length > 0 ? formatCurrency(totalMonthlySpend / subscriptions.length) : formatCurrency(0)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-border/40 bg-card/40 backdrop-blur rounded-3xl p-6 shadow-xl shadow-black/[0.02]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </h3>
                {filter !== 'all' && (
                  <Button variant="ghost" size="sm" onClick={() => setFilter('all')} className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground">
                    Reset
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'streaming', 'productivity', 'gaming', 'utilities', 'other'].map((cat) => (
                  <Button 
                    key={cat}
                    variant={filter === cat ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "rounded-lg text-xs font-semibold h-8 transition-all px-4",
                      filter === cat ? "bg-foreground text-background shadow-md" : "bg-accent/50 hover:bg-accent"
                    )}
                  >
                    {cat === 'all' ? 'All Services' : t(`categories.${cat}`)}
                  </Button>
                ))}
              </div>
            </Card>
          </section>

          {/* Subscriptions List (Right Column) */}
          <section className="lg:col-span-8 space-y-8 animate-reveal delay-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                {t('subscriptions')}
                <Badge variant="secondary" className="rounded-md font-bold px-2 py-0 h-5 text-[10px] bg-accent">
                  {filteredSubscriptions.length}
                </Badge>
              </h2>
            </div>

            {filteredSubscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/60 rounded-[2.5rem] bg-accent/20">
                <div className="bg-card h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 border border-border/40">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold mb-1">{t('noSubscriptions')}</h3>
                <p className="text-muted-foreground text-sm max-w-[280px]">
                  Start tracking your services by clicking the add button above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredSubscriptions.map((sub, i) => (
                  <Card key={sub.id} className="group border-border/40 hover:border-primary/40 bg-card/50 hover:bg-card rounded-[2rem] p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                    <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0 text-[10px] font-bold uppercase tracking-wider rounded-md">
                          {t(`categories.${sub.category}`)}
                        </Badge>
                        <h4 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">
                          {sub.name}
                        </h4>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border/40 backdrop-blur-xl">
                          <DropdownMenuItem onClick={() => startEdit(sub)} className="gap-2 rounded-lg cursor-pointer">
                            <Edit2 className="h-3 w-3" /> {t('editSubscription')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(sub.id)} className="gap-2 text-destructive rounded-lg cursor-pointer">
                            <Trash2 className="h-3 w-3" /> {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-8 flex items-center justify-between relative z-10">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black">{formatCurrency(sub.cost)}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">/mo</span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-accent/40 px-3 py-1.5 rounded-xl border border-border/20">
                        <CalendarIcon className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-foreground/80">{formatDate(sub.date)}</span>
                      </div>
                    </div>

                    {/* Aesthetic Background Element */}
                    <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer info */}
        <footer className="mt-20 pt-12 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6 animate-reveal delay-3">
          <p className="text-xs font-bold text-muted-foreground/60 flex items-center gap-2">
            © {new Date().getFullYear()} SubscriBoost · <ArrowUpRight className="h-3 w-3" /> Professional Suite
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">Analytics</a>
            <a href="#" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">Integrations</a>
            <a href="#" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
