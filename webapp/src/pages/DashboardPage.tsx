import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart2, Users, MessageSquare, Shield, AlertTriangle, BookOpen, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from '@/components/ui/loader';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ── colour maps ──────────────────────────────────────────────────────────────
const SEVERITY_COLORS: Record<string, string> = {
  Healthy:  'var(--chart-3)',
  Early:    'var(--chart-4)',
  Moderate: 'var(--chart-2)',
  Severe:   'var(--chart-5)',
};

const RISK_COLORS: Record<string, string> = {
  Low:    'var(--success-main)',
  Medium: 'var(--chart-4)',
  High:   'var(--error-main)',
};

const ACTION_COLORS: Record<string, string> = {
  immediate:  'var(--error-main)',
  monitor:    'var(--chart-4)',
  preventive: 'var(--success-main)',
};

const TOPIC_COLORS: Record<string, string> = {
  scan:    'var(--brand-main)',
  mln:     'var(--chart-5)',
  ipm:     'var(--chart-3)',
  weather: 'var(--chart-2)',
};

// ── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);
  if (minutes < 1) return t('dashboard.justNow');
  if (hours   < 1) return `${minutes} ${t('dashboard.minutesAgo')}`;
  if (days    < 1) return `${hours} ${t('dashboard.hoursAgo')}`;
  return `${days} ${t('dashboard.daysAgo')}`;
}

// ── custom tooltip types ─────────────────────────────────────────────────────
interface TooltipEntry {
  dataKey: string;
  name:    string;
  value:   number;
  color?:  string;
  fill?:   string;
  payload: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?:  boolean;
  payload?: TooltipEntry[];
  label?:   string;
}

// ── custom tooltips ──────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-lg"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
    >
      {label && <p className="font-semibold mb-1">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color ?? entry.fill }}>
          {entry.name ?? entry.dataKey}:{' '}
          <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label:       string;
  value:       number | undefined;
  icon:        ReactNode;
  accentColor: string;
  isLoading:   boolean;
}

function KpiCard({ label, value, icon, accentColor, isLoading }: KpiCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5 pb-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${accentColor}15`, color: accentColor }}
            >
              {icon}
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {value ?? 0}
              </p>
              <p
                className="text-xs font-semibold uppercase tracking-wider mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {label}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useTranslation();
  const { stats, isLoading, isError, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertTriangle className="w-12 h-12" style={{ color: 'var(--error-main)' }} />
        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.error')}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          {t('dashboard.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t('dashboard.totalPredictions')}
          value={stats?.totalPredictions}
          icon={<BarChart2 className="w-6 h-6" />}
          accentColor="var(--brand-main)"
          isLoading={isLoading}
        />
        <KpiCard
          label={t('dashboard.totalFarmers')}
          value={stats?.totalUsers}
          icon={<Users className="w-6 h-6" />}
          accentColor="var(--chart-3)"
          isLoading={isLoading}
        />
        <KpiCard
          label={t('dashboard.totalFeedbacks')}
          value={stats?.totalFeedbacks}
          icon={<MessageSquare className="w-6 h-6" />}
          accentColor="var(--chart-2)"
          isLoading={isLoading}
        />
        <KpiCard
          label={t('dashboard.totalIPM')}
          value={stats?.totalIPM}
          icon={<Shield className="w-6 h-6" />}
          accentColor="var(--success-main)"
          isLoading={isLoading}
        />
      </div>

      {/* ── Charts Row 1: Area + Severity Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Predictions Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              {t('dashboard.predictionsOverTime')}
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('dashboard.predictionsSubtitle')}
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-70 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={stats?.predictionsOverTime ?? []}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradMusanze" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gradNyabihu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--chart-2)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="musanze"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#gradMusanze)"
                    name="Musanze"
                  />
                  <Area
                    type="monotone"
                    dataKey="nyabihu"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fill="url(#gradNyabihu)"
                    name="Nyabihu"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Severity Distribution Donut */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              {t('dashboard.severityDist')}
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('dashboard.severitySubtitle')}
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-70 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats?.severityBreakdown ?? []}
                    dataKey="count"
                    nameKey="severity"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {(stats?.severityBreakdown ?? []).map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={SEVERITY_COLORS[entry.severity] ?? 'var(--chart-1)'}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 2: Risk Bar + Severity by District ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Spread Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              {t('dashboard.riskDist')}
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('dashboard.riskSubtitle')}
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-65 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stats?.riskBreakdown ?? []}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                  <XAxis
                    dataKey="risk_level"
                    tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {(stats?.riskBreakdown ?? []).map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={RISK_COLORS[entry.risk_level] ?? 'var(--chart-1)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Severity by District — grouped bars */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              {t('dashboard.severityByDistrict')}
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('dashboard.severityDistSubtitle')}
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-65 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stats?.severityByDistrict ?? []}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                  <XAxis
                    dataKey="severity"
                    tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="musanze" name="Musanze" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="nyabihu"  name="Nyabihu"  fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity: 3 columns ── */}
      <div>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('dashboard.recentActivity')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Recent Predictions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: 'var(--brand-main)' }} />
                <CardTitle className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('dashboard.recentPredictions')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                : (stats?.recentPredictions ?? []).length === 0
                  ? (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                      {t('dashboard.noData')}
                    </p>
                  )
                  : (stats?.recentPredictions ?? []).map((pred) => (
                    <div key={pred.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {pred.profile
                            ? `${pred.profile.first_name} ${pred.profile.last_name}`
                            : 'Unknown'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {pred.district} · {timeAgo(pred.created_at, t)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge
                          className="rounded-full px-2 py-0 text-xs font-medium text-white"
                          style={{ background: SEVERITY_COLORS[pred.severity] ?? 'var(--chart-1)' }}
                        >
                          {pred.severity}
                        </Badge>
                        <Badge
                          className="rounded-full px-2 py-0 text-xs font-medium text-white"
                          style={{ background: RISK_COLORS[pred.risk_level] ?? 'var(--chart-1)' }}
                        >
                          {pred.risk_level}
                        </Badge>
                      </div>
                    </div>
                  ))
              }
            </CardContent>
          </Card>

          {/* Recent Feedbacks */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" style={{ color: 'var(--chart-2)' }} />
                <CardTitle className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('dashboard.totalFeedbacks')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                : (stats?.recentFeedbacks ?? []).length === 0
                  ? (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                      {t('dashboard.noData')}
                    </p>
                  )
                  : (stats?.recentFeedbacks ?? []).map((fb) => (
                    <div key={fb.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {fb.profile?.avatar ? (
                          <img
                            src={fb.profile.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full shrink-0 object-cover"
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: 'var(--brand-main)' }}
                          >
                            {fb.profile?.first_name?.[0] ?? '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {fb.profile
                              ? `${fb.profile.first_name} ${fb.profile.last_name}`
                              : 'Unknown'}
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {fb.comment}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className="text-xs leading-none"
                            style={{ color: i < fb.rating ? 'var(--brand-main)' : 'var(--border-default)' }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
              }
            </CardContent>
          </Card>

          {/* Recent IPM Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: 'var(--success-main)' }} />
                <CardTitle className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('dashboard.recentIPM')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                : (stats?.recentIPM ?? []).length === 0
                  ? (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                      {t('dashboard.noData')}
                    </p>
                  )
                  : (stats?.recentIPM ?? []).map((ipm) => (
                    <div key={ipm.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {ipm.title_en}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {timeAgo(ipm.created_at, t)}
                        </p>
                      </div>
                      <Badge
                        className="rounded-full px-2 py-0 text-xs font-medium text-white shrink-0"
                        style={{ background: ACTION_COLORS[ipm.action_type] ?? 'var(--chart-1)' }}
                      >
                        {ipm.action_type}
                      </Badge>
                    </div>
                  ))
              }
            </CardContent>
          </Card>

          {/* Recent Tutorials */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: 'var(--chart-2)' }} />
                <CardTitle className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('dashboard.recentTutorials')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                : (stats?.recentTutorials ?? []).length === 0
                  ? (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                      {t('dashboard.noData')}
                    </p>
                  )
                  : (stats?.recentTutorials ?? []).map((tut) => (
                    <div key={tut.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {tut.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {tut.duration} · {timeAgo(tut.created_at, t)}
                        </p>
                      </div>
                      <Badge
                        className="rounded-full px-2 py-0 text-xs font-medium text-white shrink-0"
                        style={{ background: TOPIC_COLORS[tut.topic] ?? 'var(--chart-1)' }}
                      >
                        {tut.topic}
                      </Badge>
                    </div>
                  ))
              }
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
}
