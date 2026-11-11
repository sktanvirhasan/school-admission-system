import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';
import { ClassList } from './components/classes/ClassList';
import { ApplicationView } from './components/applications/ApplicationView';
import { StudentProvider } from './context/StudentContext';
import { LanguageProvider } from './i18n';
import { bn } from './i18n/bn';
import { en } from './i18n/en';
import { api } from './api';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <StudentProvider>
        {ui}
      </StudentProvider>
    </LanguageProvider>
  );
};

describe('School Admission Frontend Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(api, 'getClasses').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('validates 17-digit birth registration number and shows character count', async () => {
    render(<App />);

    const input = screen.getByPlaceholderText(bn.identity.placeholder);
    fireEvent.change(input, { target: { value: '123456789' } });

    const expectedError = bn.identity.invalid_error.replace('{count}', '9');
    expect(screen.getByText(expectedError)).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: bn.identity.save });
    expect(saveButton).toBeDisabled();
  });

  it('saves and displays student ID when exactly 17 digits are entered', async () => {
    render(<App />);

    const input = screen.getByPlaceholderText(bn.identity.placeholder);
    fireEvent.change(input, { target: { value: '20152691234567890' } });

    const saveButton = screen.getByRole('button', { name: bn.identity.save });
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getAllByText('20152691234567890').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(bn.identity.verified)).toBeInTheDocument();
    });
  });

  it('switches between Bengali and English languages via language toggle', async () => {
    render(<App />);

    expect(screen.getAllByText(bn.brand.title).length).toBeGreaterThanOrEqual(1);

    const enButton = screen.getByRole('button', { name: bn.brand.lang_en });
    fireEvent.click(enButton);

    await waitFor(() => {
      expect(screen.getAllByText(en.brand.title).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByPlaceholderText(en.identity.placeholder)).toBeInTheDocument();
    });

    const bnButton = screen.getByRole('button', { name: bn.brand.lang_bn });
    fireEvent.click(bnButton);

    await waitFor(() => {
      expect(screen.getAllByText(bn.brand.title).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByPlaceholderText(bn.identity.placeholder)).toBeInTheDocument();
    });
  });

  it('disables the admission fee payment button when the countdown expires (UI Rule 9)', async () => {
    vi.useFakeTimers();

    const futureExpiry = new Date(Date.now() + 2000).toISOString();

    vi.spyOn(api, 'getHold').mockResolvedValue({
      holdId: 'h_test123',
      classId: 'c_test123',
      status: 'HELD',
      expiresAt: futureExpiry,
    });

    vi.spyOn(api, 'getClass').mockResolvedValue({
      id: 'c_test123',
      name: 'Class 6 - Morning Shift',
      totalSeats: 120,
      heldSeats: 1,
      confirmedSeats: 0,
      availableSeats: 119,
    });

    renderWithProviders(<ApplicationView holdId="h_test123" />);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const feeButton = screen.getByRole('button', { name: bn.application.pay_fee_btn });
    expect(feeButton).not.toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(feeButton).toBeDisabled();
    expect(screen.getByText(bn.application.status_expired)).toBeInTheDocument();
  });

  it('confirms the hold when user clicks fee payment button', async () => {
    const futureExpiry = new Date(Date.now() + 60000).toISOString();

    vi.spyOn(api, 'getHold').mockResolvedValue({
      holdId: 'h_confirm1',
      classId: 'c_test123',
      status: 'HELD',
      expiresAt: futureExpiry,
    });

    vi.spyOn(api, 'getClass').mockResolvedValue({
      id: 'c_test123',
      name: 'Class 6 - Morning Shift',
      totalSeats: 120,
      heldSeats: 1,
      confirmedSeats: 0,
      availableSeats: 119,
    });

    vi.spyOn(api, 'confirmHold').mockResolvedValue({
      holdId: 'h_confirm1',
      status: 'CONFIRMED',
    });

    localStorage.setItem('school_admission_student_id', '20152691234567890');

    renderWithProviders(<ApplicationView holdId="h_confirm1" />);

    const feeButton = await screen.findByRole('button', { name: bn.application.pay_fee_btn });
    fireEvent.click(feeButton);

    await waitFor(() => {
      expect(api.confirmHold).toHaveBeenCalledWith('h_confirm1', '20152691234567890');
      expect(screen.getByText(bn.application.status_confirmed)).toBeInTheDocument();
    });
  });

  it('cancels the hold when user clicks cancel button', async () => {
    const futureExpiry = new Date(Date.now() + 60000).toISOString();

    vi.spyOn(api, 'getHold').mockResolvedValue({
      holdId: 'h_cancel1',
      classId: 'c_test123',
      status: 'HELD',
      expiresAt: futureExpiry,
    });

    vi.spyOn(api, 'getClass').mockResolvedValue({
      id: 'c_test123',
      name: 'Class 6 - Morning Shift',
      totalSeats: 120,
      heldSeats: 1,
      confirmedSeats: 0,
      availableSeats: 119,
    });

    vi.spyOn(api, 'cancelHold').mockResolvedValue(undefined as unknown as void);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    localStorage.setItem('school_admission_student_id', '20152691234567890');

    renderWithProviders(<ApplicationView holdId="h_cancel1" />);

    const cancelButton = await screen.findByRole('button', { name: bn.application.cancel_btn });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(api.cancelHold).toHaveBeenCalledWith('h_cancel1', '20152691234567890');
      expect(screen.getByText(bn.application.status_cancelled)).toBeInTheDocument();
    });
  });

  it('updates available seats when a hold expires and seats are released', async () => {
    vi.useFakeTimers();

    const getClassesMock = vi.spyOn(api, 'getClasses')
      .mockResolvedValueOnce([
        {
          id: 'c_test123',
          name: 'Class 6 - Morning Shift',
          totalSeats: 5,
          heldSeats: 1,
          confirmedSeats: 0,
          availableSeats: 4,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'c_test123',
          name: 'Class 6 - Morning Shift',
          totalSeats: 5,
          heldSeats: 0,
          confirmedSeats: 0,
          availableSeats: 5,
        },
      ]);

    renderWithProviders(<ClassList onHoldCreated={vi.fn()} />);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('4')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getAllByText('5').length).toBe(2);
    expect(getClassesMock).toHaveBeenCalledTimes(2);
  });
});
