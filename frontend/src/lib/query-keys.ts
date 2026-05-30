export const queryKeys = {
  employees: {
    all:    ['employees']                              as const,
    list:   (filters: object) => ['employees', 'list', filters] as const,
    detail: (id: string)      => ['employees', 'detail', id]    as const,
  },
  insights: {
    country:   (country: string) => ['insights', 'country', country]  as const,
    jobTitle:  (title: string, country: string) =>
                 ['insights', 'job-title', title, country]             as const,
    topEarners:(limit: number, country?: string)   => ['insights', 'top-earners', limit, country] as const,
    departments: (country?: string)                => ['insights', 'departments', country]        as const,
  },
}