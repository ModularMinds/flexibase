import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogsTab } from "../LogsTab";
import { mailerApi } from "@/api";

// Mock the API
jest.mock("@/api", () => ({
  mailerApi: {
    get: jest.fn(),
  },
}));

const mockLogs = [
  {
    id: "log-1",
    recipient: "user1@example.com",
    subject: "Welcome!",
    status: "SENT",
    createdAt: "2023-01-01T10:00:00Z",
  },
  {
    id: "log-2",
    recipient: "user2@example.com",
    subject: "Failed Email",
    status: "FAILED",
    createdAt: "2023-01-02T11:00:00Z",
  },
];

describe("LogsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mailerApi.get as jest.Mock).mockResolvedValue({
      data: { data: { logs: mockLogs } },
    });
  });

  it("renders email logs correctly", async () => {
    render(<LogsTab />);

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("Welcome!")).toBeInTheDocument();
      expect(screen.getByText("SENT")).toBeInTheDocument();

      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
      expect(screen.getByText("Failed Email")).toBeInTheDocument();
      expect(screen.getByText("FAILED")).toBeInTheDocument();
    });
  });

  it("handles refresh", async () => {
    const user = userEvent.setup();
    render(<LogsTab />);

    await waitFor(() => screen.getByText("SENT"));

    const refreshButton = screen.getByText(/refresh/i);
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mailerApi.get).toHaveBeenCalledTimes(2);
    });
  });

  it("shows empty state when no logs exist", async () => {
    (mailerApi.get as jest.Mock).mockResolvedValue({
      data: { data: { logs: [] } },
    });

    render(<LogsTab />);

    await waitFor(() => {
      expect(screen.getByText(/no logs found/i)).toBeInTheDocument();
    });
  });
});
