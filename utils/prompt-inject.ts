type Props = {
  template: string;
  query?: string;
  context?: string;
  extraInstructions?: string;
};

const promptInject = (props: Props) => {
  return props.template
    ?.replace('{query}', props.query || '')
    ?.replace('{context}', props.context || '')
    ?.replace('{extra}', props.extraInstructions || '');
};

export default promptInject;
