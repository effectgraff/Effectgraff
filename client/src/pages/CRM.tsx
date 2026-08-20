import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, ClipboardList, Loader2, MessageSquare, Plus, RefreshCw, Search, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const statuses = [
  { value: "new", label: "Новый", tone: "bg-sky-100 text-sky-800" },
  { value: "qualified", label: "Квалифицирован", tone: "bg-amber-100 text-amber-800" },
  { value: "proposal", label: "Предложение", tone: "bg-violet-100 text-violet-800" },
  { value: "won", label: "Сделка", tone: "bg-emerald-100 text-emerald-800" },
  { value: "lost", label: "Отказ", tone: "bg-slate-100 text-slate-700" },
] as const;

type Status = (typeof statuses)[number]["value"];

function statusMeta(status: string) {
  return statuses.find(item => item.value === status) ?? statuses[0];
}

export default function CRM() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const leadsQuery = trpc.leads.list.useQuery(undefined, { retry: false });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");

  const statusMutation = trpc.leads.updateStatus.useMutation({
    onSuccess: () => { void utils.leads.list.invalidate(); toast.success("Статус лида обновлён"); },
    onError: error => toast.error(error.message),
  });
  const noteMutation = trpc.leads.notes.add.useMutation({
    onSuccess: () => { setNote(""); void utils.leads.notes.list.invalidate({ leadId: selectedId ?? 0 }); toast.success("Заметка добавлена"); },
    onError: error => toast.error(error.message),
  });
  const taskToggleMutation = trpc.leads.tasks.toggle.useMutation({
    onSuccess: () => { void utils.leads.tasks.list.invalidate({ leadId: selectedId ?? 0 }); },
    onError: error => toast.error(error.message),
  });
  const taskMutation = trpc.leads.tasks.create.useMutation({
    onSuccess: () => { setTaskTitle(""); setTaskDue(""); void utils.leads.tasks.list.invalidate({ leadId: selectedId ?? 0 }); toast.success("Задача создана"); },
    onError: error => toast.error(error.message),
  });

  const leads = leadsQuery.data ?? [];
  const selected = leads.find(lead => lead.id === selectedId) ?? null;
  const notesQuery = trpc.leads.notes.list.useQuery({ leadId: selectedId ?? 0 }, { enabled: selectedId !== null });
  const tasksQuery = trpc.leads.tasks.list.useQuery({ leadId: selectedId ?? 0 }, { enabled: selectedId !== null });
  const filtered = useMemo(() => leads.filter(lead => {
    const matchesStatus = filter === "all" || lead.status === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [lead.city, lead.contact, lead.projectType, lead.details].filter(Boolean).join(" ").toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  }), [filter, leads, search]);

  if (user && user.role !== "admin") {
    return <DashboardLayout><Card><CardHeader><CardTitle>Нет доступа</CardTitle></CardHeader><CardContent>CRM доступна только владельцу и администраторам.</CardContent></Card></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">EffectGraff / внутренняя панель</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Лиды и проекты</h1><p className="mt-1 text-sm text-muted-foreground">Входящие брифы, партнёры и следующие шаги — в одном рабочем списке.</p></div>
          <Button variant="outline" onClick={() => void leadsQuery.refetch()} disabled={leadsQuery.isFetching}><RefreshCw className={leadsQuery.isFetching ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />Обновить</Button>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="flex items-center gap-3 p-4"><Users className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Всего лидов</p><p className="text-2xl font-semibold">{leads.length}</p></div></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Новые</p><p className="text-2xl font-semibold">{leads.filter(lead => lead.status === "new").length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">В работе</p><p className="text-2xl font-semibold">{leads.filter(lead => ["qualified", "proposal"].includes(lead.status)).length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Сделки</p><p className="text-2xl font-semibold">{leads.filter(lead => lead.status === "won").length}</p></CardContent></Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
          <Card className="min-w-0"><CardHeader className="gap-4"><div className="flex items-center justify-between gap-3"><CardTitle>Очередь обращений</CardTitle><span className="text-xs text-muted-foreground">{filtered.length} из {leads.length}</span></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Поиск по городу, контакту или задаче" className="pl-9" /></div><Select value={filter} onValueChange={value => setFilter(value as "all" | Status)}><SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все статусы</SelectItem>{statuses.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div></CardHeader><CardContent className="space-y-2">
            {leadsQuery.isLoading ? <div className="flex items-center justify-center py-12 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Загружаем лиды…</div> : leadsQuery.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">Не удалось загрузить CRM. Проверьте авторизацию администратора.</div> : filtered.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Пока нет обращений, соответствующих фильтру.</div> : filtered.map(lead => { const meta = statusMeta(lead.status); return <button key={lead.id} onClick={() => setSelectedId(lead.id)} className={`w-full rounded-xl border p-4 text-left transition hover:border-primary/60 hover:bg-muted/30 ${selectedId === lead.id ? "border-primary bg-primary/5" : "border-border"}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{lead.city}</span><Badge className={meta.tone}>{meta.label}</Badge></div><p className="mt-1 truncate text-sm text-muted-foreground">{lead.contact}</p></div><span className="shrink-0 text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</span></div><div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3"><span>Стена: {lead.wallSize}</span><span>Бюджет: {lead.budget}</span><span>Язык: {lead.language.toUpperCase()}</span></div></button>; })}
          </CardContent></Card>

          <Card className="min-w-0"><CardHeader><CardTitle>{selected ? `Лид #${selected.id}` : "Детали лида"}</CardTitle></CardHeader><CardContent>{!selected ? <div className="flex min-h-64 flex-col items-center justify-center text-center text-sm text-muted-foreground"><ClipboardList className="mb-3 h-8 w-8" /><p>Выберите обращение слева.</p></div> : <div className="space-y-5"><div className="grid gap-3 text-sm"><div><Label>Контакт</Label><p className="mt-1 break-words">{selected.contact}</p></div><div className="grid grid-cols-2 gap-3"><div><Label>Город</Label><p className="mt-1">{selected.city}</p></div><div><Label>Размер стены</Label><p className="mt-1">{selected.wallSize}</p></div></div><div><Label>Бюджет</Label><p className="mt-1">{selected.budget}</p></div>{selected.details && <div><Label>Комментарий</Label><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{selected.details}</p></div>}</div><div><Label>Статус</Label><Select value={selected.status} onValueChange={value => statusMutation.mutate({ id: selected.id, status: value as Status })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{statuses.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div><div className="border-t pt-4"><div className="mb-2 flex items-center gap-2 font-medium"><MessageSquare className="h-4 w-4" />Заметки</div><div className="space-y-2">{notesQuery.data?.map(item => <div key={item.id} className="rounded-lg bg-muted/50 p-3 text-sm"><p className="whitespace-pre-wrap">{item.body}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p></div>)}{!notesQuery.data?.length && <p className="text-xs text-muted-foreground">Заметок пока нет.</p>}</div><div className="mt-3 space-y-2"><Textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Что важно не забыть…" rows={3} /><Button size="sm" onClick={() => noteMutation.mutate({ leadId: selected.id, body: note })} disabled={!note.trim() || noteMutation.isPending}><Plus className="mr-1 h-4 w-4" />Добавить заметку</Button></div></div><div className="border-t pt-4"><div className="mb-2 flex items-center gap-2 font-medium"><ClipboardList className="h-4 w-4" />Следующие шаги</div><div className="space-y-2">{tasksQuery.data?.map(item => <div key={item.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm"><button aria-label={item.status === "done" ? "Вернуть задачу в работу" : "Отметить задачу выполненной"} onClick={() => taskToggleMutation.mutate({ id: item.id, status: item.status === "done" ? "open" : "done" })} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border hover:bg-muted" disabled={taskToggleMutation.isPending}><Check className={item.status === "done" ? "h-4 w-4 text-emerald-600" : "h-4 w-4 text-muted-foreground"} /></button><span className={item.status === "done" ? "flex-1 line-through text-muted-foreground" : "flex-1"}>{item.title}</span><Badge variant="outline">{item.status === "done" ? "Готово" : "Открыта"}</Badge></div>)}{!tasksQuery.data?.length && <p className="text-xs text-muted-foreground">Задач пока нет.</p>}</div><div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"><Input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Например: отправить смету" /><Input type="date" value={taskDue} onChange={event => setTaskDue(event.target.value)} className="sm:w-40" /></div><Button size="sm" className="mt-2" onClick={() => taskMutation.mutate({ leadId: selected.id, title: taskTitle, dueAt: taskDue ? new Date(`${taskDue}T12:00:00`) : null })} disabled={!taskTitle.trim() || taskMutation.isPending}><Plus className="mr-1 h-4 w-4" />Создать задачу</Button></div></div>}</CardContent></Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
