// [reference]: https://github.dev/bitovi/react-to-web-component
export function toCamelCase(dashedCase: string): string {
  return dashedCase.replace(/[-:]([a-z])/g, (_, b) => `${b.toUpperCase()}`);
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
