// @vitest-environment jsdom
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import {afterEach,expect,it,vi} from "vitest";
const route=vi.hoisted(()=>({pathname:"/en/workspace/"}));
vi.mock("next/navigation",()=>({usePathname:()=>route.pathname}));
import {PwaRegister} from "./pwa-register";
afterEach(()=>{cleanup();route.pathname="/en/workspace/";});
it("localizes the existing connectivity notice after changing locale",()=>{
  const {rerender}=render(<PwaRegister/>);
  fireEvent(window,new Event("offline"));
  expect(screen.getByRole("status").textContent).toContain("Offline");
  route.pathname="/pmwork/ru/workspace/";
  rerender(<PwaRegister/>);
  expect(screen.getByRole("status").textContent).toContain("Нет сети");
  fireEvent(window,new Event("online"));
  expect(screen.getByRole("status").textContent).toContain("Подключение восстановлено");
});
