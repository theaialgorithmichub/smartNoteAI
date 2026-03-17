import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { AIAPI } from '../../services/api';
import { DashboardStackParamList } from '../../navigation/types';

type AIChatRouteProp = RouteProp<DashboardStackParamList, 'AIChat'>;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<AIChatRouteProp>();
  const { notebookId } = route.params;
  const { colors, isDark } = useTheme();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: notebookId
        ? "Hi! I'm your notebook AI assistant. I can help you with your notes, answer questions about the content, suggest improvements, and more. How can I help?"
        : "Hi! I'm SmartNote AI. I can help you write, research, brainstorm, answer questions, and more. What would you like to explore today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chatMessages = messages.concat(userMessage).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = notebookId
        ? await AIAPI.chat(chatMessages, notebookId)
        : await AIAPI.publicChat(chatMessages);

      const aiContent = res.data.message || res.data.content || res.data.text || 'I understand. How can I help further?';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const QUICK_PROMPTS = [
    'Help me improve this writing',
    'Summarize key points',
    'Generate an outline',
    'Find related research',
    'Suggest next steps',
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.aiAvatar}>
            <Ionicons name="flash" size={16} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>SmartNote AI</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {notebookId ? 'Notebook Assistant' : 'General Assistant'}
            </Text>
          </View>
        </View>
        <View style={[styles.onlineDot, { backgroundColor: '#10b981' }]} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
            ]}
          >
            {message.role === 'assistant' && (
              <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.aiMessageAvatar}>
                <Ionicons name="flash" size={12} color="#fff" />
              </LinearGradient>
            )}
            <View
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? styles.userBubble
                  : [styles.aiBubble, { backgroundColor: isDark ? '#292524' : '#f5f5f4', borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: message.role === 'user' ? '#fff' : colors.foreground },
                ]}
              >
                {message.content}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={[styles.messageContainer, styles.aiMessageContainer]}>
            <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.aiMessageAvatar}>
              <Ionicons name="flash" size={12} color="#fff" />
            </LinearGradient>
            <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: isDark ? '#292524' : '#f5f5f4', borderColor: colors.border }]}>
              <View style={styles.typingIndicator}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[styles.typingDot, { backgroundColor: '#f59e0b' }]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPromptsScroll}
          style={[styles.quickPrompts, { borderTopColor: colors.border }]}
        >
          {QUICK_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              onPress={() => setInput(prompt)}
              style={[styles.quickPrompt, { backgroundColor: isDark ? '#292524' : '#f5f5f4', borderColor: colors.border }]}
            >
              <Text style={[styles.quickPromptText, { color: colors.foreground }]}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: isDark ? '#1c1917' : '#fff', borderTopColor: colors.border },
        ]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message SmartNote AI..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[
            styles.input,
            {
              color: colors.foreground,
              backgroundColor: isDark ? '#292524' : '#f5f5f4',
              borderColor: colors.border,
            },
          ]}
          maxLength={2000}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          style={[styles.sendBtn, { opacity: !input.trim() || loading ? 0.5 : 1 }]}
        >
          <LinearGradient
            colors={['#f59e0b', '#f97316']}
            style={styles.sendGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '90%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },
  aiMessageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#f59e0b',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.7,
  },
  quickPrompts: {
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPrompt: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickPromptText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {},
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
