import { Department } from './department.model';
import { EmploymentStatus } from './status.model';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface Employee {
  id:              number;
  firstName:       string;
  lastName:        string;
  email:           string;
  phone:           string | null;
  address:         string | null;
  bio:             string | null;
  department:      Department | null;
  status:          EmploymentStatus | null;
  gender:          Gender | null;
  salary:          number | null;
  experienceYears: number | null;
  rating:          number | null;
  isRemote:        boolean;
  dateOfBirth:     string | null;
  joiningDate:     string;
  profileImageUrl: string | null;
  resumeUrl:       string | null;
  resumeFileName:  string | null;
  createdAt:       string;
  updatedAt:       string;
}

export interface EmployeeRequest {
  firstName:       string;
  lastName:        string;
  email:           string;
  phone:           string | null;
  address:         string | null;
  bio:             string | null;
  departmentId:    number | null;
  statusId:        number | null;
  gender:          Gender | null;
  salary:          number | null;
  experienceYears: number | null;
  rating:          number | null;
  isRemote:        boolean;
  dateOfBirth:     string | null;
  joiningDate:     string;
}

export interface EmployeeSearchParams {
  keyword?:      string;
  departmentId?: number;
  statusId?:     number;
  page:          number;
  size:          number;
  sortBy:        string;
  sortDir:       'asc' | 'desc';
}

export interface PagedResponse<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
  last:          boolean;
}
