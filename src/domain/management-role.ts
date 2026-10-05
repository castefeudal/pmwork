export const managementRoles = ["project", "program", "delivery", "operations"] as const;
export type ManagementRole = typeof managementRoles[number];
export const roleLabels = {
  ru: { project: "Проект", program: "Программа", delivery: "Поставка результата", operations: "Постоянные операции" },
  en: { project: "Project", program: "Program", delivery: "Delivery", operations: "Ongoing operations" },
};
export const roleQuestions = {
  ru: { project: "Какой результат проекта требует вмешательства?", program: "Какая зависимость угрожает общему результату?", delivery: "Что мешает выполнить обещание поставки?", operations: "Что вышло за допустимые границы процесса?" },
  en: { project: "Which project outcome needs intervention?", program: "Which dependency threatens the shared outcome?", delivery: "What prevents meeting the delivery commitment?", operations: "What is outside the process operating limits?" },
};

export const roleMobileViews={project:["overview","work","planning","control"],program:["overview","program","work","raid"],delivery:["overview","delivery","work","planning"],operations:["overview","operations","work","control"]} as const;
