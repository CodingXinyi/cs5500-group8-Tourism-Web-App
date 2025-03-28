import React from "react";
import { render, screen } from "@testing-library/react";
import Contact from "./index"; // adjust path if needed

// What we’ll test:
// Header renders correctly
// Contact image is present
// Address and contact details are displayed
// Footer message is shown

jest.mock("../home/components/header", () => () => <div data-testid="mock-header" />);

describe("Contact Page", () => {
  test("renders Header component", () => {
    render(<Contact />);
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
  });

  test("displays the contact image", () => {
    render(<Contact />);
    const img = screen.getByAltText("contact");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/pictures/contact.jpg");
  });

  test("shows all contact addresses and info", () => {
    render(<Contact />);

    expect(screen.getByText(/123 Main St, Springfield, NY/i)).toBeInTheDocument();
    expect(screen.getByText(/456 Elm St, Chicago, IL/i)).toBeInTheDocument();
    expect(screen.getByText(/789 Oak St, Peoria, CA/i)).toBeInTheDocument();
    expect(screen.getByText(/Email: group8@northeastern.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Fax: \+1 \(408\) 382-1234/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone: \+1 \(408\) 382-1234/i)).toBeInTheDocument();
  });

  test("renders closing message", () => {
    render(<Contact />);
    expect(
      screen.getByText(/We Looking forward to providing you with an exceptional service experience/i)
    ).toBeInTheDocument();
  });
});
