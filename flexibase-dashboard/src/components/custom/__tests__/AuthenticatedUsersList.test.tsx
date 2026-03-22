import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthenticatedUsersList from "../AuthenticatedUsersList";
import { authApi } from "@/api";
import { useFlexibaseAuth } from "@/context/FlexibaseAuthProvider";

// Mock the API and Context
jest.mock("@/api", () => ({
  authApi: {
    get: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock("@/context/FlexibaseAuthProvider", () => ({
  useFlexibaseAuth: jest.fn(),
}));

const mockUsers = [
  { id: "1", email: "user1@example.com", role: "ADMIN", isActive: true },
  { id: "2", email: "user2@example.com", role: "USER", isActive: false },
];

describe("AuthenticatedUsersList", () => {
  let triggerFetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    triggerFetchMock = jest.fn();
    (useFlexibaseAuth as jest.Mock).mockReturnValue({
      fetchKey: 0,
      triggerFetch: triggerFetchMock,
    });

    // Default mock implementation for fetching users
    (authApi.get as jest.Mock).mockResolvedValue({
      data: { users: mockUsers },
    });

    // Mock window.confirm and window.alert
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  it("renders a list of users", async () => {
    render(<AuthenticatedUsersList />);

    // Check for loading state first
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Suspended")).toBeInTheDocument();
  });

  it("handles user deletion", async () => {
    const user = userEvent.setup();
    render(<AuthenticatedUsersList />);

    await waitFor(() => screen.getByText("user1@example.com"));

    // Open the dropdown for the first user
    const dropdownTriggers = screen.getAllByRole("button", {
      name: /open menu/i,
    });
    await user.click(dropdownTriggers[0]);

    // Click delete
    const deleteBtn = await screen.findByText(/delete user/i);
    await user.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this user?",
    );

    await waitFor(() => {
      expect(authApi.delete).toHaveBeenCalledWith("/admin/users/1");
      expect(triggerFetchMock).toHaveBeenCalled();
    });
  });

  it("handles role update", async () => {
    const user = userEvent.setup();
    render(<AuthenticatedUsersList />);

    await waitFor(() => screen.getByText("user1@example.com"));

    // Open the dropdown for the second user (USER)
    const dropdownTriggers = screen.getAllByRole("button", {
      name: /open menu/i,
    });
    await user.click(dropdownTriggers[1]);

    // Click promote
    const promoteBtn = await screen.findByText(/promote to admin/i);
    await user.click(promoteBtn);

    await waitFor(() => {
      expect(authApi.patch).toHaveBeenCalledWith("/admin/users/2/role", {
        role: "ADMIN",
      });
      expect(triggerFetchMock).toHaveBeenCalled();
    });
  });

  it("handles status toggle", async () => {
    const user = userEvent.setup();
    render(<AuthenticatedUsersList />);

    await waitFor(() => screen.getByText("user1@example.com"));

    // Open the dropdown for the first user (Active)
    const dropdownTriggers = screen.getAllByRole("button", {
      name: /open menu/i,
    });
    await user.click(dropdownTriggers[0]);

    // Click suspend
    const suspendBtn = await screen.findByText(/suspend user/i);
    await user.click(suspendBtn);

    await waitFor(() => {
      expect(authApi.patch).toHaveBeenCalledWith("/admin/users/1/status", {
        isActive: false,
      });
      expect(triggerFetchMock).toHaveBeenCalled();
    });
  });

  it("shows empty state when no users are found", async () => {
    (authApi.get as jest.Mock).mockResolvedValue({ data: { users: [] } });

    render(<AuthenticatedUsersList />);

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });
});
