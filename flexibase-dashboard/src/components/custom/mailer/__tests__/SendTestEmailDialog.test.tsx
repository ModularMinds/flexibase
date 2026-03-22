import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SendTestEmailDialog } from "../SendTestEmailDialog";
import { mailerApi } from "@/api";

// Mock the API
jest.mock("@/api", () => ({
  mailerApi: {
    post: jest.fn(),
  },
}));

describe("SendTestEmailDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  it("renders the trigger button", () => {
    render(<SendTestEmailDialog />);
    expect(screen.getByText(/send test email/i)).toBeInTheDocument();
  });

  it("opens dialog and handles email sending", async () => {
    const user = userEvent.setup();
    render(<SendTestEmailDialog />);

    const triggerBtn = screen.getByRole("button", { name: /send test email/i });
    await user.click(triggerBtn);

    // Check if dialog is open
    expect(
      screen.getByRole("heading", { name: /send test email/i, level: 2 }),
    ).toBeInTheDocument();

    const toInput = screen.getByLabelText(/to/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const bodyInput = screen.getByLabelText(/body \(html\)/i);
    const sendBtn = screen.getByRole("button", { name: /send email/i });

    // Initially disabled
    expect(sendBtn).toBeDisabled();

    await user.type(toInput, "test@example.com");
    await user.type(subjectInput, "Hello");
    await user.type(bodyInput, "<p>Test</p>");

    expect(sendBtn).not.toBeDisabled();

    (mailerApi.post as jest.Mock).mockResolvedValue({});

    await user.click(sendBtn);

    await waitFor(() => {
      expect(mailerApi.post).toHaveBeenCalledWith("/send", {
        to: "test@example.com",
        subject: "Hello",
        html: "<p>Test</p>",
        text: "Test",
      });
      expect(window.alert).toHaveBeenCalledWith("Email queued successfully!");
    });

    // Dialog should be closed (or at least fields reset, but component sets isOpen(false))
    // Note: Radix UI dialog might take a moment to unmount/hide
    await waitFor(() => {
      expect(screen.queryByText("To")).not.toBeInTheDocument();
    });
  });

  it("handles send error", async () => {
    const user = userEvent.setup();
    render(<SendTestEmailDialog />);

    await user.click(screen.getByRole("button", { name: /send test email/i }));

    await user.type(screen.getByLabelText(/to/i), "test@example.com");
    await user.type(screen.getByLabelText(/subject/i), "Hello");
    await user.type(screen.getByLabelText(/body \(html\)/i), "Test");

    (mailerApi.post as jest.Mock).mockRejectedValue(new Error("API Error"));

    await user.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("Failed to send email"),
      );
    });
  });
});
