import type { WorkspaceView } from "./workspace-types";

const sections: WorkspaceView[] = ["overview", "work", "board", "planning", "raid", "people", "finance", "control", "documents", "guide", "setup", "program", "delivery", "operations"];

/** Navigation plates use different diagrams, rather than repeating one logo. */
export function AtlasSectionMark({ view }: { view: WorkspaceView }) {
  const index = sections.indexOf(view) + 1;
  const network = ["overview", "people", "program", "delivery"].includes(view);
  const schedule = ["planning", "work", "board"].includes(view);
  return <div className="atlas-section-mark" aria-hidden="true"><span>{String(index).padStart(2, "0")} / PM</span><svg viewBox="0 0 180 84" fill="none">
    <path className="atlas-index-grid" d="M0 12H180M0 36H180M0 60H180M20 0V84M60 0V84M100 0V84M140 0V84"/>
    {network ? <><circle cx="90" cy="42" r="30" className="atlas-index-branch"/><path className="atlas-index-route" d="m20 66 70-24 60 24M90 42V8"/>{[[20,66],[90,42],[150,66],[90,8]].map(([x,y])=><circle key={x+y} cx={x} cy={y} r="4" className="atlas-index-node"/>)}</> : schedule ? <><path className="atlas-index-branch" d="M20 18H80V42H120V66H164"/><path className="atlas-index-route" strokeWidth="8" d="M20 18H64M80 42H112M120 66H164"/><path className="atlas-index-branch" strokeDasharray="3 3" d="M100 4V80"/></> : <><path className="atlas-index-branch" d="M36 12H144V72H36zM72 12V72M108 12V72M36 32H144M36 52H144"/><path className="atlas-index-route" d="m42 62 30-20 36 0 30-20"/><circle cx="108" cy="42" r="5" className="atlas-index-node"/></>}
  </svg></div>;
}
