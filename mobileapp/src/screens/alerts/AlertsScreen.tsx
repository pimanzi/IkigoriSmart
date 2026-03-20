import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { AlertCard } from '../../components/alerts/AlertCard';
import { AlertFilterBar } from '../../components/alerts/AlertFilterBar';
import { AlertSortDropdown } from '../../components/alerts/AlertSortDropdown';
import { AlertEmptyState } from '../../components/alerts/AlertEmptyState';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAlerts, useMarkAlertAsRead } from '../../hooks/useAlerts';

export type RiskLevel = 'Low' | 'Medium' | 'High';

const PAGE_SIZE = 6;

// ─── Relative time helper (exported for AlertCard) ────────────────────────────

export const getRelativeTime = (isoDate: string): string => {
  const diff    = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours   < 24) return `${hours}h ago`;
  if (days   === 1) return 'Yesterday';
  if (days    <  7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export const AlertsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const profileId = user?.profile?.id ?? null;

  const { alerts, isLoading, isError, refetch } = useAlerts(profileId);
  const { mutate: markAsRead } = useMarkAlertAsRead(profileId);

  const [activeFilter, setActiveFilter] = useState<RiskLevel | 'all'>('all');
  const [sortOrder, setSortOrder]       = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage]   = useState(1);

  const handleFilterChange = (f: RiskLevel | 'all') => { setActiveFilter(f); setCurrentPage(1); };
  const handleSortChange   = (s: 'newest' | 'oldest') => { setSortOrder(s);  setCurrentPage(1); };

  const counts = useMemo(() => ({
    all:    alerts.length,
    High:   alerts.filter((a) => a.risk_level === 'High').length,
    Medium: alerts.filter((a) => a.risk_level === 'Medium').length,
    Low:    alerts.filter((a) => a.risk_level === 'Low').length,
  }), [alerts]);

  const filteredSorted = useMemo(() => {
    const filtered = activeFilter === 'all'
      ? alerts
      : alerts.filter((a) => a.risk_level === activeFilter);
    return [...filtered].sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? -diff : diff;
    });
  }, [alerts, activeFilter, sortOrder]);

  const totalPages  = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const safePage    = Math.min(currentPage, totalPages);
  const pagedAlerts = filteredSorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id, {
      onError: () => Toast.show({ type: 'error', text1: t('alerts.markAsReadError') }),
    });
  };

  // ── Loading ──
  if (isUserLoading || isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={theme.colors.surfaceMain === '#ffffff' ? 'dark-content' : 'light-content'} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.brandMain} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={theme.colors.surfaceMain === '#ffffff' ? 'dark-content' : 'light-content'} />
        <View style={styles.center}>
          <Ionicons name="cloud-offline" size={48} color={theme.colors.errorMain} />
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            {t('alerts.loadError')}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.colors.brandMain }]}
            onPress={() => refetch()}
          >
            <Ionicons name="refresh" size={14} color="#fff" />
            <Text style={styles.retryBtnText}>{t('alerts.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle={theme.colors.surfaceMain === '#ffffff' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          {t('alerts.title')}
        </Text>
        <View style={styles.bellContainer}>
          <Ionicons name="notifications" size={24} color={theme.colors.iconsPrimary} />
          {alerts.length > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.errorMain }]}>
              <Text style={styles.badgeText}>
                {alerts.length > 99 ? '99+' : alerts.length}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Filters */}
      <AlertFilterBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        counts={{ all: counts.all, High: counts.High, Medium: counts.Medium, Low: counts.Low }}
      />

      {/* Sort */}
      <AlertSortDropdown
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        totalShowing={filteredSorted.length}
      />

      {/* List */}
      <FlatList
        data={pagedAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard alert={item} onMarkAsRead={handleMarkAsRead} />
        )}
        ListEmptyComponent={
          <AlertEmptyState
            variant={alerts.length === 0 ? 'no-unread' : 'no-match'}
            onClearFilter={() => handleFilterChange('all')}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={[styles.pagination, { borderTopColor: theme.colors.surfaceHover }]}>
          <TouchableOpacity
            style={[styles.pageBtn, { backgroundColor: theme.colors.surfaceHover }, safePage === 1 && styles.pageBtnDisabled]}
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={15} color={safePage === 1 ? theme.colors.iconsMuted : theme.colors.textPrimary} />
            <Text style={[styles.pageBtnText, { color: safePage === 1 ? theme.colors.iconsMuted : theme.colors.textPrimary }]}>
              {t('alerts.previous')}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.pageIndicator, { color: theme.colors.textSecondary }]}>
            {t('alerts.pageOf', { page: safePage, total: totalPages })}
          </Text>

          <TouchableOpacity
            style={[styles.pageBtn, { backgroundColor: theme.colors.surfaceHover }, safePage === totalPages && styles.pageBtnDisabled]}
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            activeOpacity={0.7}
          >
            <Text style={[styles.pageBtnText, { color: safePage === totalPages ? theme.colors.iconsMuted : theme.colors.textPrimary }]}>
              {t('alerts.next')}
            </Text>
            <Ionicons name="chevron-forward" size={15} color={safePage === totalPages ? theme.colors.iconsMuted : theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  bellContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pageIndicator: {
    fontSize: 13,
  },
});
