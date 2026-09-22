export type Service = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  ventureTypeId?: string;
  heroImageUrl?: string | null;
};

export type ServiceCategory = {
  name: string;
  services: Service[];
};
