import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const baseStyle: React.CSSProperties = {
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 500,
  padding: '12px 16px',
  border: 'none',
  color: '#F1F5F9',
  backdropFilter: 'blur(12px)',
};

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="dark"
    className="toaster group"
    toastOptions={{
      style: {
        ...baseStyle,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      },
      classNames: {
        success: 'toast-success',
        error: 'toast-error',
        warning: 'toast-warning',
        info: 'toast-info',
        description: 'toast-description',
      },
    }}
    {...props}
  />
);

export { Toaster, toast } from "sonner";
export default Toaster;
