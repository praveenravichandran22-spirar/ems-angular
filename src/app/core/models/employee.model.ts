import { Country } from './country.model';
import { Department } from './department.model';
import { EmploymentStatus } from './status.model';
import { AppRole } from './auth.model';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type WorkflowStatus =
  'DRAFT' | 'IN_REVIEW' | 'IN_APPROVAL' | 'APPROVED' | 'REJECTED';

export type WorkflowActionType =
  'SUBMITTED' | 'REVIEW_APPROVED' | 'REVIEW_REJECTED' | 'FINAL_APPROVED' | 'FINAL_REJECTED';

export interface WorkflowUser {
  id:        number;
  firstName: string;
  lastName:  string;
  email:     string;
  role:      AppRole;
}

export interface WorkflowAction {
  id:               number;
  performedByName:  string;
  performedByEmail: string;
  actionType:       WorkflowActionType;
  note:             string;
  createdAt:        string;
}

export interface AssignWorkflowRequest {
  reviewerIds: number[];
  approverIds: number[];
}

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
  country:         Country | null;
  gender:          Gender | null;
  salary:          number | null;
  experienceYears: number | null;
  rating:          number | null;
  isRemote:        boolean;
  dateOfBirth:     string | null;
  joiningDate:     string;
  profileImageUrl:      string | null;
  profileImageFileName: string | null;
  resumeUrl:            string | null;
  resumeFileName:       string | null;
  createdAt:            string;
  updatedAt:            string;
  workflowStatus:       WorkflowStatus;
  assignedReviewers:    WorkflowUser[];
  assignedApprovers:    WorkflowUser[];
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
  countryId:       number | null;
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
