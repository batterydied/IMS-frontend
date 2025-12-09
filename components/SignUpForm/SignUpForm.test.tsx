import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SignUpForm from "./SignUpForm";

// --- 1. MOCK DEPENDENCIES ---

// Mock Router
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock SVGs for easy targeting
vi.mock("../SVG", () => ({
  ViewSVG: (props: any) => <div data-testid="icon-view" {...props} />,
  ViewOffSVG: (props: any) => <div data-testid="icon-view-off" {...props} />,
}));

// Mock Supabase
const mockSignUp = vi.fn();

vi.mock("@/contexts/SupabaseProvider", () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        signUp: mockSignUp,
      },
    },
  }),
}));

describe("SignUpForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders inputs and button", () => {
    render(<SignUpForm />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign up", { selector: "button" })).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<SignUpForm />);

    const passwordInput = screen.getByPlaceholderText("Password") as HTMLInputElement;

    // Default: Hidden
    expect(passwordInput.type).toBe("password");
    expect(screen.getByTestId("icon-view-off")).toBeInTheDocument();

    // Click toggle
    fireEvent.click(screen.getByTestId("icon-view-off"));

    // Now Visible
    expect(passwordInput.type).toBe("text");
    expect(screen.getByTestId("icon-view")).toBeInTheDocument();
  });

  it("displays error message returned by Supabase", async () => {
    // Mock Supabase Error
    mockSignUp.mockResolvedValue({
      data: {},
      error: { message: "Password is too short" },
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123" } });
    fireEvent.click(screen.getByText("Sign up", { selector: "button" }));

    await waitFor(() => {
      expect(screen.getByText("Password is too short")).toBeInTheDocument();
    });
  });

  it("handles 'Email already registered' scenario (Identities check)", async () => {
    // Logic: if(data.user?.identities?.length === 0)
    mockSignUp.mockResolvedValue({
      data: {
        user: { identities: [] }, // Empty array triggers the error
        session: null,
      },
      error: null,
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "existing@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password" } });
    fireEvent.click(screen.getByText("Sign up", { selector: "button" }));

    await waitFor(() => {
      expect(
        screen.getByText("Email already registered. Try signing in instead.")
      ).toBeInTheDocument();
    });
  });

  it("handles 'Verification Required' scenario (No Session)", async () => {
    // Logic: else if(!data.session)
    mockSignUp.mockResolvedValue({
      data: {
        user: { identities: [{ id: "identity-1" }] }, // Not empty
        session: null, // No session means email confirmation needed
      },
      error: null,
    });

    render(<SignUpForm />);
    
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "new@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "pass" } });
    fireEvent.click(screen.getByText("Sign up", { selector: "button" }));

    await waitFor(() => {
      expect(
        screen.getByText("Check your inbox to verify your email address before logging in.")
      ).toBeInTheDocument();
    });
  });

  it("redirects on immediate success (Session exists)", async () => {
    // Logic: else { router.replace... }
    mockSignUp.mockResolvedValue({
      data: {
        user: { identities: [{ id: "identity-1" }] },
        session: { access_token: "fake-token" }, // Session exists
      },
      error: null,
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "valid@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "validpass" } });
    fireEvent.click(screen.getByText("Sign up", { selector: "button" }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/auth/signin");
    });
  });
});