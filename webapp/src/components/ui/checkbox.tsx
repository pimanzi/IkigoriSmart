import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface CheckboxProps extends React.ComponentProps<'input'> {
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({ className, onCheckedChange, ...props }: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
    props.onChange?.(e);
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn(
          'peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary',
          className,
        )}
        onChange={handleChange}
        {...props}
      />
      <Check className="absolute h-3 w-3 left-0.5 top-0.5 text-primary-foreground pointer-events-none hidden peer-checked:block" />
    </div>
  );
}

export { Checkbox };
