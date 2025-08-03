import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clipboard } from 'react-native';
import { Check, Clipboard as ClipboardIcon } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useLanguage } from '@/hooks/language-store';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.language}>{language || 'code'}</Text>
        <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
          {copied ? (
            <Check size={16} color={colors.success} />
          ) : (
            <ClipboardIcon size={16} color={colors.placeholder} />
          )}
          <Text style={styles.copyText}>
            {copied ? t('chat.code.copied', 'Copied!') : t('chat.code.copy', 'Copy')}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.code}>{code}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  language: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  copyText: {
    fontSize: 12,
    color: colors.lightText,
    marginLeft: 4,
  },
  code: {
    fontSize: 13,
    color: '#d4d4d4',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});

export default CodeBlock;
