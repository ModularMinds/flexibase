import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuditLogsTab } from "../AuditLogsTab";
import { dbApi } from "@/api";

// Mock the API
jest.mock("@/api", () => ({
  dbApi: {
    get: jest.fn(),
  },
}));

const mockLogs = [
  {
    id: "log-1",
    user_id: "user-1",
    action: "INSERT",
    table_name: "users",
    record_id: "rec-1",
    timestamp: "2023-01-01T00:00:00Z",
    details: {},
  },
  {
    id: "log-2",
    user_id: "user-2",
    action: "DELETE",
    table_name: "users",
    record_id: "rec-2",
    timestamp: "2023-01-02T00:00:00Z",
    details: {},
  },
];

describe("AuditLogsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dbApi.get as jest.Mock).mockResolvedValue({
      data: { logs: mockLogs },
    });
  });

  it("renders audit logs correctly", async () => {
    render(<AuditLogsTab tableName="users" />);

    await waitFor(() => {
      expect(screen.getByText("user-1")).toBeInTheDocument();
      expect(screen.getByText("INSERT")).toBeInTheDocument();
      expect(screen.getByText("rec-1")).toBeInTheDocument();

      expect(screen.getByText("user-2")).toBeInTheDocument();
      expect(screen.getByText("DELETE")).toBeInTheDocument();
      expect(screen.getByText("rec-2")).toBeInTheDocument();
    });
  });

  it("handles refresh", async () => {
    const user = userEvent.setup();
    render(<AuditLogsTab tableName="users" />);

    await waitFor(() => screen.getByText("INSERT"));

    const refreshButton = screen.getByText(/refresh/i);
    await user.click(refreshButton);

    await waitFor(() => {
      expect(dbApi.get).toHaveBeenCalledTimes(2); // Initial + Refresh
    });
  });

  it("shows empty state when no logs are found", async () => {
    (dbApi.get as jest.Mock).mockResolvedValue({ data: { logs: [] } });

    render(<AuditLogsTab tableName="users" />);

    await waitFor(() => {
      expect(screen.getByText(/no logs found/i)).toBeInTheDocument();
    });
  });
});
