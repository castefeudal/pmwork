// @vitest-environment jsdom
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import {afterEach,expect,it,vi} from "vitest";
import {ThemeSetting} from "./theme-setting";
import {ThemeToggle} from "./theme-toggle";
import {ResetDisplaySettings} from "./reset-display-settings";
afterEach(()=>{cleanup();localStorage.clear();delete document.documentElement.dataset.themePreference;delete document.documentElement.dataset.theme;delete document.documentElement.dataset.textSize;delete document.documentElement.dataset.contrast;vi.unstubAllGlobals();});
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
it("resets display settings without clearing unrelated local data",()=>{
  const reset=vi.fn();
  localStorage.setItem("pmwork:workspace:v3","keep");
  localStorage.setItem("pmwork-theme","dark");localStorage.setItem("pmwork-text-size","large");localStorage.setItem("pmwork-contrast","more");
  render(<ResetDisplaySettings locale="en" onResetDensity={reset}/>);
  fireEvent.click(screen.getByRole("button",{name:"Reset display settings"}));
  expect(reset).toHaveBeenCalledOnce();expect(localStorage.getItem("pmwork:workspace:v3")).toBe("keep");
  expect(localStorage.getItem("pmwork-theme")).toBeNull();expect(localStorage.getItem("pmwork-text-size")).toBeNull();expect(localStorage.getItem("pmwork-contrast")).toBeNull();
  expect(document.documentElement.dataset.textSize).toBe("standard");expect(document.documentElement.dataset.contrast).toBe("standard");
});
