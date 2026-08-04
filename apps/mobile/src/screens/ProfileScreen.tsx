import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSession } from '../auth/SessionContext';
import { Button, Card, RoleBadge, ScreenContainer, spacing, typography } from '../components';

export function ProfileScreen({ children }: { children?: ReactNode }) {
  const { user, logout } = useSession();

  if (!user) return null;

  return (
    <ScreenContainer>
      <Text style={typography.title}>Profile</Text>

      <Card style={{ gap: spacing.xs }}>
        <Text style={typography.subtitle}>{user.name}</Text>
        <Text style={typography.caption}>{user.email}</Text>
        {user.phone && <Text style={typography.caption}>{user.phone}</Text>}
        <View style={{ marginTop: spacing.xs }}>
          <RoleBadge role={user.role} />
        </View>
      </Card>

      {children}

      <Button title="Log out" variant="danger" onPress={() => logout()} />
    </ScreenContainer>
  );
}
