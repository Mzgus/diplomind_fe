import React from "react";
import { render, screen } from "@testing-library/react";
import SidebarIcon from "../../components/atoms/SidebarIcon";
import { describe, it, expect } from "vitest";

describe("SidebarIcon", () => {
  it("renders the given icon component with style classes", () => {
    const DummyIcon = (props: React.SVGProps<SVGSVGElement>) => (
      <svg data-testid="dummy-icon" {...props}>
        <path d="M0 0h24v24H0z" />
      </svg>
    );

    render(<SidebarIcon IconComponent={DummyIcon} className="text-red-500" />);

    const icon = screen.getByTestId("dummy-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("w-6");
    expect(icon).toHaveClass("h-6");
    expect(icon).toHaveClass("shrink-0");
    expect(icon).toHaveClass("text-red-500");
  });
});
