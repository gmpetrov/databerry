import { Transition } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Divider, Typography } from '@mui/joy';
import CircularProgress from '@mui/joy/CircularProgress';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
// import { parseCookies } from 'nookies';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import Logo from '@app/components/Logo';
import { RouteNames } from '@app/types';

type Props = {
  // subscription: Subscription | null;
};

type Fields = {
  email: string;
  password: string;
};

const Schema = z.object({
  email: z.string().email(),
});

type Schema = z.infer<typeof Schema>;

export default function SignInPage() {
  // const { handleRedirects, handleSignInSuccess } = useAuth();
  const [globalFormError, setGlobalFormError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      setIsReady(true);
    } else if (status === 'authenticated') {
      router.push(RouteNames.HOME);
    }
  }, [status]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {},
  });

  const handleSubmitEmail = (values: Schema) => {
    signIn('email', { email: values.email });
  };

  return (
    <Box
      className="min-h-screen w-screen max-w-[100%] flex"
      sx={(theme) => ({
        background: theme.palette.background.surface,
      })}
    >
      <>
        <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="flex w-full max-w-sm mx-auto lg:w-96 ">
            {!isReady && (
              <CircularProgress size="sm" variant="soft" sx={{ mx: 'auto' }} />
            )}
            <Transition
              show={isReady}
              enter="duration-[350ms]"
              enterFrom="opacity-0 translate-y-[100px]"
              enterTo="opacity-100 translate-y-[0px] w-full"
              // leave="transition-opacity duration-150"
              // leaveFrom="opacity-100"
              // leaveTo="opacity-0"
            >
              <div className="flex flex-col items-center justify-center">
                <a href="https://databerry.ai">
                  <Logo className="cursor-pointer w-14" />
                </a>
                {/* <span className="w-8 h-8 mx-auto text-xl font-extrabold text-transparent rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></span> */}
                <Typography className="mt-2 text-3xl font-extrabold text-center">
                  Sign in
                </Typography>
              </div>

              <div className="w-full mt-8">
                <div className="w-full mt-6">
                  <form
                    className="flex flex-col w-full space-y-4"
                    onSubmit={handleSubmit(handleSubmitEmail)}
                  >
                    <Input
                      label="Email address"
                      control={control as any}
                      size="lg"
                      {...register('email')}
                    ></Input>

                    <Button
                      // disabled={!isValid}
                      type="submit"
                      variant="solid"
                      color="primary"
                      size="lg"
                      loading={isLoading}
                    >
                      Sign in
                    </Button>
                  </form>
                </div>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex justify-center">
                      <Divider sx={{ width: '100%', my: 'auto' }} />

                      {/* <div className="w-full border-t border-gray-500" /> */}
                    </div>
                    <div className="relative flex justify-center ">
                      <Typography
                        level="body3"
                        className="px-2"
                        sx={{ backgroundColor: 'background.surface' }}
                      >
                        Or continue with
                      </Typography>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mt-6 cursor-pointer">
                    <Button
                      size="lg"
                      onClick={() => signIn('google')}
                      // className="bg-white"
                      variant="outlined"
                      color="neutral"
                    >
                      <GoogleIcon />
                    </Button>

                    <Button
                      size="lg"
                      onClick={() => signIn('github')}
                      // className="bg-white"
                      variant="outlined"
                      color="neutral"
                    >
                      <GitHubIcon />
                    </Button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </>
    </Box>
  );
}
