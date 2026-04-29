export interface EmploymentStatus {
  id:          number;
  name:        string;
  description: string | null;
}

export interface EmploymentStatusRequest {
  name:        string;
  description: string | null;
}
