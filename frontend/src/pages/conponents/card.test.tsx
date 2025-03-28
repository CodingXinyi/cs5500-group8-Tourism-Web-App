import React from "react";
import { render, screen } from "@testing-library/react";
import Card from "./card"; // or './card' if your filename is lowercase

describe("Card Component", () => {
  test("renders image, title, location, and button", () => {
    render(<Card />);

    // Check image
    const image = screen.getByRole("img");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "pictures/scene1.jpg");

    // Check title
    const title = screen.getByText(/Karangan Beach/i);
    expect(title).toBeInTheDocument();

    // Check location text
    const location = screen.getByText(/Labuan Bajo, Indonesia/i);
    expect(location).toBeInTheDocument();

    // Check "Go Now!" button
    const button = screen.getByRole("button", { name: /Go Now!/i });
    expect(button).toBeInTheDocument();
  });

  test("wraps image in a tour page link", () => {
    render(<Card />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#/tour");
  });
});
