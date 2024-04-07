export function toCamelCase(dashedCase: string): string {
  return dashedCase.replace(/[-:]([a-z])/g, (_, b) => `${b.toUpperCase()}`);
}

export function toDashedCase(camelCase: string) {
  return camelCase.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export const hookFunctionsToWindow = (attributes: object) => {
  for (const key in attributes) {
    if (typeof attributes[key as keyof typeof attributes] === 'function') {
      (window as any)[toCamelCase(key)] = function () {
        (attributes[key as keyof typeof attributes] as Function)();
      };
    }
  }
};
