export interface SimEmployee {
  id:              number;
  firstName:       string;
  lastName:        string;
  email:           string;
  department:      string | null;
  status:          string | null;
  salary:          number | null;
  joiningDate:     string;
  experienceYears: number | null;
  isRemote:        boolean;
}

export interface SimSearchParams {
  keyword?:    string;
  department?: string;
  status?:     string;
  page:        number;
  size:        number;
  sortBy:      string;
  sortDir:     'asc' | 'desc';
}
