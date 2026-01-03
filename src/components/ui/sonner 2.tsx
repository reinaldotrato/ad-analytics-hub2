import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      expand={true}
      richColors={false}
      closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast tryvia-toast-gradient group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-5 group-[.toaster]:min-h-[72px] group-[.toaster]:min-w-[320px]",
          title: "group-[.toast]:font-semibold group-[.toast]:text-slate-900 group-[.toast]:text-base group-[.toast]:leading-tight",
          description: "group-[.toast]:text-slate-600 group-[.toast]:text-sm group-[.toast]:mt-1",
          actionButton: "group-[.toast]:bg-slate-900 group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:hover:bg-slate-800",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-700 group-[.toast]:rounded-lg group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:text-sm group-[.toast]:hover:bg-slate-200",
          closeButton: "group-[.toast]:bg-slate-100 group-[.toast]:border-slate-200 group-[.toast]:text-slate-500 group-[.toast]:hover:bg-slate-200 group-[.toast]:hover:text-slate-700 group-[.toast]:transition-colors group-[.toast]:rounded-full",
        },
        duration: 4000,
      }}
      icons={{
        success: <CheckCircle className="h-6 w-6 text-emerald-500" />,
        error: <XCircle className="h-6 w-6 text-red-500" />,
        warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        info: <Info className="h-6 w-6 text-blue-500" />,
      }}
      style={{
        '--width': '400px',
      } as React.CSSProperties}
      {...props}
    />
  );
};

export { Toaster, toast };
