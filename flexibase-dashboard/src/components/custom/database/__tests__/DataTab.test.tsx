import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTab } from "../DataTab";
import { dbApi } from "@/api";

// Mock the API
jest.mock("@/api", () => ({
  dbApi: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockColumns = ["id", "name", "age"];
const mockRows = [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob", age: 30 },
];

describe("DataTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (dbApi.get as jest.Mock).mockResolvedValue({
      data: { columns: mockColumns },
    });
    (dbApi.post as jest.Mock).mockImplementation((url) => {
      if (url === "/fetch-data") {
        return Promise.resolve({ data: { data: mockRows } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders table columns and rows", async () => {
    render(<DataTab tableName="users" />);

    // Wait for columns and data to load
    await waitFor(() => {
      expect(screen.getByText("id")).toBeInTheDocument();
      expect(screen.getByText("name")).toBeInTheDocument();
      expect(screen.getByText("age")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  it("handles adding a new row", async () => {
    const user = userEvent.setup();
    render(<DataTab tableName="users" />);

    await waitFor(() => screen.getByText("Alice"));

    const addRowButton = screen.getByRole("button", { name: /add row/i });
    await user.click(addRowButton);

    // Dialog should be open
    expect(
      screen.getByRole("heading", { name: /add row/i, level: 2 }),
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText("name");
    const ageInput = screen.getByLabelText("age");
    const saveButton = screen.getByText(/save/i);

    await user.type(nameInput, "Charlie");
    await user.type(ageInput, "35");

    await user.click(saveButton);

    await waitFor(() => {
      expect(dbApi.post).toHaveBeenCalledWith("/insert-data", {
        tableName: "users",
        data: expect.objectContaining({
          name: "Charlie",
          age: "35",
        }),
      });
    });
  });

  it("shows empty state when no data is found", async () => {
    (dbApi.post as jest.Mock).mockImplementation((url) => {
      if (url === "/fetch-data") {
        return Promise.resolve({ data: { data: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    render(<DataTab tableName="users" />);

    await waitFor(() => {
      expect(screen.getByText(/no data found/i)).toBeInTheDocument();
    });
  });
});
