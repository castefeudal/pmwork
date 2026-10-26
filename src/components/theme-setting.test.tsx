// @vitest-environment jsdom
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import {afterEach,expect,it,vi} from "vitest";
import {ThemeSetting} from "./theme-setting";
import {ThemeToggle} from "./theme-toggle";
afterEach(()=>{cleanup();localStorage.clear();delete document.documentElement.dataset.themePreference;delete document.documentElement.dataset.theme;vi.unstubAllGlobals();});
it("follows system changes and keeps manual selection independent",()=>{
  let dark=false; const listeners=new Set<()=>void>();
  vi.stubGlobal("matchMedia",()=>({get matches(){return dark;},addEventListener:(_name:string,fn:()=>void)=>listeners.add(fn),removeEventListener:(_name:string,fn:()=>void)=>listeners.delete(fn)}));
  document.documentElement.dataset.theme="light";
  render(<><ThemeSetting locale="en"/><ThemeToggle locale="en"/></>);
  fireEvent.change(screen.getByLabelText("Theme"),{target:{value:"system"}});
  dark=true; listeners.forEach(fn=>fn());
  expect(document.documentElement.dataset.theme).toBe("dark");
  fireEvent.change(screen.getByLabelText("Theme"),{target:{value:"light"}});
  expect(localStorage.getItem("pmwork-theme")).toBe("light");
  dark=false; listeners.forEach(fn=>fn()); dark=true; listeners.forEach(fn=>fn());
  expect(document.documentElement.dataset.theme).toBe("light");
  fireEvent.change(screen.getByLabelText("Theme"),{target:{value:"system"}});
  expect(localStorage.getItem("pmwork-theme")).toBeNull();
  expect(document.documentElement.dataset.theme).toBe("dark");
});
