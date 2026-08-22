'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { clientApiFetch } from '@/lib/client-api';

export default function ExplorePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'guides' | 'rentals' | 'spots' | 'restaurants'>('guides');

  // Fetch guides
  const { data: guidesData, isLoading: guidesLoading, error: guidesError } = useQuery({
    queryKey: ['explore-guides', search],
    queryFn: () => clientApiFetch('/explore/guides', { params: { search: search || undefined } }),
    enabled: activeTab === 'guides',
    retry: 2,
    staleTime: 60000,
  });

  // Fetch rentals
  const { data: rentalsData, isLoading: rentalsLoading, error: rentalsError } = useQuery({
    queryKey: ['explore-rentals', search],
    queryFn: () => clientApiFetch('/explore/rentals', { params: { search: search || undefined } }),
    enabled: activeTab === 'rentals',
    retry: 2,
    staleTime: 60000,
  });

  // Fetch spots
  const { data: spotsData, isLoading: spotsLoading, error: spotsError } = useQuery({
    queryKey: ['explore-spots', search],
    queryFn: () => clientApiFetch('/explore/spots', { params: { search: search || undefined } }),
    enabled: activeTab === 'spots',
    retry: 2,
    staleTime: 60000,
  });

  // Fetch restaurants
  const { data: restaurantsData, isLoading: restaurantsLoading, error: restaurantsError } = useQuery({
    queryKey: ['explore-restaurants', search],
    queryFn: () => clientApiFetch('/explore/restaurants', { params: { search: search || undefined } }),
    enabled: activeTab === 'restaurants',
    retry: 2,
    staleTime: 60000,
  });

  const isLoading =
    guidesLoading || rentalsLoading || spotsLoading || restaurantsLoading;

  const getError = () => {
    switch (activeTab) {
      case 'guides':
        return guidesError;
      case 'rentals':
        return rentalsError;
      case 'spots':
        return spotsError;
      case 'restaurants':
        return restaurantsError;
      default:
        return null;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'guides':
        return guidesData?.data || [];
      case 'rentals':
        return rentalsData?.data || [];
      case 'spots':
        return spotsData?.data || [];
      case 'restaurants':
        return restaurantsData?.data || [];
      default:
        return [];
    }
  };

  const data = getCurrentData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Explore</h1>
        <p className="text-sm text-muted-foreground">Browse all guides, rentals, spots, and restaurants</p>
      </div>

      {/* Search Bar */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        {['guides', 'rentals', 'spots', 'restaurants'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Error State */}
      {getError() && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Error loading {activeTab}: {getError() instanceof Error ? getError().message : 'Unknown error'}
          </p>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      ) : data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item: any) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-surface p-4 hover:border-primary transition-colors"
            >
              {activeTab === 'guides' && (
                <>
                  <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.tour_guide_profile?.bio}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">
                      PHP {item.tour_guide_profile?.rate_per_pax}/pax
                    </span>
                    <span className="text-muted-foreground">
                      {item.tour_guide_profile?.years_experience || 0} yrs exp
                    </span>
                  </div>
                </>
              )}
              {activeTab === 'rentals' && (
                <>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.type}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">
                      PHP {item.price_per_day}/day
                    </span>
                    <span className="text-muted-foreground">{item.address}</span>
                  </div>
                </>
              )}
              {activeTab === 'spots' && (
                <>
                  <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.municipality}</span>
                    <span className="font-semibold text-primary">
                      PHP {item.fee_amount} fee
                    </span>
                  </div>
                </>
              )}
              {activeTab === 'restaurants' && (
                <>
                  <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.cuisine_tags?.join(', ')}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.municipality}</span>
                    <span className="text-primary">{item.price_range}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No {activeTab} found</p>
        </div>
      )}
    </div>
  );
}
