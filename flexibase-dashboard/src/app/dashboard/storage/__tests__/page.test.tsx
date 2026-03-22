import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "../page";
import { storageApi } from "@/api";

// Mock the API
jest.mock("@/api", () => ({
  storageApi: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock FileUploadDialog to simplify page testing
jest.mock("@/components/custom/FileUploadDialog", () => ({
  FileUploadDialog: () => <div data-testid="upload-dialog">Upload Dialog</div>,
}));

const mockFiles = [
  {
    id: "file-1",
    originalName: "test.png",
    mimeType: "image/png",
    size: 2048,
    bucket: "default",
    createdAt: "2023-01-01T00:00:00Z",
    path: "/path/to/test.png",
  },
];

describe("StoragePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storageApi.get as jest.Mock).mockImplementation((url) => {
      if (url === "/service-check") return Promise.resolve({});
      if (url === "/files")
        return Promise.resolve({ data: { data: { files: mockFiles } } });
      if (url.includes("/url"))
        return Promise.resolve({
          data: { data: { url: "https://download.com" } },
        });
      return Promise.resolve({});
    });
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
    window.open = jest.fn();
  });

  it("renders files list when service is available", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("test.png")).toBeInTheDocument();
      expect(screen.getByText("image/png")).toBeInTheDocument();
      expect(screen.getByText("2.00 KB")).toBeInTheDocument();
    });
  });

  it("handles file download", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => screen.getByText("test.png"));

    const downloadButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("svg.lucide-download"));
    await user.click(downloadButtons[0]);

    await waitFor(() => {
      expect(storageApi.get).toHaveBeenCalledWith("/files/file-1/url");
      expect(window.open).toHaveBeenCalledWith(
        "https://download.com",
        "_blank",
      );
    });
  });

  it("handles file deletion", async () => {
    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => screen.getByText("test.png"));

    const deleteButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("svg.lucide-trash2"));
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this file?",
    );

    await waitFor(() => {
      expect(storageApi.delete).toHaveBeenCalledWith("/files/file-1");
    });
  });

  it("shows service unavailable banner when service check fails", async () => {
    (storageApi.get as jest.Mock).mockImplementation((url) => {
      if (url === "/service-check") return Promise.reject(new Error("Down"));
      return Promise.resolve({});
    });

    render(<Page />);

    await waitFor(() => {
      expect(
        screen.getByText(/storage service is offline/i),
      ).toBeInTheDocument();
    });
  });
});
