import * as React from "react";

type FormInputProps =
    React.InputHTMLAttributes<HTMLInputElement> & {
        error?: string;
    };

const FormInput = React.forwardRef<
    HTMLInputElement,
    FormInputProps
>(({ error, className = "", ...props }, ref) => {
    return (
        <div className="w-full">
            <input
                ref={ref}
                {...props}
                className={`box-border h-11 w-full rounded-md border bg-white px-3.5 !text-[14px] leading-none text-[#40332A] outline-none transition-colors placeholder:!text-[12px] placeholder:text-[#999] hover:border-[#A57653] focus:border-[#A57653] ${
                    error
                        ? "border-red-400"
                        : "border-[#D6D6D6]"
                } ${className}`}
            />

            {error && (
                <p className="mt-1.5 text-[11px] leading-4 text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
});

FormInput.displayName = "FormInput";

export default FormInput;