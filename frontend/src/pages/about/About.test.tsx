import React from "react";
import { render, screen } from "@testing-library/react";
import About from "./index";
import { MemoryRouter } from "react-router";

// Mock Header component if needed
jest.mock("../home/components/header", () => () => <div data-testid="header" />);

describe("About Page", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );
  });

  test("renders the header component", () => {
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  test("renders main headings", () => {
    expect(screen.getByText(/Your Journey, Your Story/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore, Connect, Inspire/i)).toBeInTheDocument();
  });


  test("renders footer text", () => {
    expect(screen.getByText(/Email: group8@northeastern.edu/i)).toBeInTheDocument();
    expect(screen.getByText(/Exploration/i)).toBeInTheDocument();
  });

  test("renders the team member profile images", () => {
    const images = screen.getAllByAltText("profile");
    expect(images.length).toBeGreaterThanOrEqual(6);
  });
});
