import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "../page";
import { authApi, dbApi } from "@/api";
import { useRouter } from "next/navigation";

// Mock the APIs and Router
jest.mock("@/api", () => ({
  authApi: {
    get: jest.fn(),
  },
  dbApi: {
    get: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("DashboardPage", () => {
  let routerReplaceMock: jest.Mock;
  let routerPushMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    routerReplaceMock = jest.fn();
    routerPushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplaceMock,
      push: routerPushMock,
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    (authApi.get as jest.Mock).mockResolvedValue({
      data: { users: [{}, {}, {}] }, // 3 users
    });

    (dbApi.get as jest.Mock).mockResolvedValue({
      data: { tables: [{}, {}] }, // 2 tables
    });
  });

  it("redirects to / if not logged in", () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    render(<DashboardPage />);
    expect(routerReplaceMock).toHaveBeenCalledWith("/");
  });

  it("renders stats when logged in", async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue("admin");
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument(); // Users count
      expect(screen.getByText("2")).toBeInTheDocument(); // Tables count
    });

    expect(screen.getByText(/Total Authenticated Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Total SQL Tables/i)).toBeInTheDocument();
  });

  it("navigates to modules on card button click", async () => {
    const user = userEvent.setup();
    (window.localStorage.getItem as jest.Mock).mockReturnValue("admin");
    render(<DashboardPage />);

    await waitFor(() => screen.getByText("3"));

    const navigationButtons = screen.getAllByRole("button", { name: ">" });

    // Auth
    await user.click(navigationButtons[0]);
    expect(routerPushMock).toHaveBeenCalledWith("/dashboard/authentication");

    // DB
    await user.click(navigationButtons[1]);
    expect(routerPushMock).toHaveBeenCalledWith("/dashboard/database");

    // Storage
    await user.click(navigationButtons[2]);
    expect(routerPushMock).toHaveBeenCalledWith("/dashboard/storage");
  });
});
