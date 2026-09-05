export const route = (path: string) => `${process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : ""}${path}`;
