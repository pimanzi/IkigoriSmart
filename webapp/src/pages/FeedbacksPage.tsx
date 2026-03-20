import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { fetchFeedbacks } from '@/services/feedback.service';
import type { Feedback } from '@/types';

export default function FeedbacksPage() {
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState<'all' | 'Musanze' | 'Nyabihu'>('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const { data: feedbacks = [], isLoading } = useQuery({ queryKey: ['feedbacks'], queryFn: () => fetchFeedbacks() });

  const filtered = feedbacks.filter(f => {
    const farmerName = f.profile ? `${f.profile.first_name} ${f.profile.last_name}`.toLowerCase() : '';
    const matchesSearch = farmerName.includes(search.toLowerCase()) || f.comment.toLowerCase().includes(search.toLowerCase());
    const matchesRating = ratingFilter === 'all' || f.rating === parseInt(ratingFilter);
    const matchesDistrict = districtFilter === 'all' || f.prediction?.district === districtFilter;
    const matchesRisk = riskFilter === 'all' || f.prediction?.risk_level === riskFilter;
    return matchesSearch && matchesRating && matchesDistrict && matchesRisk;
  });

  const severityColors: Record<string, string> = { Healthy: 'var(--chart-3)', Early: 'var(--chart-4)', Moderate: 'var(--chart-2)', Severe: 'var(--chart-5)' };
  const riskColors: Record<string, string> = { Low: 'var(--success-main)', Medium: 'var(--chart-4)', High: 'var(--error-main)' };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input placeholder="Search by farmer name..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="1">1★</SelectItem>
            <SelectItem value="2">2★</SelectItem>
            <SelectItem value="3">3★</SelectItem>
            <SelectItem value="4">4★</SelectItem>
            <SelectItem value="5">5★</SelectItem>
          </SelectContent>
        </Select>
        <Select value={districtFilter} onValueChange={(v: 'all' | 'Musanze' | 'Nyabihu') => setDistrictFilter(v)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            <SelectItem value="Musanze">Musanze</SelectItem>
            <SelectItem value="Nyabihu">Nyabihu</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farmer Feedbacks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {feedback.profile?.avatar ? (
                        <img src={feedback.profile.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--brand-hover)', color: 'var(--brand-main)' }}>
                          {feedback.profile?.first_name[0]}{feedback.profile?.last_name[0]}
                        </div>
                      )}
                      <span>{feedback.profile ? `${feedback.profile.first_name} ${feedback.profile.last_name}` : 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4" fill={i < feedback.rating ? 'var(--brand-main)' : 'none'} style={{ color: i < feedback.rating ? 'var(--brand-main)' : 'var(--text-secondary)' }} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{feedback.comment}</TableCell>
                  <TableCell>
                    {feedback.prediction && (
                      <Badge className="text-white" style={{ background: severityColors[feedback.prediction.severity] }}>
                        {feedback.prediction.severity}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {feedback.prediction && (
                      <Badge className="text-white" style={{ background: riskColors[feedback.prediction.risk_level] }}>
                        {feedback.prediction.risk_level}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(feedback.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFeedback(feedback)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedFeedback && (
            <>
              <SheetHeader>
                <SheetTitle>Feedback Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                  {selectedFeedback.profile?.avatar ? (
                    <img src={selectedFeedback.profile.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'var(--brand-hover)', color: 'var(--brand-main)' }}>
                      {selectedFeedback.profile?.first_name[0]}{selectedFeedback.profile?.last_name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {selectedFeedback.profile ? `${selectedFeedback.profile.first_name} ${selectedFeedback.profile.last_name}` : 'Unknown'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedFeedback.profile?.email}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedFeedback.profile?.phone_number}</p>
                    <Badge className="mt-1">{selectedFeedback.profile?.district}</Badge>
                  </div>
                </div>

                {selectedFeedback.prediction && (
                  <>
                    <div>
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Prediction Image</p>
                      <img src={selectedFeedback.prediction.image_url} alt="Crop" className="w-full max-h-48 object-cover rounded-lg" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Severity</p>
                        <Badge className="text-white mt-1" style={{ background: severityColors[selectedFeedback.prediction.severity] }}>
                          {selectedFeedback.prediction.severity}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Risk Level</p>
                        <Badge className="text-white mt-1" style={{ background: riskColors[selectedFeedback.prediction.risk_level] }}>
                          {selectedFeedback.prediction.risk_level}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Weather Data</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p style={{ color: 'var(--text-secondary)' }}>Temperature</p>
                          <p className="font-medium">{selectedFeedback.prediction.temperature_c}°C</p>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-secondary)' }}>Humidity</p>
                          <p className="font-medium">{selectedFeedback.prediction.humidity_pct}%</p>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-secondary)' }}>Rainfall</p>
                          <p className="font-medium">{selectedFeedback.prediction.rainfall_mm}mm</p>
                        </div>
                      </div>
                      <Badge className="mt-2" variant="outline">{selectedFeedback.prediction.weather_source === 'api' ? 'API' : 'Manual'}</Badge>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Rating</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5" fill={i < selectedFeedback.rating ? 'var(--brand-main)' : 'none'} style={{ color: i < selectedFeedback.rating ? 'var(--brand-main)' : 'var(--text-secondary)' }} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Comment</p>
                  <p style={{ color: 'var(--text-primary)' }}>{selectedFeedback.comment}</p>
                </div>

                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Submitted on {new Date(selectedFeedback.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
