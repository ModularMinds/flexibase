import { render, screen } from "@testing-library/react";
import DashboardNavbar from "../DashboardNavbar";

// Mock useRouter since it's used in the component
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
}));

describe("DashboardNavbar", () => {
  it("renders the navbar with all service links", () => {
    render(<DashboardNavbar />);

    expect(screen.getByText("Services")).toBeInTheDocument();

    // Check for Logout button
    expect(screen.getByText("Logout")).toBeInTheDocument();

    // Check for Profile button
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });
});
