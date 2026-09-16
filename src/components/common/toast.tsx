
import { motion } from 'framer-motion';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Alert from '@mui/joy/Alert';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import { useToast } from '../../utils/toast-context';
import type { ToastProp } from '../../interfaces/ui.interfaces';



const Toast = ({ id, message, color, action}:ToastProp)=> {
  const { removeToast } = useToast();
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-center justify-between space-x-3  rounded shadow-lg `}
    >
              <Alert
          key={id}
          sx={{ alignItems: 'flex-start', width:'100%'}}
          startDecorator={color ==='danger' ? <ReportIcon className="h-5 w-5" /> : color === 'neutral'? <InfoIcon   className='h-5 w-5' /> : color === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : color === 'warning' ?<WarningIcon className='h-5 w-5' /> : null }
          variant="soft"
          color={color}
          endDecorator={
            <div className="flex items-center gap-1">
              {action && (
                <button
                  type="button"
                  onClick={() => { action.onClick(); removeToast(id); }}
                  className="font-semibold underline underline-offset-2 text-sm whitespace-nowrap"
                >
                  {action.label}
                </button>
              )}
              <IconButton variant="soft" color={color} onClick={() => removeToast(id)}>
              <CloseRoundedIcon />
              </IconButton>
            </div>
          }
        >
          <div>
            <div>{color === 'danger' ? 'Error' : color === 'success' ? 'Success' : color === 'neutral' ? 'Info' :color === 'warning' ? 'Caution' : null}</div>
            <Typography level="body-sm" color={color}>
            {message}
            </Typography>
          </div>
        </Alert>
    </motion.div>
  );
};

export default Toast;
