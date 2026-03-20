import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, MoreVertical, Bell, MapPin, AlertTriangle, CheckCircle, XCircle, ArrowLeft, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader } from '@/components/ui/loader';
import { useTranslation } from 'react-i18next';
import { useAlerts } from '@/hooks/useAlerts';
import { useCreateAlert } from '@/hooks/useCreateAlert';
import { useUpdateAlert } from '@/hooks/useUpdateAlert';
import { useDeleteAlert } from '@/hooks/useDeleteAlert';
import { useAuth } from '@/contexts/AuthContext';
import type { Alert } from '@/types';

const riskColors: Record<string, string> = {
  High: 'var(--error-main)',
  Medium: 'var(--chart-4)',
  Low: 'var(--success-main)',
};

const riskIcons = {
  High: AlertTriangle,
  Medium: Bell,
  Low: CheckCircle,
};

export default function AlertsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const riskFilter = searchParams.get('risk') || 'all';
  const districtFilter = searchParams.get('district') || 'all';
  const statusFilter = searchParams.get('status') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedAlertId = searchParams.get('detail');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<Alert | null>(null);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_rw: '',
    message_en: '',
    message_rw: '',
    risk_level: 'Low' as 'Low' | 'Medium' | 'High',
    district: 'All' as 'Musanze' | 'Nyabihu' | 'All',
    is_active: true,
  });
  const [sortedIds, setSortedIds] = useState<string[]>([]);

  const itemsPerPage = 6;

  const { alerts, isLoading } = useAlerts();

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_rw: '',
      message_en: '',
      message_rw: '',
      risk_level: 'Low',
      district: 'All',
      is_active: true,
    });
    setEditingAlert(null);
  };

  const createMutation = useCreateAlert((newAlert) => {
    setSortedIds(prev => [newAlert.id, ...prev]);
    setDialogOpen(false);
    resetForm();
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('page', '1');
      return params;
    });
  });
  const updateMutation = useUpdateAlert(() => {
    setDialogOpen(false);
    resetForm();
  });
  const deleteMutation = useDeleteAlert();

  // Initialize sortedIds only once when alerts first load
  if (sortedIds.length === 0 && alerts.length > 0) {
    const ids = [...alerts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(a => a.id);
    setSortedIds(ids);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (editingAlert) {
      updateMutation.mutate({ id: editingAlert.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, admin_id: profile.id });
    }
  };

  const openEditDialog = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData({
      title_en: alert.title_en,
      title_rw: alert.title_rw,
      message_en: alert.message_en,
      message_rw: alert.message_rw,
      risk_level: alert.risk_level,
      district: alert.district,
      is_active: alert.is_active,
    });
    setDialogOpen(true);
  };

  const openDetailView = (alertId: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('detail', alertId);
      return params;
    });
  };

  const closeDetailView = () => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.delete('detail');
      return params;
    });
  };

  const filteredAlerts = alerts
    .filter(a => {
      const matchesSearch = a.title_en.toLowerCase().includes(search.toLowerCase()) ||
        a.message_en.toLowerCase().includes(search.toLowerCase()) ||
        a.title_rw.toLowerCase().includes(search.toLowerCase()) ||
        a.message_rw.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = riskFilter === 'all' || a.risk_level === riskFilter;
      const matchesDistrict = districtFilter === 'all' || a.district === districtFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && a.is_active) ||
        (statusFilter === 'inactive' && !a.is_active);
      return matchesSearch && matchesRisk && matchesDistrict && matchesStatus;
    })
    .sort((a, b) => {
      const indexA = sortedIds.indexOf(a.id);
      const indexB = sortedIds.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Detail view
  const selectedAlert = selectedAlertId ? alerts.find(a => a.id === selectedAlertId) : null;

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader />
    </div>
  );

  // Alert Detail View
  if (selectedAlert) {
    const RiskIcon = riskIcons[selectedAlert.risk_level];
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={closeDetailView}
          className="cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('alerts.backToList')}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {t('alerts.detailTitle')}
              </h2>
              <Badge className="text-white" style={{ background: riskColors[selectedAlert.risk_level] }}>
                <RiskIcon className="w-3 h-3 mr-1" />
                {t(`alerts.risk${selectedAlert.risk_level}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('alerts.titleEnLabel')}
                </Label>
                <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedAlert.title_en}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('alerts.titleRwLabel')}
                </Label>
                <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedAlert.title_rw}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('alerts.messageEnLabel')}
                </Label>
                <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                  {selectedAlert.message_en}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('alerts.messageRwLabel')}
                </Label>
                <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                  {selectedAlert.message_rw}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('alerts.districtLabel')}
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: 'var(--brand-main)' }} />
                  <span style={{ color: 'var(--text-primary)' }}>
                    {selectedAlert.district === 'All' ? t('alerts.districtAll') : selectedAlert.district}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('alerts.statusLabel')}
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  {selectedAlert.is_active ? (
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success-main)' }} />
                  ) : (
                    <XCircle className="w-4 h-4" style={{ color: 'var(--error-main)' }} />
                  )}
                  <span style={{ color: 'var(--text-primary)' }}>
                    {selectedAlert.is_active ? t('alerts.statusActive') : t('alerts.statusInactive')}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('alerts.createdAt')}
                </Label>
                <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                  {new Date(selectedAlert.created_at).toLocaleDateString()} {new Date(selectedAlert.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Created By Section */}
            {selectedAlert.profile && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <Label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t('alerts.createdBy')}
                </Label>
                <div className="mt-2 flex items-center gap-3">
                  {selectedAlert.profile.avatar ? (
                    <img
                      src={selectedAlert.profile.avatar}
                      alt={`${selectedAlert.profile.first_name} ${selectedAlert.profile.last_name}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--brand-surface)' }}
                    >
                      <User className="w-5 h-5" style={{ color: 'var(--brand-main)' }} />
                    </div>
                  )}
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {selectedAlert.profile.first_name} {selectedAlert.profile.last_name}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {selectedAlert.profile.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => openEditDialog(selectedAlert)}
              className="cursor-pointer"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('alerts.editAction')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAlertToDelete(selectedAlert);
                setDeleteDialogOpen(true);
              }}
              className="cursor-pointer"
              style={{ color: 'var(--error-main)', borderColor: 'var(--error-main)' }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('alerts.deleteAction')}
            </Button>
          </CardFooter>
        </Card>

        {/* Delete Confirmation Dialog for Detail View */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('alerts.deleteTitle')}</DialogTitle>
            </DialogHeader>
            <p style={{ color: 'var(--text-secondary)' }}>{t('alerts.deleteConfirm')}</p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="cursor-pointer">
                {t('common.cancel')}
              </Button>
              <Button
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  if (alertToDelete) {
                    deleteMutation.mutate(alertToDelete.id);
                    setDeleteDialogOpen(false);
                    setAlertToDelete(null);
                    closeDetailView();
                  }
                }}
                style={{ background: 'var(--error-main)', color: 'white' }}
              >
                {t('alerts.deleteAction')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog for Detail View */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('alerts.editTitle')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('alerts.titleEnLabel')}</Label>
                <Input required value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
              </div>
              <div>
                <Label>{t('alerts.titleRwLabel')}</Label>
                <Input required value={formData.title_rw} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
              </div>
              <div>
                <Label>{t('alerts.messageEnLabel')}</Label>
                <textarea
                  required
                  value={formData.message_en}
                  onChange={(e) => setFormData({ ...formData, message_en: e.target.value })}
                  className="w-full min-h-20 px-3 py-2 rounded-md border"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <Label>{t('alerts.messageRwLabel')}</Label>
                <textarea
                  required
                  value={formData.message_rw}
                  onChange={(e) => setFormData({ ...formData, message_rw: e.target.value })}
                  className="w-full min-h-20 px-3 py-2 rounded-md border"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('alerts.riskLabel')}</Label>
                  <Select value={formData.risk_level} onValueChange={(v: 'Low' | 'Medium' | 'High') => setFormData({ ...formData, risk_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">{t('alerts.riskLow')}</SelectItem>
                      <SelectItem value="Medium">{t('alerts.riskMedium')}</SelectItem>
                      <SelectItem value="High">{t('alerts.riskHigh')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('alerts.districtLabel')}</Label>
                  <Select value={formData.district} onValueChange={(v: 'Musanze' | 'Nyabihu' | 'All') => setFormData({ ...formData, district: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Musanze">{t('alerts.districtMusanze')}</SelectItem>
                      <SelectItem value="Nyabihu">{t('alerts.districtNyabihu')}</SelectItem>
                      <SelectItem value="All">{t('alerts.districtAll')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="is_active_edit">{t('alerts.statusLabel')}</Label>
                <Switch
                  id="is_active_edit"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {formData.is_active ? t('alerts.statusActive') : t('alerts.statusInactive')}
                </span>
              </div>
              <Button type="submit" className="w-full cursor-pointer hover:opacity-90 transition-opacity" style={{ background: 'var(--brand-main)', color: 'white' }}>
                {t('alerts.updateButton')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Alerts List View
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Input
          placeholder={t('alerts.searchPlaceholder')}
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
              {t('alerts.addButton')}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAlert ? t('alerts.editTitle') : t('alerts.addTitle')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('alerts.titleEnLabel')}</Label>
                <Input required value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
              </div>
              <div>
                <Label>{t('alerts.titleRwLabel')}</Label>
                <Input required value={formData.title_rw} onChange={(e) => setFormData({ ...formData, title_rw: e.target.value })} />
              </div>
              <div>
                <Label>{t('alerts.messageEnLabel')}</Label>
                <textarea
                  required
                  value={formData.message_en}
                  onChange={(e) => setFormData({ ...formData, message_en: e.target.value })}
                  className="w-full min-h-20 px-3 py-2 rounded-md border"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <Label>{t('alerts.messageRwLabel')}</Label>
                <textarea
                  required
                  value={formData.message_rw}
                  onChange={(e) => setFormData({ ...formData, message_rw: e.target.value })}
                  className="w-full min-h-20 px-3 py-2 rounded-md border"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('alerts.riskLabel')}</Label>
                  <Select value={formData.risk_level} onValueChange={(v: 'Low' | 'Medium' | 'High') => setFormData({ ...formData, risk_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">{t('alerts.riskLow')}</SelectItem>
                      <SelectItem value="Medium">{t('alerts.riskMedium')}</SelectItem>
                      <SelectItem value="High">{t('alerts.riskHigh')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('alerts.districtLabel')}</Label>
                  <Select value={formData.district} onValueChange={(v: 'Musanze' | 'Nyabihu' | 'All') => setFormData({ ...formData, district: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Musanze">{t('alerts.districtMusanze')}</SelectItem>
                      <SelectItem value="Nyabihu">{t('alerts.districtNyabihu')}</SelectItem>
                      <SelectItem value="All">{t('alerts.districtAll')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="is_active">{t('alerts.statusLabel')}</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {formData.is_active ? t('alerts.statusActive') : t('alerts.statusInactive')}
                </span>
              </div>
              <Button type="submit" className="w-full cursor-pointer hover:opacity-90 transition-opacity" style={{ background: 'var(--brand-main)', color: 'white' }}>
                {editingAlert ? t('alerts.updateButton') : t('alerts.createButton')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <Select value={riskFilter} onValueChange={(v) => {
          setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (v === 'all') params.delete('risk');
            else params.set('risk', v);
            params.set('page', '1');
            return params;
          });
        }}>
          <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder={t('alerts.riskLabel')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">{t('alerts.allRisk')}</SelectItem>
            <SelectItem value="Low" className="cursor-pointer">{t('alerts.riskLow')}</SelectItem>
            <SelectItem value="Medium" className="cursor-pointer">{t('alerts.riskMedium')}</SelectItem>
            <SelectItem value="High" className="cursor-pointer">{t('alerts.riskHigh')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={districtFilter} onValueChange={(v) => {
          setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (v === 'all') params.delete('district');
            else params.set('district', v);
            params.set('page', '1');
            return params;
          });
        }}>
          <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder={t('alerts.districtLabel')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">{t('alerts.allDistricts')}</SelectItem>
            <SelectItem value="Musanze" className="cursor-pointer">{t('alerts.districtMusanze')}</SelectItem>
            <SelectItem value="Nyabihu" className="cursor-pointer">{t('alerts.districtNyabihu')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => {
          setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (v === 'all') params.delete('status');
            else params.set('status', v);
            params.set('page', '1');
            return params;
          });
        }}>
          <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder={t('alerts.statusLabel')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">{t('alerts.allStatus')}</SelectItem>
            <SelectItem value="active" className="cursor-pointer">{t('alerts.statusActive')}</SelectItem>
            <SelectItem value="inactive" className="cursor-pointer">{t('alerts.statusInactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alert Cards Grid */}
      {paginatedAlerts.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
          {t('alerts.noAlerts')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedAlerts.map((alert) => {
            const RiskIcon = riskIcons[alert.risk_level];
            return (
              <Card
                key={alert.id}
                className="transition-all duration-200 hover:shadow-lg cursor-pointer border-0 shadow-sm"
                onClick={() => openDetailView(alert.id)}
              >
                <CardHeader className="p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 pointer-events-none">
                      <Badge className="w-fit text-white" style={{ background: riskColors[alert.risk_level] }}>
                        <RiskIcon className="w-3 h-3 mr-1" />
                        {alert.risk_level}
                      </Badge>
                      <Badge variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {alert.district}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(alert);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {t('alerts.editAction')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlertToDelete(alert);
                            setDeleteDialogOpen(true);
                          }}
                          className="cursor-pointer"
                          style={{ color: 'var(--error-main)' }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('alerts.deleteAction')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-2.5 pt-0 space-y-1">
                  <h3 className="font-bold text-base line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {alert.title_en}
                  </h3>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {alert.message_en}
                  </p>
                </CardContent>
                <CardFooter className="p-2.5 pt-0 flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: alert.is_active ? 'var(--success-main)' : 'var(--error-main)',
                      color: alert.is_active ? 'var(--success-main)' : 'var(--error-main)',
                    }}
                  >
                    {alert.is_active ? t('alerts.statusActive') : t('alerts.statusInactive')}
                  </Badge>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('alerts.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p style={{ color: 'var(--text-secondary)' }}>{t('alerts.deleteConfirm')}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="cursor-pointer">
              {t('common.cancel')}
            </Button>
            <Button
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                if (alertToDelete) {
                  deleteMutation.mutate(alertToDelete.id);
                  setDeleteDialogOpen(false);
                  setAlertToDelete(null);
                }
              }}
              style={{ background: 'var(--error-main)', color: 'white' }}
            >
              {t('alerts.deleteAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
