import { AlertTriangle } from 'lucide-react';
import { DUMMY_NOTICE } from '../../data/dummyData';

export default function DemoNotice() {
  return (
    <div className="demo-banner mb-4">
      <AlertTriangle size={14} className="flex-shrink-0" />
      <span>{DUMMY_NOTICE}</span>
    </div>
  );
}
