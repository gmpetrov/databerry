import WebBlablaForm, { name } from './form';
const initForm = async ({ formId }: { formId: string }) => {
  if (typeof window !== 'undefined' && !(window as any)?.WebBlablaForm) {
    if (!customElements.get(name)) {
      customElements.define(name, WebBlablaForm);
    }

    const element = new WebBlablaForm();

    const blblaForm = formId
      ? (document.querySelector(`${name}[id="${formId}"]`) as HTMLElement)
      : (document.querySelector(name) as HTMLElement);

    if (!blblaForm) {
      throw new Error(
        `<${name}> element${`${formId ? ` with ID ${formId}` : ``}`} not found.`
      );
    }

    const id = `BlablaForm_` + (formId || '');

    if (!(window as any)[id]) {
      (window as any)[id] = element;
      element.setAttribute('id', formId);
      blblaForm.replaceWith(element);
    }
  }
};

export default initForm;
