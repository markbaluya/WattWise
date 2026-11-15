import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

type Props = {
  content: string;
  color: string;
  secondaryColor: string;
  cyanColor: string;
};

// Parse inline markdown (bold, italic) into Text segments
function renderInline(text: string, baseColor: string, key: number) {
  const parts: React.ReactNode[] = [];
  // Split by bold (**text**), italic (*text*) and inline code (`text`)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`t-${key}-${i++}`} style={{ color: baseColor }}>
          {text.slice(lastIndex, match.index)}
        </Text>
      );
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <Text key={`b-${key}-${i++}`} style={{ color: baseColor, fontWeight: '700' }}>
          {token.slice(2, -2)}
        </Text>
      );
    } else {
      parts.push(
        <Text key={`i-${key}-${i++}`} style={{ color: baseColor, fontStyle: 'italic' }}>
          {token.slice(1, -1)}
        </Text>
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(
      <Text key={`t-${key}-${i++}`} style={{ color: baseColor }}>
        {text.slice(lastIndex)}
      </Text>
    );
  }
  if (parts.length === 0) {
    parts.push(<Text key={`t-${key}-0`} style={{ color: baseColor }}>{text}</Text>);
  }
  return parts;
}

export function MarkdownText({ content, color, secondaryColor, cyanColor }: Props) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'bullet' | 'ordered' | null = null;
  let listCounter = 1;

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <View key={`list-${blocks.length}`} style={styles.listContainer}>
        {listItems.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <Text style={[styles.listMarker, { color: cyanColor }]}>
              {listType === 'ordered' ? `${idx + 1}.` : '•'}
            </Text>
            <Text style={[styles.listText, { color }]}>{renderInline(item, color, idx)}</Text>
          </View>
        ))}
      </View>
    );
    listItems = [];
    listType = null;
    listCounter = 1;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd();
    // Heading
    if (/^#{1,3}\s/.test(line)) {
      flushList();
      const level = line.match(/^#+/)![0].length;
      const text = line.replace(/^#+\s*/, '');
      blocks.push(
        <Text key={`h-${idx}`} style={[styles.heading, { color, fontSize: level === 1 ? 18 : level === 2 ? 16 : 15 }]}>
          {renderInline(text, color, idx)}
        </Text>
      );
      return;
    }
    // Bullet list
    if (/^[-*]\s/.test(line)) {
      if (listType !== 'bullet') flushList();
      listType = 'bullet';
      listItems.push(line.replace(/^[-*]\s*/, ''));
      return;
    }
    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      if (listType !== 'ordered') flushList();
      listType = 'ordered';
      listItems.push(line.replace(/^\d+\.\s*/, ''));
      return;
    }
    // Empty line
    if (line.trim() === '') {
      flushList();
      blocks.push(<View key={`sp-${idx}`} style={{ height: 6 }} />);
      return;
    }
    // Paragraph
    flushList();
    blocks.push(
      <Text key={`p-${idx}`} style={[styles.paragraph, { color }]}>
        {renderInline(line, color, idx)}
      </Text>
    );
  });
  flushList();

  return <View style={styles.container}>{blocks}</View>;
}

const styles = StyleSheet.create({
  container: { },
  heading: { fontWeight: '700', marginTop: 8, marginBottom: 4 },
  paragraph: { marginVertical: 4, lineHeight: 20 },
  listContainer: { marginVertical: 4 },
  listItem: { flexDirection: 'row', marginBottom: 2, paddingLeft: 4 },
  listMarker: { marginRight: 8, fontWeight: '700', minWidth: 16 },
  listText: { flex: 1, lineHeight: 20 },
});