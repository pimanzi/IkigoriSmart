import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Camera, Leaf, Shield, Cloud, Clock, ExternalLink, Edit, Trash2, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { useTranslation } from 'react-i18next';
import { useTutorials } from '@/hooks/useTutorials';
import { useCreateTutorial } from '@/hooks/useCreateTutorial';
import { useUpdateTutorial } from '@/hooks/useUpdateTutorial';
import { useDeleteTutorial } from '@/hooks/useDeleteTutorial';
import type { Tutorial } from '@/types';

const topicIcons = { scan: Camera, mln: Leaf, ipm: Shield, weather: Cloud };
const topicColors: Record<string, string> = { 
  scan: 'var(--brand-main)', 
  mln: 'var(--brand-main)', 
  ipm: 'var(--success-main)', 
  weather: 'var(--chart-2)' 
};
const typeColors: Record<string, string> = { 
  video: 'var(--info-main)', 
  reading: 'var(--chart-4)' 
};

export default function TutorialsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const topicFilter = searchParams.get('topic') || 'all';
  const typeFilter = searchParams.get('type') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tutorialToDelete, setTutorialToDelete] = useState<Tutorial | null>(null);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', type: 'video' as 'video' | 'reading', topic: 'scan' as 'scan' | 'mln' | 'ipm' | 'weather', duration: '', content_url: '' });
  const [sortedIds, setSortedIds] = useState<string[]>([]);

  const itemsPerPage = 6;

  const { tutorials, isLoading } = useTutorials();
  const createMutation = useCreateTutorial((newTutorial) => {
    setSortedIds(prev => [newTutorial.id, ...prev]);
    setDialogOpen(false);
    resetForm();
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('page', '1');
      return params;
    });
  });
  const updateMutation = useUpdateTutorial(() => {
    setDialogOpen(false);
    resetForm();
  });
  const deleteMutation = useDeleteTutorial();

  // Initialize sortedIds only once when tutorials first load
  if (sortedIds.length === 0 && tutorials.length > 0) {
    const ids = [...tutorials].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(t => t.id);
    setSortedIds(ids);
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', type: 'video', topic: 'scan', duration: '', content_url: '' });
    setEditingTutorial(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTutorial) {
      updateMutation.mutate({ id: editingTutorial.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({ title: tutorial.title, description: tutorial.description, type: tutorial.type, topic: tutorial.topic, duration: tutorial.duration, content_url: tutorial.content_url || '' });
    setDialogOpen(true);
  };

  const filteredTutorials = tutorials
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
      const matchesTopic = topicFilter === 'all' || t.topic === topicFilter;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      return matchesSearch && matchesTopic && matchesType;
    })
    .sort((a, b) => {
      const indexA = sortedIds.indexOf(a.id);
      const indexB = sortedIds.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  const totalPages = Math.ceil(filteredTutorials.length / itemsPerPage);
  const paginatedTutorials = filteredTutorials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader />
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Input placeholder={t('tutorials.searchPlaceholder')} value={search} onChange={(e) => {
          setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (e.target.value) params.set('search', e.target.value);
            else params.delete('search');
            params.set('page', '1');
            return params;
          });
        }} className="w-full sm:max-w-xs" />
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer hover:opacity-90 transition-opacity w-full sm:w-auto" style={{ background: 'var(--brand-main)', color: 'white' }}>
              <Plus className="w-4 h-4 mr-2" />
              {t('tutorials.addButton')}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto">
            <DialogHeader>
              <DialogTitle>{editingTutorial ? t('tutorials.editTitle') : t('tutorials.addTitle')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('tutorials.titleLabel')}</Label>
                <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <Label>{t('tutorials.descriptionLabel')}</Label>
                <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full min-h-20 px-3 py-2 rounded-md border" style={{ borderColor: 'var(--border)' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('tutorials.typeLabel')}</Label>
                  <Select value={formData.type} onValueChange={(v: 'video' | 'reading') => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">{t('tutorials.typeVideo')}</SelectItem>
                      <SelectItem value="reading">{t('tutorials.typeReading')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('tutorials.topicLabel')}</Label>
                  <Select value={formData.topic} onValueChange={(v: 'scan' | 'mln' | 'ipm' | 'weather') => setFormData({ ...formData, topic: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scan">{t('tutorials.topicScan')}</SelectItem>
                      <SelectItem value="mln">{t('tutorials.topicMLN')}</SelectItem>
                      <SelectItem value="ipm">{t('tutorials.topicIPM')}</SelectItem>
                      <SelectItem value="weather">{t('tutorials.topicWeather')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t('tutorials.durationLabel')}</Label>
                <Input required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 12 min" />
              </div>
              <div>
                <Label>{t('tutorials.contentUrlLabel')}</Label>
                <Input value={formData.content_url} onChange={(e) => setFormData({ ...formData, content_url: e.target.value })} placeholder="https://..." />
              </div>
              <Button type="submit" className="w-full cursor-pointer hover:opacity-90 transition-opacity" style={{ background: 'var(--brand-main)', color: 'white' }}>
                {editingTutorial ? t('tutorials.updateButton') : t('tutorials.createButton')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <Select value={topicFilter} onValueChange={(v) => {
          setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (v === 'all') params.delete('topic');
            else params.set('topic', v);
            params.set('page', '1');
            return params;
          });
        }}>
          <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder={t('tutorials.filterTopic')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">{t('tutorials.allTopics')}</SelectItem>
            <SelectItem value="scan" className="cursor-pointer">{t('tutorials.topicScan')}</SelectItem>
            <SelectItem value="mln" className="cursor-pointer">{t('tutorials.topicMLN')}</SelectItem>
            <SelectItem value="ipm" className="cursor-pointer">{t('tutorials.topicIPM')}</SelectItem>
            <SelectItem value="weather" className="cursor-pointer">{t('tutorials.topicWeather')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => {
          setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            if (v === 'all') params.delete('type');
            else params.set('type', v);
            params.set('page', '1');
            return params;
          });
        }}>
          <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder={t('tutorials.filterType')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">{t('tutorials.allTypes')}</SelectItem>
            <SelectItem value="video" className="cursor-pointer">{t('tutorials.typeVideo')}</SelectItem>
            <SelectItem value="reading" className="cursor-pointer">{t('tutorials.typeReading')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedTutorials.map((tutorial) => {
          const Icon = topicIcons[tutorial.topic];
          return (
            <Card key={tutorial.id} className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <CardHeader className="p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 pointer-events-none">
                    <Badge className="w-fit text-white" style={{ background: topicColors[tutorial.topic] }}>
                      <Icon className="w-3 h-3 mr-1" />
                      {tutorial.topic.toUpperCase()}
                    </Badge>
                    <Badge className="text-white" style={{ background: typeColors[tutorial.type] }}>
                      {tutorial.type}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(tutorial)} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        {t('tutorials.editAction')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setTutorialToDelete(tutorial);
                          setDeleteDialogOpen(true);
                        }}
                        className="cursor-pointer"
                        style={{ color: 'var(--error-main)' }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('tutorials.deleteAction')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-2.5 pt-0 space-y-0.5">
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{tutorial.title}</h3>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{tutorial.description}</p>
                <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-3 h-3" />
                  {tutorial.duration}
                </div>
                {tutorial.content_url && (
                  <a href={tutorial.content_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm" style={{ color: 'var(--brand-main)' }}>
                    <ExternalLink className="w-3 h-3" />
                    {t('tutorials.viewContent')}
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

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
            <DialogTitle>{t('tutorials.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p style={{ color: 'var(--text-secondary)' }}>{t('tutorials.deleteConfirm')}</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="cursor-pointer">
              {t('common.cancel')}
            </Button>
            <Button 
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                if (tutorialToDelete) {
                  deleteMutation.mutate(tutorialToDelete.id);
                  setDeleteDialogOpen(false);
                  setTutorialToDelete(null);
                }
              }}
              style={{ background: 'var(--error-main)', color: 'white' }}
            >
              {t('tutorials.deleteAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
