import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./header";
import { MemoryRouter } from "react-router";
import { AuthContext } from "../../../context/authContext";

// Mock useNavigate from react-router
const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

describe("Header Component", () => {
  const mockLogout = jest.fn();

  const renderWithContext = (user: any = null) => {
    return render(
      <AuthContext.Provider
        value={{
          currentUser: user,
          logout: mockLogout,
        }}
      >
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  test("renders logo and navigation links", () => {
    renderWithContext();

    expect(screen.getByText(/WanderSphere/i)).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/about/i)).toBeInTheDocument();
    expect(screen.getByText(/tour/i)).toBeInTheDocument();
    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });

  test("renders Log in and Register buttons when not logged in", () => {
    renderWithContext();

    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("navigates to login and register when buttons clicked", () => {
    renderWithContext();

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");

    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  test("renders logout when user is logged in", () => {
    renderWithContext({ username: "kun" });

    expect(screen.getByText("kun")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  test("logout calls logout function and navigates to home", () => {
    renderWithContext({ username: "kun" });

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });
});
