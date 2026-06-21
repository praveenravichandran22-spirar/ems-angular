import { resolveFileUrl, BACKEND_ORIGIN, API_BASE_URL, API_ROUTES } from './api.constants';

describe('api.constants', () => {
  describe('resolveFileUrl', () => {
    it('returns null for null input', () => {
      expect(resolveFileUrl(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(resolveFileUrl(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(resolveFileUrl('')).toBeNull();
    });

    it('prepends BACKEND_ORIGIN to a relative URL', () => {
      expect(resolveFileUrl('/api/files/photo.jpg')).toBe(`${BACKEND_ORIGIN}/api/files/photo.jpg`);
    });

    it('constructs correct full URL', () => {
      const result = resolveFileUrl('/uploads/resume.pdf');
      expect(result).toBe('http://localhost:8080/uploads/resume.pdf');
    });
  });

  describe('API_BASE_URL', () => {
    it('points to localhost:8080/api', () => {
      expect(API_BASE_URL).toBe('http://localhost:8080/api');
    });
  });

  describe('API_ROUTES — parameterised route functions', () => {
    it('departments.byId builds correct URL', () => {
      expect(API_ROUTES.departments.byId(3)).toBe(`${API_BASE_URL}/departments/3`);
    });

    it('statuses.byId builds correct URL', () => {
      expect(API_ROUTES.statuses.byId(7)).toBe(`${API_BASE_URL}/statuses/7`);
    });

    it('countries.byId builds correct URL', () => {
      expect(API_ROUTES.countries.byId(42)).toBe(`${API_BASE_URL}/countries/42`);
    });

    it('files.url builds correct URL', () => {
      expect(API_ROUTES.files.url('uploads/photo.jpg'))
        .toBe('http://localhost:8080/api/files/uploads/photo.jpg');
    });
  });
});
