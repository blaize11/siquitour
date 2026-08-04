import { useLocalSearchParams } from 'expo-router';
import { ConversationThreadScreen } from '../../../src/screens/ConversationThreadScreen';

export default function GuideChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ConversationThreadScreen conversationId={Number(id)} />;
}
