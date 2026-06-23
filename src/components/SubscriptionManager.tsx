
"use client"

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit2, 
  Globe, 
  Sun, 
  Moon, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  MoreVertical,
  Check
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

  const totalMonthlySpend = subscriptions.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">
      {/* Header & Main Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full h-12 w-12 shadow-sm"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shadow-sm">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')} className="flex justify-between items-center cursor-pointer">
                English {language === 'en' && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('es')} className="flex justify-between items-center cursor-pointer">
                Español {language === 'es' && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-full h-12 px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" />
                {t('addSubscription')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">
                  {editingSub ? t('editSubscription') : t('addSubscription')}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">{t('serviceName')}</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Netflix, Spotify"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cost" className="text-sm font-medium">{t('cost')}</Label>
                    <Input 
                      id="cost" 
                      type="number" 
                      value={cost} 
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-sm font-medium">{t('category')}</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="streaming">{t('categories.streaming')}</SelectItem>
                        <SelectItem value="productivity">{t('categories.productivity')}</SelectItem>
                        <SelectItem value="gaming">{t('categories.gaming')}</SelectItem>
                        <SelectItem value="utilities">{t('categories.utilities')}</SelectItem>
                        <SelectItem value="other">{t('categories.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date" className="text-sm font-medium">{t('billingDate')}</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('cancel')}</Button>
                <Button onClick={handleSave} className="bg-primary text-primary-foreground">{t('save')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Spend Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden relative shadow-xl shadow-primary/5">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp className="w-32 h-32 text-primary" />
        </div>
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm mb-2">{t('monthlyTotal')}</p>
              <p className="text-5xl md:text-7xl font-headline font-black text-primary transition-all">
                {formatCurrency(totalMonthlySpend)}
              </p>
            </div>
            <div className="hidden lg:block h-20 w-px bg-border/50 mx-4" />
            <div className="flex gap-4">
              <div className="bg-card/80 backdrop-blur px-6 py-4 rounded-2xl shadow-sm border border-border/50">
                <p className="text-xs text-muted-foreground font-medium mb-1">{t('subscriptions')}</p>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
              </div>
              <div className="bg-card/80 backdrop-blur px-6 py-4 rounded-2xl shadow-sm border border-border/50">
                <p className="text-xs text-muted-foreground font-medium mb-1">Avg / Sub</p>
                <p className="text-2xl font-bold">
                  {subscriptions.length > 0 ? formatCurrency(totalMonthlySpend / subscriptions.length) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-headline font-semibold flex items-center gap-2">
          {t('subscriptions')}
          <span className="text-sm font-normal bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{subscriptions.length}</span>
        </h2>
        
        {subscriptions.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center gap-4">
            <div className="p-4 bg-muted rounded-full">
              <CalendarIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">{t('noSubscriptions')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/50">
                <div className="h-2 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                      {t(`categories.${sub.category}`)}
                    </p>
                    <CardTitle className="text-xl font-headline font-bold">{sub.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(sub)} className="cursor-pointer gap-2">
                        <Edit2 className="h-4 w-4" /> {t('editSubscription')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(sub.id)} className="text-destructive cursor-pointer gap-2">
                        <Trash2 className="h-4 w-4" /> {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black">{formatCurrency(sub.cost)}</span>
                    <span className="text-muted-foreground text-sm font-medium mb-1.5">/ mo</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm bg-muted/40 p-3 rounded-xl border border-border/20">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase leading-tight">{t('nextBilling')}</p>
                      <p className="font-medium text-foreground">{formatDate(sub.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
