import { resolveFileUrl, BACKEND_ORIGIN, API_BASE_URL } from './api.constants';

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
});
