import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplatesTab } from "../TemplatesTab";
import { mailerApi } from "@/api";

// Mock the API
jest.mock("@/api", () => ({
  mailerApi: {
    get: jest.fn(),
  },
}));

// Mock the dialog to simplify tab testing
jest.mock("../TemplatePreviewDialog", () => ({
  TemplatePreviewDialog: ({ templateId, onClose }: any) =>
    templateId ? (
      <div data-testid="preview-dialog">
        {templateId} <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const mockTemplates = [
  { id: "tpl-1", name: "Welcome Email", type: "handlebars" },
  { id: "tpl-2", name: "Password Reset", type: "handlebars" },
];

describe("TemplatesTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mailerApi.get as jest.Mock).mockResolvedValue({
      data: { data: { templates: mockTemplates } },
    });
  });

  it("renders templates correctly", async () => {
    render(<TemplatesTab />);

    await waitFor(() => {
      expect(screen.getByText("Welcome Email")).toBeInTheDocument();
      expect(screen.getByText("Password Reset")).toBeInTheDocument();
    });
  });

  it("opens preview dialog on click", async () => {
    const user = userEvent.setup();
    render(<TemplatesTab />);

    await waitFor(() => screen.getByText("Welcome Email"));

    const previewButtons = screen.getAllByText(/preview/i);
    await user.click(previewButtons[0]);

    expect(screen.getByTestId("preview-dialog")).toHaveTextContent("tpl-1");
  });

  it("handles refresh", async () => {
    const user = userEvent.setup();
    render(<TemplatesTab />);

    await waitFor(() => screen.getByText("Welcome Email"));

    const refreshButton = screen.getByText(/refresh/i);
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mailerApi.get).toHaveBeenCalledTimes(2);
    });
  });
});
