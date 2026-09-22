export type Service = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
};

export type ServiceCategory = {
  name: string;
  services: Service[];
};
