
import Toast from '../components/common/toast';
import { useToast } from './toast-context';
import { AnimatePresence } from 'framer-motion';

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-5 right-5 z-999 flex flex-col-reverse gap-2 w-87.5 max-w-full p-4">
      <AnimatePresence>
        {toasts.map(({ id, message, color, action }) => (
          <Toast key={id} id={id} message={message} color={color} action={action} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;