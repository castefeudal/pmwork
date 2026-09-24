import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const sha=process.env.GITHUB_SHA??execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const base=process.env.PMWORK_BASE_PATH??'root';
const unit=read('quality-evidence/unit.json');
const e2e=read('quality-evidence/e2e.json');
const performance=read('test-results/performance-bundles.json');
const cross=fs.existsSync('quality-evidence/cross-browser.json')?read('quality-evidence/cross-browser.json'):null;
if(!unit.success||unit.numFailedTests||e2e.stats.unexpected||(cross&&cross.stats.unexpected))throw Error('Failed tests cannot produce release evidence');
const release=read('out/release.json');
if(process.env.GITHUB_SHA&&release.commit!==sha)throw Error('Export belongs to a different commit');
const lab=[];
function collect(suites) {
  for(const suite of suites??[]) {
    for(const spec of suite.specs??[])for(const test of spec.tests??[]) {
      const result=test.results?.at(-1);
      if(result?.status!=='passed')continue;
      for(const attachment of result.attachments??[])if(['local-rendering-metrics','large-workspace-lab'].includes(attachment.name)&&attachment.body) {
        lab.push({test:spec.title,browser:test.projectName,...JSON.parse(Buffer.from(attachment.body,'base64').toString('utf8'))});
      }
    }
    collect(suite.suites);
  }
}
collect(e2e.suites);
const evidence={
  commit:sha,base,generatedAt:new Date().toISOString(),run:process.env.GITHUB_RUN_ID??null,
  unit:{total:unit.numTotalTests,passed:unit.numPassedTests,failed:unit.numFailedTests,pending:unit.numPendingTests},
  browser:e2e.stats,crossBrowser:cross?.stats??null,performance,lab,
  export:release,
  limits:['Lab measurements are not field CWV.','Automated accessibility tests are not WCAG certification.','Human usability is not measured.'],
};
fs.mkdirSync('quality-evidence',{recursive:true});
fs.writeFileSync('quality-evidence/release.json',JSON.stringify(evidence,null,2));
// Public evidence is written after all checks and carries the same commit as the tested export.
fs.writeFileSync('out/quality-evidence.json',JSON.stringify(evidence,null,2));
console.log(`Release evidence: ${sha} (${base}), ${unit.numPassedTests} unit tests, ${e2e.stats.expected} browser tests`);
