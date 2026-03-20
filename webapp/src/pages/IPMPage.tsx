import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { fetchIPMRecommendations, createIPMRecommendation, updateIPMRecommendation, deleteIPMRecommendation } from '@/services/ipm.service';
import type { IPMRecommendation } from '@/types';

export default function IPMPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const severityFilter = searchParams.get('severity') || 'all';
  const riskFilter = searchParams.get('risk') || 'all';
  const actionFilter = searchParams.get('action') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recToDelete, setRecToDelete] = useState<IPMRecommendation | null>(null);
  const [editing, setEditing] = useState<IPMRecommendation | null>(null);
  const [form, setForm] = useState({ severity: 'Early', risk_level: 'Low', action_type: 'monitor' as 'immediate' | 'monitor' | 'preventive', title_en: '', title_rw: '', description_en: '', description_rw: '' });
  const [sortedIds, setSortedIds] = useState<string[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const itemsPerPage = 10;

  const queryClient = useQueryClient();
  const { data: recommendations = [], isLoading } = useQuery({ queryKey: ['ipm'], queryFn: () => fetchIPMRecommendations() });

  if (sortedIds.length === 0 && recommendations.length > 0) {
    const ids = [...recommendations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(r => r.id);
    setSortedIds(ids);
  }

  const createMutation = useMutation({
    mutationFn: createIPMRecommendation,
    onSuccess: (newRec) => {
      queryClient.invalidateQueries({ queryKey: ['ipm'] });
      setSortedIds(prev => [newRec.id, ...prev]);
      toast.success(t('ipm.createSuccess'));
      setDialogOpen(false);
      resetForm();
      setSearchParams(prev => {
        const params = new URLSearchParams(prev);
        params.set('page', '1');
        return params;
      });
    },
    onError: () => toast.error(t('ipm.createError')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IPMRecommendation> }) => updateIPMRecommendation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipm'] });
      toast.success(t('ipm.updateSuccess'));
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error(t('ipm.updateError')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIPMRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipm'] });
      toast.success(t('ipm.deleteSuccess'));
    },
    onError: () => toast.error(t('ipm.deleteError')),
  });

  const resetForm = () => {
    setForm({ severity: 'Early', risk_level: 'Low', action_type: 'monitor', title_en: '', title_rw: '', description_en: '', description_rw: '' });
    setEditing(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const openEdit = (rec: IPMRecommendation) => {
    setEditing(rec);
    setForm({ severity: rec.severity, risk_level: rec.risk_level, action_type: rec.action_type, title_en: rec.title_en, title_rw: rec.title_rw, description_en: rec.description_en, description_rw: rec.description_rw });
    setDialogOpen(true);
  };

  const severityLabels: Record<string, string> = {
    'Healthy': t('ipm.severityHealthy'),
    'Early': t('ipm.severityEarly'),
    'Moderate': t('ipm.severityModerate'),
    'Severe': t('ipm.severitySevere')
  };

  const riskLabels: Record<string, string> = {
    'Low': t('ipm.riskLow'),
    'Medium': t('ipm.riskMedium'),
    'High': t('ipm.riskHigh')
  };

  const actionLabels: Record<string, string> = {
    'immediate': t('ipm.actionImmediate'),
    'monitor': t('ipm.actionMonitor'),
    'preventive': t('ipm.actionPreventive')
  };

  const actionColors = { immediate: 'var(--brand-main)', monitor: 'var(--info-main)', preventive: 'var(--chart-4)' };

  const filtered = recommendations
    .filter(r => {
      const title = i18n.language === 'kin' ? r.title_rw : r.title_en;
      const description = i18n.language === 'kin' ? r.description_rw : r.description_en;
      const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || description.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
      const matchesRisk = riskFilter === 'all' || r.risk_level === riskFilter;
      const matchesAction = actionFilter === 'all' || r.action_type === actionFilter;
      return matchesSearch && matchesSeverity && matchesRisk && matchesAction;
    })
    .sort((a, b) => {
      const indexA = sortedIds.indexOf(a.id);
      const indexB = sortedIds.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader />
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Input 
          placeholder={t('ipm.searchPlaceholder')} 
          value={search} 
          onChange={(e) => {
            setSearchParams(prev => {
              const params = new URLSearchParams(prev);
              if (e.target.value) params.set('search', e.target.value);
              else params.delete('search');
              params.set('page', '1');
              return params;
            });
          }} 
          className="w-full sm:max-w-xs" 
        />
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer hover:opacity-90 transition-opacity w-full sm:w-auto" style={{ background: 'var(--brand-main)', color: 'white' }}>
              <Plus className="w-4 h-4 mr-2" />
              {t('ipm.addButton')}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? t('ipm.editTitle') : t('ipm.addTitle')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>{t('ipm.severityLabel')}</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Healthy">Healthy</SelectItem>
                      <SelectItem value="Early">Early</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Severe">Severe</SelectItem>
                      <SelectItem value="All">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('ipm.riskLabel')}</Label>
                  <Select value={form.risk_level} onValueChange={(v) => setForm({ ...form, risk_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="All">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('ipm.actionLabel')}</Label>
                  <Select value={form.action_type} onValueChange={(v: 'immediate' | 'monitor' | 'preventive') => setForm({ ...form, action_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                      <SelectItem value="preventive">Preventive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t('ipm.titleEnLabel')}</Label>
                <Input required value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
              </div>
              <div>
                <Label>{t('ipm.titleRwLabel')}</Label>
                <Input required value={form.title_rw} onChange={(e) => setForm({ ...form, title_rw: e.target.value })} />
              </div>
              <div>
                <Label>{t('ipm.descEnLabel')}</Label>
                <textarea required value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} className="w-full min-h-24 px-3 py-2 rounded-md border" style={{ borderColor: 'var(--border)' }} />
              </div>
              <div>
                <Label>{t('ipm.descRwLabel')}</Label>
                <textarea required value={form.description_rw} onChange={(e) => setForm({ ...form, description_rw: e.target.value })} className="w-full min-h-24 px-3 py-2 rounded-md border" style={{ borderColor: 'var(--border)' }} />
              </div>
              <Button type="submit" className="w-full cursor-pointer hover:opacity-90 transition-opacity" style={{ background: 'var(--brand-main)', color: 'white' }}>
                {editing ? t('ipm.updateButton') : t('ipm.createButton')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <Select value={severityFilter} onValueChange={(v) => {
          setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (v === 'all') params.delete('severity');
            else params.set('severity', v);
            params.set('page', '1');
            return params;
          });
        }}>
          <SelectTrigger data-testid="filter-severity" className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder={t('ipm.severityLabel')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">{t('ipm.allSeverity')}</SelectItem>
            <SelectItem value="Healthy" className="cursor-pointer">{t('ipm.severityHealthy')}</SelectItem>
            <SelectItem value="Early" className="cursor-pointer">{t('ipm.severityEarly')}</SelectItem>
            <SelectItem value="Moderate" className="cursor-pointer">{t('ipm.severityModerate')}</SelectItem>
            <SelectItem value="Severe" className="cursor-pointer">{t('ipm.severitySevere')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={(v) => {
          setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (v === 'all') params.delete('risk');
            else params.set('risk', v);
            params.set('page', '1');
            return params;
          });
        }}>
          <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder={t('ipm.riskLabel')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">{t('ipm.allRisk')}</SelectItem>
            <SelectItem value="Low" className="cursor-pointer">{t('ipm.riskLow')}</SelectItem>
            <SelectItem value="Medium" className="cursor-pointer">{t('ipm.riskMedium')}</SelectItem>
            <SelectItem value="High" className="cursor-pointer">{t('ipm.riskHigh')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={(v) => {
          setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (v === 'all') params.delete('action');
            else params.set('action', v);
            params.set('page', '1');
            return params;
          });
        }}>
          <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder={t('ipm.actionLabel')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">{t('ipm.allActions')}</SelectItem>
            <SelectItem value="immediate" className="cursor-pointer">{t('ipm.actionImmediate')}</SelectItem>
            <SelectItem value="monitor" className="cursor-pointer">{t('ipm.actionMonitor')}</SelectItem>
            <SelectItem value="preventive" className="cursor-pointer">{t('ipm.actionPreventive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((rec) => {
          const title = i18n.language === 'kin' ? rec.title_rw : rec.title_en;
          const description = i18n.language === 'kin' ? rec.description_rw : rec.description_en;
          const isExpanded = expandedCards.has(rec.id);
          const shouldTruncate = description.length > 100;
          const displayText = !isExpanded && shouldTruncate ? description.slice(0, 100) + '...' : description;
          
          return (
          <Card key={rec.id} data-testid="ipm-card" className="transition-all duration-200 hover:scale-105 hover:shadow-lg w-full overflow-hidden">
            <CardHeader className="p-2.5">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-1 flex-wrap pointer-events-none min-w-0 flex-1">
                  <Badge className="text-white text-xs whitespace-nowrap" style={{ background: 'var(--brand-main)' }}>
                    {severityLabels[rec.severity] || rec.severity}
                  </Badge>
                  <Badge className="text-white text-xs whitespace-nowrap" style={{ background: 'var(--error-main)' }}>
                    {riskLabels[rec.risk_level] || rec.risk_level}
                  </Badge>
                  <Badge className="text-white text-xs whitespace-nowrap" style={{ background: actionColors[rec.action_type] }}>
                    {actionLabels[rec.action_type] || rec.action_type}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer flex-shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(rec)} className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      {t('tutorials.editAction')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setRecToDelete(rec);
                        setDeleteDialogOpen(true);
                      }}
                      className="cursor-pointer"
                      style={{ color: 'var(--error-main)' }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('ipm.deleteAction')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 space-y-2 min-w-0">
              <h3 className="font-bold text-sm break-words" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
              <div className="hidden md:block">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm line-clamp-3 cursor-help break-words" style={{ color: 'var(--text-secondary)' }}>
                      {description}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[90vw] sm:max-w-sm" style={{ background: 'var(--brand-main)', color: 'white', border: 'none' }}>
                    <p className="break-words">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="md:hidden">
                <p className="text-sm break-words whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {displayText}
                </p>
                {shouldTruncate && (
                  <button
                    onClick={() => {
                      setExpandedCards(prev => {
                        const next = new Set(prev);
                        if (next.has(rec.id)) next.delete(rec.id);
                        else next.add(rec.id);
                        return next;
                      });
                    }}
                    className="text-xs mt-1 cursor-pointer hover:underline"
                    style={{ color: 'var(--brand-main)' }}
                  >
                    {isExpanded ? t('common.readLess') || 'Read less' : t('common.readMore') || 'Read more'}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
      </TooltipProvider>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set('page', String(Math.max(1, currentPage - 1)));
                return params;
              });
            }}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSearchParams(prev => {
                  const params = new URLSearchParams(prev);
                  params.set('page', String(page));
                  return params;
                });
              }}
              style={currentPage === page ? { background: 'var(--brand-main)', color: 'white' } : {}}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set('page', String(Math.min(totalPages, currentPage + 1)));
                return params;
              });
            }}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ipm.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p style={{ color: 'var(--text-secondary)' }}>{t('ipm.deleteConfirm')}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="cursor-pointer">
              {t('common.cancel')}
            </Button>
            <Button 
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                if (recToDelete) {
                  deleteMutation.mutate(recToDelete.id);
                  setDeleteDialogOpen(false);
                  setRecToDelete(null);
                }
              }}
              style={{ background: 'var(--error-main)', color: 'white' }}
            >
              {t('ipm.deleteAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
