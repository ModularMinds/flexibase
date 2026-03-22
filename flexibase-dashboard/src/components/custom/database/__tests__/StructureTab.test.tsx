import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StructureTab } from "../StructureTab";
import { dbApi } from "@/api";

// Mock the API
jest.mock("@/api", () => ({
  dbApi: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockColumns = ["id", "email", "created_at"];

describe("StructureTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dbApi.get as jest.Mock).mockResolvedValue({
      data: { columns: mockColumns },
    });
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  it("renders table columns correctly", async () => {
    render(<StructureTab tableName="users" />);

    await waitFor(() => {
      expect(screen.getByText("id")).toBeInTheDocument();
      expect(screen.getByText("email")).toBeInTheDocument();
      expect(screen.getByText("created_at")).toBeInTheDocument();
    });
  });

  it("handles adding a new column", async () => {
    const user = userEvent.setup();
    render(<StructureTab tableName="users" />);

    await waitFor(() => screen.getByText("id"));

    const addColumnButton = screen.getByRole("button", { name: /add column/i });
    await user.click(addColumnButton);

    expect(
      screen.getByRole("heading", { name: /add new column/i, level: 2 }),
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/name/i);
    // Select component might be tricky to test with getByLabelText if not implemented with simple labels
    // But StructureTab uses Label with htmlFor="name"
    const constraintsInput = screen.getByLabelText(/constraints/i);
    const saveButton = screen.getByRole("button", { name: /save/i });

    await user.type(nameInput, "is_active");
    await user.type(constraintsInput, "DEFAULT true");

    (dbApi.patch as jest.Mock).mockResolvedValue({});

    await user.click(saveButton);

    await waitFor(() => {
      expect(dbApi.patch).toHaveBeenCalledWith("/admin/alter-table", {
        tableName: "users",
        action: "ADD",
        column: {
          name: "is_active",
          type: "VARCHAR(255)", // Default value
          constraints: "DEFAULT true",
        },
      });
    });
  });

  it("handles dropping a column", async () => {
    const user = userEvent.setup();
    render(<StructureTab tableName="users" />);

    await waitFor(() => screen.getByText("email"));

    // Find the trash icon for the 'email' column
    // The columns are mapped: index 1 is email.
    const trashButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("svg"));
    // email is second row, so index 1
    await user.click(trashButtons[1]);

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("email"),
    );

    await waitFor(() => {
      expect(dbApi.patch).toHaveBeenCalledWith("/admin/alter-table", {
        tableName: "users",
        action: "DROP",
        column: {
          name: "email",
        },
      });
    });
  });
});
