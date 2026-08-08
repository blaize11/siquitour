import { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from './theme';

interface Province {
  id: number;
  name: string;
}

interface Municipality {
  id: number;
  name: string;
}

interface Barangay {
  id: number;
  name: string;
}

interface LocationSelectorProps {
  value: string;
  onChange: (location: string, barangayId?: number) => void;
}

const API_URL = 'http://localhost:8000/api/locations';

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<number | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null);

  const [loading, setLoading] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/provinces`);
      const data = await res.json();
      setProvinces(data);
      // Auto-select Siquijor (should be first)
      if (data.length > 0) {
        setSelectedProvinceId(data[0].id);
        loadMunicipalities(data[0].id);
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMunicipalities = async (provinceId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/municipalities/${provinceId}`);
      const data = await res.json();
      setMunicipalities(data);
      setSelectedMunicipalityId(null);
      setBarangays([]);
    } catch (error) {
      console.error('Error loading municipalities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBarangays = async (municipalityId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/barangays/${municipalityId}`);
      const data = await res.json();
      setBarangays(data);
      setSelectedBarangay(null);
    } catch (error) {
      console.error('Error loading barangays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = (provinceId: number) => {
    setSelectedProvinceId(provinceId);
    loadMunicipalities(provinceId);
  };

  const handleMunicipalityChange = (municipalityId: number) => {
    setSelectedMunicipalityId(municipalityId);
    loadBarangays(municipalityId);
  };

  const handleBarangaySelect = (barangay: Barangay) => {
    setSelectedBarangay(barangay);
    const municipalityName = municipalities.find((m) => m.id === selectedMunicipalityId)?.name;
    const fullAddress = `${barangay.name}, ${municipalityName}, Siquijor`;
    onChange(fullAddress, barangay.id);
    setShowDropdown(false);
  };

  const displayValue = value || 'Select location...';
  const selectedProvinceName = provinces.find((p) => p.id === selectedProvinceId)?.name;
  const selectedMunicipalityName = municipalities.find((m) => m.id === selectedMunicipalityId)?.name;

  return (
    <View>
      <Text style={{ ...typography.caption, marginBottom: spacing.xs }}>Address (Siquijor)</Text>
      <Pressable
        onPress={() => setShowDropdown(!showDropdown)}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.sm,
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ color: value ? colors.text : colors.border, fontSize: 14 }}>
          {displayValue}
        </Text>
      </Pressable>

      {showDropdown && (
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            marginTop: spacing.xs,
            backgroundColor: colors.surface,
            maxHeight: 400,
            zIndex: 1000,
          }}
        >
          {loading ? (
            <View style={{ padding: spacing.md, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView nestedScrollEnabled>
              {/* Municipality Selection */}
              <View style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }}>
                <Text style={{ ...typography.caption, fontWeight: '600', marginBottom: spacing.xs }}>
                  Municipality
                </Text>
                {municipalities.map((municipality) => (
                  <Pressable
                    key={municipality.id}
                    onPress={() => handleMunicipalityChange(municipality.id)}
                    style={{
                      paddingVertical: spacing.xs,
                      paddingHorizontal: spacing.xs,
                      backgroundColor: selectedMunicipalityId === municipality.id ? colors.primary + '20' : 'transparent',
                      borderRadius: radius.sm,
                      marginBottom: spacing.xs,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedMunicipalityId === municipality.id ? colors.primary : colors.text,
                        fontWeight: selectedMunicipalityId === municipality.id ? '600' : '400',
                      }}
                    >
                      {municipality.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Barangay Selection */}
              {selectedMunicipalityId && (
                <View
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text style={{ ...typography.caption, fontWeight: '600', marginBottom: spacing.xs }}>
                    Barangay
                  </Text>
                  {barangays.map((barangay) => (
                    <Pressable
                      key={barangay.id}
                      onPress={() => handleBarangaySelect(barangay)}
                      style={{
                        paddingVertical: spacing.xs,
                        paddingHorizontal: spacing.xs,
                        backgroundColor: selectedBarangay?.id === barangay.id ? colors.primary + '20' : 'transparent',
                        borderRadius: radius.sm,
                        marginBottom: spacing.xs,
                      }}
                    >
                      <Text
                        style={{
                          color: selectedBarangay?.id === barangay.id ? colors.primary : colors.text,
                          fontWeight: selectedBarangay?.id === barangay.id ? '600' : '400',
                        }}
                      >
                        {barangay.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}
