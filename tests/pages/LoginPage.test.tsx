import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';

vi.mock('@/lib/hCaptcha', () => ({
  renderHCaptcha: vi.fn().mockResolvedValue(1),
  resetHCaptcha: vi.fn(),
  removeHCaptcha: vi.fn(),
  getHCaptchaTheme: vi.fn(() => 'light'),
  HCAPTCHA_SITE_KEY: 'test-site-key',
}));

const useLoginFormMock = vi.fn();
vi.mock('@/hooks', () => ({
  useLoginForm: (...args: unknown[]) => useLoginFormMock(...args),
  useUser: () => ({ data: null, isLoading: false }),
}));

const defaultForm = {
  login: '',
  setLogin: vi.fn(),
  password: '',
  setPassword: vi.fn(),
  error: '',
  isLoggingIn: false,
  captchaRequired: false,
  captchaNonce: 0,
  handleSubmit: vi.fn(),
  handleCaptchaSolved: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  useLoginFormMock.mockReturnValue(defaultForm);
});

describe('LoginPage vertical centering', () => {
  it('wrapper uses dvh-based min-height (not 60vh)', () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('min-h-[calc(100dvh');
    expect(wrapper.className).not.toContain('min-h-[60vh]');
  });

  it('wrapper has flex centering classes', () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex');
    expect(wrapper.className).toContain('items-center');
    expect(wrapper.className).toContain('justify-center');
  });

  it('subtracts at least 6rem for header/padding', () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/min-h-\[calc\(100dvh-(\d+)rem\)\]/);
    const match = wrapper.className.match(/min-h-\[calc\(100dvh-(\d+)rem\)\]/);
    expect(match).not.toBeNull();
    if (match) {
      const rems = parseInt(match[1] ?? '0', 10);
      expect(rems).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('LoginPage', () => {
  it('renders title', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Вход')).toBeInTheDocument();
  });

  it('does not render the captcha field by default', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.queryByTestId('captcha-field')).not.toBeInTheDocument();
  });

  it('renders the inline captcha field when a captcha is required', () => {
    useLoginFormMock.mockReturnValue({ ...defaultForm, captchaRequired: true, captchaNonce: 3 });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('captcha-field')).toBeInTheDocument();
  });
});