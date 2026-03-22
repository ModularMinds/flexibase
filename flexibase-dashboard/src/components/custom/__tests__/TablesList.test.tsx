import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TablesList from "../TablesList";
import { dbApi } from "@/api";
import { useFlexibaseDB } from "@/context/FlexibaseDBProvider";
import { useRouter } from "next/navigation";

// Mock the API, Context and Router
jest.mock("@/api", () => ({
  dbApi: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/context/FlexibaseDBProvider", () => ({
  useFlexibaseDB: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockTables = ["users", "products", "orders"];

describe("TablesList", () => {
  let triggerFetchMock: jest.Mock;
  let routerPushMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    triggerFetchMock = jest.fn();
    routerPushMock = jest.fn();

    (useFlexibaseDB as jest.Mock).mockReturnValue({
      fetchKey: 0,
      triggerFetch: triggerFetchMock,
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
    });

    (dbApi.get as jest.Mock).mockResolvedValue({
      data: { tables: mockTables },
    });

    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  it("renders a list of tables", async () => {
    render(<TablesList />);

    await waitFor(() => {
      expect(screen.getByText("users")).toBeInTheDocument();
      expect(screen.getByText("products")).toBeInTheDocument();
      expect(screen.getByText("orders")).toBeInTheDocument();
    });
  });

  it("navigates to table view on click", async () => {
    const user = userEvent.setup();
    render(<TablesList />);

    await waitFor(() => screen.getByText("users"));

    const viewButtons = screen.getAllByText(/view/i);
    await user.click(viewButtons[0]);

    expect(routerPushMock).toHaveBeenCalledWith(
      "/dashboard/database/view/users",
    );
  });

  it("handles table deletion", async () => {
    const user = userEvent.setup();
    render(<TablesList />);

    await waitFor(() => screen.getByText("products"));

    const deleteButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.className.includes("destructive"));
    await user.click(deleteButtons[1]); // products

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("products"),
    );

    await waitFor(() => {
      expect(dbApi.delete).toHaveBeenCalledWith("/admin/delete-table", {
        data: { tableName: "products" },
      });
      expect(triggerFetchMock).toHaveBeenCalled();
    });
  });

  it("shows empty state when no tables exist", async () => {
    (dbApi.get as jest.Mock).mockResolvedValue({ data: { tables: [] } });

    render(<TablesList />);

    await waitFor(() => {
      expect(screen.getByText(/no tables found/i)).toBeInTheDocument();
    });
  });
});
