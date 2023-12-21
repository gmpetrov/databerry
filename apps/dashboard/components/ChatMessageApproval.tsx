import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Typography from '@mui/joy/Typography';
import { ActionApproval } from '@prisma/client';
import React from 'react';

type Props = {
  approval: ActionApproval;
  showApproveButton?: boolean;
  onSumitSuccess?: () => any;
};

function ChatMessageApproval({
  approval,
  onSumitSuccess,
  showApproveButton,
}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Card size="sm" variant="outlined" color="warning" key={approval.id}>
      <Typography
        level="body-sm"
        startDecorator={<PublishedWithChangesRoundedIcon fontSize="md" />}
        color="warning"
      >
        {`Waiting for approval`}
      </Typography>
      <Divider />
      <Typography level="body-sm" color="warning">
        {`Action: `}
        <Typography fontWeight={'bold'}>
          {(approval as any).tool?.config?.name || approval.toolId}
        </Typography>
      </Typography>

      {Object.keys(approval.payload || {}).length > 0 && (
        <Typography level="body-sm" color="warning">
          {`Parameters: `}
          <Typography fontWeight={'bold'}>
            {JSON.stringify(approval.payload, null, 2)}
          </Typography>
        </Typography>
      )}
      {showApproveButton && <Divider />}
      {showApproveButton && (
        <>
          <Button
            color="success"
            variant="solid"
            size="sm"
            loading={isLoading}
            onClick={async () => {
              try {
                setIsLoading(true);
                await fetch(`/api/approvals/${approval.id}`, {
                  method: 'POST',
                });

                await onSumitSuccess?.();
              } catch (err) {
                console.log(err);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            Approve
          </Button>
        </>
      )}
    </Card>
  );
}

export default ChatMessageApproval;
