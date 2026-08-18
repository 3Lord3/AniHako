import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddFriendDialog } from '@/components/friends/AddFriendDialog';
import * as hooks from '@/hooks';

vi.mock('@/hooks', async () => {
  const actual = await vi.importActual('@/hooks');
  return {
    ...actual,
    useAddFriendDialog: vi.fn(),
  };
});

const baseReturn = {
  open: false,
  handleOpenChange: vi.fn(),
  openDialog: vi.fn(),
  idInput: '',
  handleInputChange: vi.fn(),
  handleCheck: vi.fn(),
  isChecking: false,
  displayError: null,
  hasResult: false,
  resolvedId: null,
  resolvedLabel: null,
  status: null,
  actions: [],
  handleAction: vi.fn(),
  pendingFriendIds: new Set<number>(),
};

describe('AddFriendDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useAddFriendDialog).mockReturnValue(
      baseReturn as unknown as ReturnType<typeof hooks.useAddFriendDialog>
    );
  });

  it('renders the trigger button when the dialog is closed', () => {
    render(<AddFriendDialog userId={1} userNickname="Me" />);
    expect(screen.getByRole('button', { name: 'Добавить в друзья' })).toBeInTheDocument();
  });

  it('renders the input labelling when the dialog is open', () => {
    vi.mocked(hooks.useAddFriendDialog).mockReturnValue({
      ...baseReturn,
      open: true,
    } as unknown as ReturnType<typeof hooks.useAddFriendDialog>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    expect(screen.getByLabelText('Никнейм или ID пользователя')).toBeInTheDocument();
  });

  it('opens the dialog via openDialog when the trigger is clicked', () => {
    const openDialog = vi.fn();
    vi.mocked(hooks.useAddFriendDialog).mockReturnValue({
      ...baseReturn,
      openDialog,
    } as unknown as ReturnType<typeof hooks.useAddFriendDialog>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Добавить в друзья'));

    expect(openDialog).toHaveBeenCalled();
  });

  it('shows the displayError text when present', () => {
    vi.mocked(hooks.useAddFriendDialog).mockReturnValue({
      ...baseReturn,
      open: true,
      displayError: 'Нельзя добавить самого себя',
    } as unknown as ReturnType<typeof hooks.useAddFriendDialog>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    expect(screen.getByText('Нельзя добавить самого себя')).toBeInTheDocument();
  });

  it('renders the resolved result and wires action buttons to handleAction', () => {
    const handleAction = vi.fn();
    vi.mocked(hooks.useAddFriendDialog).mockReturnValue({
      ...baseReturn,
      open: true,
      hasResult: true,
      resolvedId: 43,
      resolvedLabel: 'Rei',
      status: 'requests',
      actions: [{ key: 'accept', label: 'Принять', method: 'add', variant: 'default' }],
      handleAction,
    } as unknown as ReturnType<typeof hooks.useAddFriendDialog>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    expect(screen.getByText('Rei')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Принять'));
    expect(handleAction).toHaveBeenCalledWith('add');
  });

  it('disables action buttons for a pending resolvedId', () => {
    vi.mocked(hooks.useAddFriendDialog).mockReturnValue({
      ...baseReturn,
      open: true,
      hasResult: true,
      resolvedId: 43,
      resolvedLabel: 'Rei',
      actions: [{ key: 'accept', label: 'Принять', method: 'add', variant: 'default' }],
      pendingFriendIds: new Set([43]),
    } as unknown as ReturnType<typeof hooks.useAddFriendDialog>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    expect(screen.getByText('Принять')).toBeDisabled();
  });

  it('calls handleCheck when clicking "Проверить" or pressing Enter', () => {
    const handleCheck = vi.fn();
    vi.mocked(hooks.useAddFriendDialog).mockReturnValue({
      ...baseReturn,
      open: true,
      handleCheck,
    } as unknown as ReturnType<typeof hooks.useAddFriendDialog>);

    render(<AddFriendDialog userId={1} userNickname="Me" />);
    fireEvent.click(screen.getByText('Проверить'));
    expect(handleCheck).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByLabelText('Никнейм или ID пользователя'), { key: 'Enter' });
    expect(handleCheck).toHaveBeenCalledTimes(2);
  });
});
