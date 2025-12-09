import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SignInForm from "./SignInForm";

// --- 1. MOCK DEPENDENCIES ---

// Mock Next.js Router
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

// Mock Custom SVGs (to make them easy to find and click)
vi.mock("@/components/SVG", () => ({
  ViewSVG: (props: any) => <svg data-testid="icon-view" {...props} />,
  ViewOffSVG: (props: any) => <svg data-testid="icon-view-off" {...props} />,
}));

// Mock Supabase Context
const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();

vi.mock("@/contexts/SupabaseProvider", () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signInWithOAuth: mockSignInWithOAuth,
      },
    },
  }),
}));

describe("SignInForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on window.alert because the component uses it for validation
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the form fields and buttons", () => {
    render(<SignInForm />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign in", { selector: "button" })).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("updates input values when typing", () => {
    render(<SignInForm />);

    const emailInput = screen.getByPlaceholderText("Email") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("Password") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("toggles password visibility", () => {
    render(<SignInForm />);

    const passwordInput = screen.getByPlaceholderText("Password") as HTMLInputElement;
    
    // 1. Initially hidden (type="password")
    // Note: Logic says `isPasswordHidden` defaults to true.
    // The component renders ViewOffSVG when hidden? 
    // Let's check logic: {isPasswordHidden ? <ViewOffSVG ... onClick={handleShowPassword}/> : <ViewSVG .../>}
    
    expect(passwordInput.type).toBe("password");
    const showIcon = screen.getByTestId("icon-view-off"); // This is the "Show" button essentially
    expect(showIcon).toBeInTheDocument();

    // 2. Click to show
    fireEvent.click(showIcon);

    // 3. Should be text now
    expect(passwordInput.type).toBe("text");
    const hideIcon = screen.getByTestId("icon-view");
    expect(hideIcon).toBeInTheDocument();

    // 4. Click to hide
    fireEvent.click(hideIcon);
    expect(passwordInput.type).toBe("password");
  });

  it("shows an alert if fields are empty on submit", () => {
    render(<SignInForm />);
    
    const submitBtn = screen.getByText("Sign in", { selector: "button" });

    // Submit without typing anything
    fireEvent.click(submitBtn);

    expect(window.alert).toHaveBeenCalledWith("Please enter your email and password");
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("handles successful email sign in", async () => {
    // Mock success response
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<SignInForm />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123456" } });

    // Submit
    fireEvent.click(screen.getByText("Sign in", { selector: "button" }));

    // Wait for async actions
    await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
            email: "user@test.com",
            password: "123456",
        });
    });

    // Check redirect
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("displays error message on failed email sign in", async () => {
    // Mock error response
    mockSignInWithPassword.mockResolvedValue({ 
        error: { message: "Invalid login credentials" } 
    });

    render(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "wrong@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrongpass" } });

    fireEvent.click(screen.getByText("Sign in", { selector: "button" }));

    // Wait for error message to appear in the DOM
    await waitFor(() => {
        expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
    });

    // Ensure we did NOT redirect
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("calls Google OAuth provider when clicking the Google button", async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });

    render(<SignInForm />);

    // The Google button is a generic button wrapper. 
    // We can find it by the text inside.
    const googleBtn = screen.getByText("Continue with Google").closest("button");
    
    if(!googleBtn) throw new Error("Google button not found");
    
    fireEvent.click(googleBtn);

    await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
            provider: "google"
        });
    });
  });
});