export type WorkspaceView =
  | "program"
  | "delivery"
  | "operations"
  | "portfolio"
  | "overview"
  | "guide"
  | "work"
  | "board"
  | "planning"
  | "raid"
  | "people"
  | "finance"
  | "control"
  | "documents"
  | "setup";
export const createTypes=["work","risk","issue","decision","assumption","milestone","dependency","stakeholder","budget","document","team","communication","change","quality","meeting","vendor","objective","iteration","project"] as const;
export type CreateType=typeof createTypes[number];
export const registerForCreate=(type:CreateType)=>type==="work"||type==="objective"?"work":["milestone","iteration","dependency"].includes(type)?"planning":["team","stakeholder","vendor","communication","meeting"].includes(type)?"people":type==="budget"?"finance":type==="document"?"documents":["quality","change"].includes(type)?"control":"raid";
