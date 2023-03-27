import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Modal,
  ModalDialog,
  Sheet,
  Typography,
} from '@mui/joy';
import { LoadingButton } from '@mui/lab';
import { Step, StepContent, StepLabel, Stepper } from '@mui/material';
import {
  AppDatasource as Datasource,
  DatasourceType,
  Datastore,
  DatastoreType,
} from '@prisma/client';
import React from 'react';

import useStateReducer from '@app/hooks/useStateReducer';

import DatasourceOptions from './DatasourceForms/DatasourceOptions';
import { DatasourceFormProps } from './DatasourceForms/types';
import { DatasourceFormsMap } from './DatasourceForms';

type Props = {
  datastoreId?: string;
  isOpen?: boolean;
  onSubmitSuccess?: (datasource: Partial<Datasource>) => void;
  handleClose: () => void;
  // onSubmit: (values: CreateDatastoreRequestSchema) => void;
};

type State = {
  selectedStoreType?: DatastoreType;
  selectedSourceType?: DatasourceType;
  activeStep: number;
};

const initialState: State = {
  selectedStoreType: undefined,
  selectedSourceType: undefined,
  activeStep: 0,
};

export default function CreateDatastoreModal(props: Props) {
  const [state, setState] = useStateReducer<State>(initialState);

  const handleNext = () => {
    setState({
      activeStep: state.activeStep + 1,
    });
  };

  const handleBack = () => {
    setState({
      activeStep: state.activeStep - 1,
    });
  };

  const handleReset = () => {
    setState({
      activeStep: 0,
    });
  };

  const steps = [
    {
      label: 'Choose a Datasource',
      description: `An empty Datastore is not very useful! Now add some data in it`,
      disableButtons: true,
      component: (
        <DatasourceOptions
          onSelect={(value) => {
            setState({
              selectedSourceType: value,
            });
            handleNext();
          }}
        />
      ),
    },
    {
      label: 'Setup the Datasource',
      // description: `An empty Datastore is not very useful! Now add some data in it`,
      disableButtons: true,
      component:
        DatasourceFormsMap?.[state.selectedSourceType!] &&
        React.createElement(DatasourceFormsMap?.[state.selectedSourceType!], {
          defaultValues: {
            datastoreId: props.datastoreId,
          },
          onSubmitSuccess: (values) => {
            handleNext();

            props.handleClose();

            handleReset();

            props?.onSubmitSuccess?.(values);
          },
          customSubmitButton: (btnProps: any) => (
            <Box sx={{ mb: 2 }}>
              <div>
                <Button
                  type="submit"
                  loading={btnProps.isLoading}
                  variant="solid"
                  sx={{ mt: 1, mr: 1 }}
                >
                  Finish
                </Button>
                <Button
                  disabled={btnProps.isLoading}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                  variant="plain"
                >
                  Back
                </Button>
              </div>
            </Box>
          ),
        } as DatasourceFormProps),
    },
  ];

  return (
    <Modal
      onClose={props.handleClose}
      open={props.isOpen!}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: 600,
          maxWidth: '100%',
          borderRadius: 'md',
          p: 3,
          boxShadow: 'lg',
        }}
      >
        {/* <Alert severity="info">
          Datastores are used to store vectors reprentations of your data
          (embeddings).{' '}
          <Link href="" className="hover:underline" target="_blank">
            Learn more.
          </Link>
        </Alert> */}

        <>
          <Stepper activeStep={state.activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  optional={
                    index === 3 ? <Typography>Last step</Typography> : null
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <div className="flex flex-col space-y-4">
                    <Typography>{step.description}</Typography>
                    {step.component}

                    {!step.disableButtons && (
                      <Box sx={{ mb: 2 }}>
                        <div>
                          <Button
                            variant="soft"
                            onClick={handleNext}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            {index === steps.length - 1 ? 'Finish' : 'Continue'}
                          </Button>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            Back
                          </Button>
                        </div>
                      </Box>
                    )}
                  </div>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </>
      </Sheet>
    </Modal>
  );
}
