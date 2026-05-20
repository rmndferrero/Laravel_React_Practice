export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-[#FF0000] bg-[#FF0000] px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-in-out hover:bg-[#e60000] focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:ring-offset-2 active:bg-[#b30000] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
