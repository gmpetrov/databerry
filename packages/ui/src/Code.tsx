import Markdown from './Markdown';

type Props = {
  code: string;
  lang: string;
};

function Code({ code, lang }: Props) {
  return <Markdown>{`~~~${lang}\n${code}\n~~~`}</Markdown>;
}

export default Code;
