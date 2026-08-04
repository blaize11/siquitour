import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useAdminUsers, useUpdateUserStatus, useVerifyUser } from '../../src/api/queries/admin';
import {
  Button,
  Card,
  EmptyState,
  ErrorView,
  LoadingView,
  RoleBadge,
  ScreenContainer,
  colors,
  radius,
  spacing,
  typography,
} from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';
import type { Role } from '../../src/types/api';

const filters: { label: string; value: Role | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Guests', value: 'guest' },
  { label: 'Guides', value: 'tour_guide' },
  { label: 'Renters', value: 'renter' },
];

export default function AdminUsersScreen() {
  const [roleFilter, setRoleFilter] = useState<Role | undefined>(undefined);
  const { data, isLoading, isError, error, refetch } = useAdminUsers(roleFilter);
  const verifyUser = useVerifyUser();
  const updateStatus = useUpdateUserStatus();

  return (
    <ScreenContainer scroll={false}>
      <Text style={typography.title}>Users</Text>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {filters.map((filter) => (
          <Pressable
            key={filter.label}
            onPress={() => setRoleFilter(filter.value)}
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.sm,
              backgroundColor: roleFilter === filter.value ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: roleFilter === filter.value ? colors.primary : colors.border,
            }}
          >
            <Text style={{ color: roleFilter === filter.value ? '#fff' : colors.text, fontSize: 13 }}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading && <LoadingView />}
      {isError && <ErrorView message={extractErrorMessage(error)} onRetry={refetch} />}
      {!isLoading && !isError && !data?.data.length && <EmptyState message="No users found." />}

      {!!data?.data.length && (
        <FlatList
          data={data.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => {
            const profile = item.tour_guide_profile ?? item.renter_profile;
            const canVerify = (item.role === 'tour_guide' || item.role === 'renter') && profile && !profile.is_verified;

            return (
              <Card style={{ gap: spacing.xs }}>
                <Text style={typography.subtitle}>{item.name}</Text>
                <Text style={typography.caption}>{item.email}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                  <RoleBadge role={item.role} />
                  <Text style={typography.caption}>{item.status}</Text>
                  {profile?.is_verified && <Text style={typography.caption}>✓ verified</Text>}
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                  {canVerify && (
                    <Button
                      title="Verify"
                      variant="secondary"
                      onPress={() => verifyUser.mutate(item.id)}
                      disabled={verifyUser.isPending}
                    />
                  )}
                  {item.role !== 'admin' && (
                    <Button
                      title={item.status === 'active' ? 'Suspend' : 'Activate'}
                      variant={item.status === 'active' ? 'danger' : 'secondary'}
                      onPress={() =>
                        updateStatus.mutate({
                          userId: item.id,
                          status: item.status === 'active' ? 'suspended' : 'active',
                        })
                      }
                      disabled={updateStatus.isPending}
                    />
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}
