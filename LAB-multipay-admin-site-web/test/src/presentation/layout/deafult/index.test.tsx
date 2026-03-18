import React from "react";
import { render, screen } from "@testing-library/react";
import LayoutDefault from "@/presentation/layouts/default/index";

jest.mock("@/presentation/components/common/header/Header", () => () => (
  <div data-testid="navbar" />
));
jest.mock(
  "@/presentation/layouts/default/globalProviders/GlobalProviders",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      <div data-testid="global-providers">{children}</div>
);

describe("LayoutDefault", () => {
  it("deve renderizar corretamente o Navbar e os filhos", () => {
    render(
      <LayoutDefault>
        <div data-testid="child" />
      </LayoutDefault>
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("global-providers")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
