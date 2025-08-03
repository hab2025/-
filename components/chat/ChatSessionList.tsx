import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert 
} from 'react-native';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Archive,
  Star,
  Filter
} from 'lucide-react-native';
import { ChatSession } from '@/types/chat';
import colors from '@/constants/colors';
import { useLanguage } from '@/hooks/language-store';

interface ChatSessionListProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession?: (sessionId: string, newTitle: string) => void;
  onArchiveSession?: (sessionId: string) => void;
  onStarSession?: (sessionId: string) => void;
}

type SortType = 'recent' | 'oldest' | 'alphabetical' | 'messageCount';
type FilterType = 'all' | 'starred' | 'archived' | 'today' | 'thisWeek';

const ChatSessionList: React.FC<ChatSessionListProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onArchiveSession,
  onStarSession,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Filter sessions based on search query and filter type
  const filteredSessions = sessions.filter(session => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = session.title.toLowerCase().includes(query);
      const messageMatch = session.messages.some(msg => 
        msg.content.some(content => 
          content.content.toLowerCase().includes(query)
        )
      );
      if (!titleMatch && !messageMatch) return false;
    }

    // Type filter
    switch (filterType) {
      case 'starred':
        return (session as any).isStarred; // Assuming we add this property
      case 'archived':
        return (session as any).isArchived; // Assuming we add this property
      case 'today':
        const today = new Date();
        const sessionDate = new Date(session.updatedAt);
        return sessionDate.toDateString() === today.toDateString();
      case 'thisWeek':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(session.updatedAt) > weekAgo;
      default:
        return !(session as any).isArchived; // Don't show archived by default
    }
  });

  // Sort sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortType) {
      case 'recent':
        return b.updatedAt - a.updatedAt;
      case 'oldest':
        return a.updatedAt - b.updatedAt;
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'messageCount':
        return b.messages.length - a.messages.length;
      default:
        return b.updatedAt - a.updatedAt;
    }
  });

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const confirmRename = () => {
    if (editingSessionId && editingTitle.trim()) {
      onRenameSession?.(editingSessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const cancelRename = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'منذ قليل';
    } else if (diffInHours < 24) {
      return `منذ ${Math.floor(diffInHours)} ساعة`;
    } else if (diffInHours < 48) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  const getSessionPreview = (session: ChatSession) => {
    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage) return 'لا توجد رسائل';
    
    const textContent = lastMessage.content
      .filter(part => part.type === 'text')
      .map(part => part.content)
      .join(' ');
    
    return textContent.length > 60 
      ? textContent.substring(0, 60) + '...' 
      : textContent;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>المحادثات</Text>
        <TouchableOpacity style={styles.newChatButton} onPress={onNewSession}>
          <Plus size={20} color={colors.lightText} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.placeholder} />
        <TextInput
          style={styles.searchInput}
          placeholder="البحث في المحادثات..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters and Sort */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
              الكل
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, filterType === 'today' && styles.filterChipActive]}
            onPress={() => setFilterType('today')}
          >
            <Text style={[styles.filterText, filterType === 'today' && styles.filterTextActive]}>
              اليوم
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, filterType === 'thisWeek' && styles.filterChipActive]}
            onPress={() => setFilterType('thisWeek')}
          >
            <Text style={[styles.filterText, filterType === 'thisWeek' && styles.filterTextActive]}>
              هذا الأسبوع
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, filterType === 'starred' && styles.filterChipActive]}
            onPress={() => setFilterType('starred')}
          >
            <Text style={[styles.filterText, filterType === 'starred' && styles.filterTextActive]}>
              المفضلة
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Sessions List */}
      <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
        {sortedSessions.map((session) => (
          <View key={session.id} style={styles.sessionContainer}>
            <TouchableOpacity
              style={[
                styles.sessionItem,
                session.id === currentSessionId && styles.sessionItemActive,
              ]}
              onPress={() => onSelectSession(session.id)}
            >
              <View style={styles.sessionIcon}>
                <MessageSquare 
                  size={20} 
                  color={session.id === currentSessionId ? colors.primary : colors.text} 
                />
              </View>
              
              <View style={styles.sessionContent}>
                {editingSessionId === session.id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={editingTitle}
                      onChangeText={setEditingTitle}
                      onSubmitEditing={confirmRename}
                      onBlur={cancelRename}
                      autoFocus
                    />
                  </View>
                ) : (
                  <>
                    <Text 
                      style={[
                        styles.sessionTitle,
                        session.id === currentSessionId && styles.sessionTitleActive
                      ]}
                      numberOfLines={1}
                    >
                      {session.title}
                    </Text>
                    <Text style={styles.sessionPreview} numberOfLines={1}>
                      {getSessionPreview(session)}
                    </Text>
                    <View style={styles.sessionMeta}>
                      <Text style={styles.sessionDate}>
                        {formatDate(session.updatedAt)}
                      </Text>
                      <Text style={styles.sessionMessageCount}>
                        {session.messages.length} رسالة
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
            
            {/* Session Actions */}
            <View style={styles.sessionActions}>
              {onStarSession && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => onStarSession(session.id)}
                >
                  <Star 
                    size={16} 
                    color={(session as any).isStarred ? colors.warning : colors.placeholder}
                    fill={(session as any).isStarred ? colors.warning : 'none'}
                  />
                </TouchableOpacity>
              )}
              
              {onRenameSession && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleRename(session.id, session.title)}
                >
                  <Edit3 size={16} color={colors.placeholder} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert(
                    'حذف المحادثة',
                    'هل أنت متأكد من حذف هذه المحادثة؟',
                    [
                      { text: 'إلغاء', style: 'cancel' },
                      { 
                        text: 'حذف', 
                        style: 'destructive',
                        onPress: () => onDeleteSession(session.id)
                      },
                    ]
                  );
                }}
              >
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {sortedSessions.length === 0 && (
          <View style={styles.emptyState}>
            <MessageSquare size={48} color={colors.placeholder} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد محادثات'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'جرب كلمات بحث أخرى' : 'ابدأ محادثة جديدة'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  newChatButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.lightText,
    fontWeight: '500',
  },
  sessionsList: {
    flex: 1,
  },
  sessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
  },
  sessionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionItemActive: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  sessionTitleActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  sessionPreview: {
    fontSize: 12,
    color: colors.placeholder,
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 11,
    color: colors.placeholder,
  },
  sessionMessageCount: {
    fontSize: 11,
    color: colors.placeholder,
  },
  sessionActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  editContainer: {
    flex: 1,
  },
  editInput: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.placeholder,
    textAlign: 'center',
  },
});

export default ChatSessionList;

