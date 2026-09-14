import {describe,expect,it} from 'vitest';
import {scoreMarkovmade} from './markovmade';
describe('MARKOVMADE priority',()=>{
 it('returns a bounded explainable score and sensitivity',()=>{const result=scoreMarkovmade({impact:9,frequency:8,evidence:7,riskReduction:8,strategicFit:9,effort:3,complexity:2,regressionRisk:2});expect(result.score).toBeGreaterThanOrEqual(70);expect(result.sensitivity.min).toBeLessThanOrEqual(result.score);expect(result.sensitivity.max).toBeGreaterThanOrEqual(result.score);expect(result.confidence).toBe('medium');});
 it('rejects invalid scales and zero effort',()=>{expect(()=>scoreMarkovmade({impact:11,frequency:1,evidence:1,riskReduction:1,strategicFit:1,effort:0,complexity:1,regressionRisk:1})).toThrow();});
});
