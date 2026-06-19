import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SidebarNavItem from "../../components/molecules/SidebarNavItem";
import { describe, it, expect } from "vitest";

describe("SidebarNavItem", () => {
  const DummyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="dummy-icon" {...props}>
      <path d="M0 0h24v24H0z" />
    </svg>
  );

  it("renders with label and icon when not collapsed", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <SidebarNavItem to="/dashboard" icon={DummyIcon} label="Dashboard" isCollapsed={false} />
      </MemoryRouter>
    );

    const icon = screen.getByTestId("dummy-icon");
    const label = screen.getByText("Dashboard");

    expect(icon).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it("hides label and sets title tooltip when collapsed", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <SidebarNavItem to="/dashboard" icon={DummyIcon} label="Dashboard" isCollapsed={true} />
      </MemoryRouter>
    );

    const icon = screen.getByTestId("dummy-icon");
    const label = screen.queryByText("Dashboard");

    expect(icon).toBeInTheDocument();
    expect(label).not.toBeInTheDocument();

    const navLink = screen.getByRole("link");
    expect(navLink).toHaveAttribute("title", "Dashboard");
  });

  it("applies active styles when current path matches destination", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <SidebarNavItem to="/dashboard" icon={DummyIcon} label="Dashboard" isCollapsed={false} />
      </MemoryRouter>
    );

    const navLink = screen.getByRole("link");
    expect(navLink).toHaveClass("bg-sidebar-active");
  });
});
