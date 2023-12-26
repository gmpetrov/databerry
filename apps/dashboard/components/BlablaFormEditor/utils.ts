export const forceSubmit = () => {
  try {
    (document.getElementById('blablaform-form-submit') as any)?.click?.();
  } catch (err) {}
};
