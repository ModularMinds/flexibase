import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "../page";
import { authApi } from "@/api";

// Mock the API
jest.mock("@/api", () => ({
  authApi: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
}));

const mockProfile = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  bio: "This is a test bio",
  avatarUrl: "https://example.com/avatar.png",
  role: "USER",
};

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authApi.get as jest.Mock).mockResolvedValue({
      data: { user: mockProfile },
    });
    window.alert = jest.fn();
  });

  it("renders profile details correctly", async () => {
    render(<ProfilePage />);

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("This is a test bio"),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("https://example.com/avatar.png"),
      ).toBeInTheDocument();
    });
  });

  it("handles profile update", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await waitFor(() => screen.getByDisplayValue("Test User"));

    const nameInput = screen.getByLabelText(/display name/i);
    const bioInput = screen.getByLabelText(/bio/i);
    const saveButton = screen.getByText(/save changes/i);

    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");
    await user.clear(bioInput);
    await user.type(bioInput, "Updated Bio");

    (authApi.patch as jest.Mock).mockResolvedValue({});

    await user.click(saveButton);

    await waitFor(() => {
      expect(authApi.patch).toHaveBeenCalledWith("/auth/me", {
        name: "Updated Name",
        bio: "Updated Bio",
        avatarUrl: "https://example.com/avatar.png",
      });
      expect(window.alert).toHaveBeenCalledWith("Profile updated successfully");
    });
  });

  it("handles password change in security tab", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await waitFor(() => screen.getByText("General Information"));

    // Switch to Security tab
    const securityTab = screen.getByText("Security");
    await user.click(securityTab);

    expect(screen.getByText("Password")).toBeInTheDocument();

    const oldPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const changePasswordButton = screen.getByText(/change password/i);

    await user.type(oldPasswordInput, "old-pass");
    await user.type(newPasswordInput, "new-pass");

    (authApi.post as jest.Mock).mockResolvedValue({});

    await user.click(changePasswordButton);

    await waitFor(() => {
      expect(authApi.post).toHaveBeenCalledWith("/auth/change-password", {
        oldPassword: "old-pass",
        newPassword: "new-pass",
      });
      expect(window.alert).toHaveBeenCalledWith(
        "Password changed successfully",
      );
    });
  });
});
