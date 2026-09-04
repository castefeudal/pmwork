import { describe,expect,it } from "vitest";
import { calculateCPM,calculateEVM,calculatePERT,littleLaw,monteCarlo,rice,wsjf } from "./calculations";
import { governanceLevel,scoreApproaches } from "./method-fit";

describe("PM calculations",()=>{
  it("calculates CPM and float",()=>{ const r=calculateCPM([{id:"A",duration:3,predecessors:[]},{id:"B",duration:4,predecessors:["A"]},{id:"C",duration:2,predecessors:["A"]}]); expect(r.find(x=>x.id==="B")?.critical).toBe(true); expect(r.find(x=>x.id==="C")?.float).toBe(2); });
  it("rejects cycles",()=>expect(()=>calculateCPM([{id:"A",duration:1,predecessors:["B"]},{id:"B",duration:1,predecessors:["A"]}])).toThrow());
  it("calculates PERT",()=>expect(calculatePERT(2,5,8)).toEqual({expected:5,standardDeviation:1,variance:1}));
  it("rejects invalid PERT order",()=>expect(()=>calculatePERT(5,2,8)).toThrow());
  it("calculates EVM and handles zero",()=>{ expect(calculateEVM(100,90,80,200).cpi).toBeCloseTo(1.125); expect(calculateEVM(0,0,0,100).spi).toBeNull(); });
  it("calculates prioritization and flow",()=>{ expect(rice(100,2,80,4)).toBe(40); expect(wsjf(5,3,2,2)).toBe(5); expect(littleLaw(10,2).cycleTime).toBe(5); });
  it("produces deterministic forecast percentiles",()=>{ const r=monteCarlo([1,2,3],5,100,()=>.5); expect(r.p50).toBe(10); expect(r.p95).toBe(10); });
});
describe("method fit",()=>{it("prefers adaptive for volatile autonomous work",()=>{const r=scoreApproaches({uncertainty:5,volatility:5,feedback:5,frequency:5,compliance:1,dependencies:2,autonomy:5,scopeRigidity:1,deadlineRigidity:3,stakeholders:3});expect(r[0]?.approach).toBe("Adaptive");});it("raises governance when needed",()=>expect(governanceLevel({uncertainty:2,volatility:2,feedback:2,frequency:2,compliance:5,dependencies:3,autonomy:2,scopeRigidity:4,deadlineRigidity:5,stakeholders:4})).toBe("Controlled"));});
