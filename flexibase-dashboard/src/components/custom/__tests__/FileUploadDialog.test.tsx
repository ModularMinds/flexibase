import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUploadDialog } from "../FileUploadDialog";
import { storageApi } from "@/api";

// Mock the API
jest.mock("@/api", () => ({
  storageApi: {
    post: jest.fn(),
  },
}));

describe("FileUploadDialog", () => {
  const mockOnUploadSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  it("renders trigger button", () => {
    render(<FileUploadDialog onUploadSuccess={mockOnUploadSuccess} />);
    expect(screen.getByText(/upload file/i)).toBeInTheDocument();
  });

  it("handles file selection and upload", async () => {
    const user = userEvent.setup();
    render(<FileUploadDialog onUploadSuccess={mockOnUploadSuccess} />);

    await user.click(screen.getByRole("button", { name: /upload file/i }));

    const fileInput = screen.getByLabelText(/^file$/i);

    const bucketInput = screen.getByLabelText(/bucket/i);
    const uploadBtn = screen.getByRole("button", { name: "Upload" });

    expect(uploadBtn).toBeDisabled();

    // Create a mock file
    const file = new File(["hello"], "hello.png", { type: "image/png" });

    // fireEvent.change is sometimes better for file inputs in JSDOM
    fireEvent.change(fileInput, { target: { files: [file] } });

    await user.clear(bucketInput);
    await user.type(bucketInput, "test-bucket");

    expect(uploadBtn).not.toBeDisabled();

    (storageApi.post as jest.Mock).mockResolvedValue({});

    await user.click(uploadBtn);

    await waitFor(() => {
      expect(storageApi.post).toHaveBeenCalledWith(
        "/upload",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      expect(mockOnUploadSuccess).toHaveBeenCalled();
    });

    // Check FormData content
    const formData = (storageApi.post as jest.Mock).mock
      .calls[0][1] as FormData;
    expect(formData.get("file")).toEqual(file);
    expect(formData.get("bucket")).toBe("test-bucket");
    expect(formData.get("visibility")).toBe("PRIVATE");
  });
});
