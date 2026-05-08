export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface Student {
  id:               number;
  firstName:        string;
  lastName:         string;
  email:            string;
  enrollmentNumber: string;
  phone:            string | null;
  address:          string | null;
  guardianName:     string | null;
  bio:              string | null;
  course:           string;
  year:             number | null;
  gpa:              number | null;
  gender:           Gender | null;
  dateOfBirth:      string | null;
  enrollmentDate:   string;
  isActive:         boolean;
  profileImageUrl:  string | null;
  createdAt:        string;
  updatedAt:        string;
}

export interface StudentRequest {
  firstName:        string;
  lastName:         string;
  email:            string;
  enrollmentNumber: string;
  phone:            string | null;
  address:          string | null;
  guardianName:     string | null;
  bio:              string | null;
  course:           string;
  year:             number | null;
  gpa:              number | null;
  gender:           Gender | null;
  dateOfBirth:      string | null;
  enrollmentDate:   string;
  isActive:         boolean;
}

export interface StudentSearchParams {
  keyword?: string;
  course?:  string;
  year?:    number;
  gender?:  string;
  page:     number;
  size:     number;
  sortBy:   string;
  sortDir:  'asc' | 'desc';
}