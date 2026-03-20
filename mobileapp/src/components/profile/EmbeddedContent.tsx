import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import YoutubeIframe from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';

interface EmbeddedContentProps {
  url: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Detect content type from URL
const detectContentType = (url: string): 'youtube' | 'pdf' | 'web' => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.toLowerCase().endsWith('.pdf')) {
    return 'pdf';
  }
  return 'web';
};

export const EmbeddedContent: React.FC<EmbeddedContentProps> = ({ url }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const contentType = detectContentType(url);
  const youtubeId = contentType === 'youtube' ? extractYouTubeId(url) : null;

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
  };

  // YouTube Player
  if (contentType === 'youtube' && youtubeId) {
    return (
      <View style={styles.container}>
        <YoutubeIframe
          videoId={youtubeId}
          height={220}
          play={false}
          onReady={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
        {isLoading && (
          <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surfaceHover }]}>
            <ActivityIndicator size="large" color={theme.colors.brandMain} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              {t('tutorials.loadingVideo')}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // WebView for PDFs and websites
  if (contentType === 'pdf' || contentType === 'web') {
    return (
      <View style={styles.webViewContainer}>
        {hasError ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.surfaceHover }]}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.errorMain} />
            <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
              {t('tutorials.contentError')}
            </Text>
            <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
              {t('tutorials.contentErrorMessage')}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.brandMain }]}
              onPress={handleRetry}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={20} color="#ffffff" />
              <Text style={styles.retryButtonText}>{t('tutorials.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              source={{ uri: url }}
              style={styles.webView}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              startInLoadingState
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
            />
            {isLoading && (
              <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.surfaceMain }]}>
                <ActivityIndicator size="large" color={theme.colors.brandMain} />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  {contentType === 'pdf' ? t('tutorials.loadingPDF') : t('tutorials.loadingContent')}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: 220,
    position: 'relative',
  },
  webViewContainer: {
    flex: 1,
    minHeight: 400,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
