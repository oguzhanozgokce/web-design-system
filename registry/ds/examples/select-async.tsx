'use client';

import { useEffect, useState } from 'react';
import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

interface City {
  id: string;
  name: string;
  country: string;
}

const cities: City[] = [
  ['Accra', 'Ghana'],
  ['Amsterdam', 'Netherlands'],
  ['Auckland', 'New Zealand'],
  ['Bangkok', 'Thailand'],
  ['Barcelona', 'Spain'],
  ['Bogotá', 'Colombia'],
  ['Buenos Aires', 'Argentina'],
  ['Cairo', 'Egypt'],
  ['Cape Town', 'South Africa'],
  ['Chicago', 'United States'],
  ['Copenhagen', 'Denmark'],
  ['Dublin', 'Ireland'],
  ['Hanoi', 'Vietnam'],
  ['Helsinki', 'Finland'],
  ['Istanbul', 'Turkey'],
  ['Jakarta', 'Indonesia'],
  ['Kyoto', 'Japan'],
  ['Lagos', 'Nigeria'],
  ['Lima', 'Peru'],
  ['Lisbon', 'Portugal'],
  ['London', 'United Kingdom'],
  ['Manila', 'Philippines'],
  ['Melbourne', 'Australia'],
  ['Mexico City', 'Mexico'],
  ['Montréal', 'Canada'],
  ['Mumbai', 'India'],
  ['Nairobi', 'Kenya'],
  ['Oslo', 'Norway'],
  ['Paris', 'France'],
  ['Prague', 'Czechia'],
  ['Santiago', 'Chile'],
  ['São Paulo', 'Brazil'],
  ['Seoul', 'South Korea'],
  ['Singapore', 'Singapore'],
  ['Toronto', 'Canada'],
  ['Vienna', 'Austria'],
].map(([name, country]) => ({ id: name, name, country }));

const pageSize = 12;

function fetchCities(offset: number) {
  return new Promise<City[]>((resolve) => {
    setTimeout(() => resolve(cities.slice(offset, offset + pageSize)), 1000);
  });
}

export default function SelectAsync() {
  const [items, setItems] = useState<City[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCities(0).then((page) => {
      if (!active) return;
      setItems(page);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  function loadMore() {
    if (isLoading || items.length >= cities.length) return;
    setLoading(true);
    fetchCities(items.length).then((page) => {
      setItems((current) => [...current, ...page]);
      setLoading(false);
    });
  }

  return (
    <Select
      label="City"
      placeholder="Choose a city"
      items={items}
      isLoading={isLoading}
      onLoadMore={loadMore}
      className="w-full max-w-xs"
    >
      {(city) => <ListBoxItem description={city.country}>{city.name}</ListBoxItem>}
    </Select>
  );
}
