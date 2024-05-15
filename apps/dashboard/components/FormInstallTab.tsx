import Accordion from '@mui/joy/Accordion';
import AccordionDetails from '@mui/joy/AccordionDetails';
import AccordionGroup from '@mui/joy/AccordionGroup';
import AccordionSummary from '@mui/joy/AccordionSummary';
import Card from '@mui/joy/Card';
import React from 'react';

import Markdown from '@chaindesk/ui/Markdown';

type Props = {
  formId: string;
};

function FormInstallTab({ formId }: Props) {
  const installScript = `<script type="module">
  import Form from 'https://cdn.jsdelivr.net/npm/@chaindesk/embeds@latest/dist/form/index.js';

  Form.initStandard({
    formId: '${formId}',
  });
</script>

<chaindesk-form-standard style="width: 100%; height: 650px" />
`;
  const installScriptIframe = `<iframe
  src="${process.env.NEXT_PUBLIC_DASHBOARD_URL}/forms/${formId}"
  width="100%"
  height="100%"
  frameborder="0"
  allow="clipboard-write"
></iframe>
`;

  return (
    <Card sx={{ mx: 'auto' }}>
      <AccordionGroup size="lg">
        <Accordion defaultExpanded>
          <AccordionSummary>Web Component</AccordionSummary>
          <AccordionDetails>
            <Markdown>{`~~~html\n ${installScript} \n~~~`}</Markdown>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>iFrame</AccordionSummary>
          <AccordionDetails>
            <Markdown>{`~~~html\n ${installScriptIframe} \n~~~`}</Markdown>
          </AccordionDetails>
        </Accordion>

        {/* <Accordion>
          <AccordionSummary>Third accordion</AccordionSummary>
          <AccordionDetails>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </AccordionDetails>
        </Accordion> */}
      </AccordionGroup>
    </Card>
  );
}

export default FormInstallTab;
