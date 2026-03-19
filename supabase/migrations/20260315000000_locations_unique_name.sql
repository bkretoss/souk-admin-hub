-- Unique constraint on location name (case-insensitive)
CREATE UNIQUE INDEX locations_name_unique_idx ON public.locations (lower(name));
