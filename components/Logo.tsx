import clsx from "clsx";
import Image from "next/image";
import React, { forwardRef } from "react";

interface Props extends React.HtmlHTMLAttributes<HTMLImageElement> {
  src?: string;
}

const Logo = forwardRef<HTMLImageElement, Props>(
  ({ className, ...otherProps }: Props, ref) => {
    return (
      <Image
        ref={ref}
        {...(otherProps as any)}
        width="50"
        height="50"
        className={clsx("h-auto w-12", className)}
        alt="GriotAI"
        style={{
          maxWidth: "50%",
          height: "auto"
        }} />
    );
  }
);

Logo.defaultProps = {
  src: "/databerry-logo-icon.png",
};

export default Logo;
